use chrono::{DateTime, Utc};
use parking_lot::Mutex;
use rusqlite::{params, Connection, Result as SqlResult};
use std::collections::HashMap;
use std::path::PathBuf;

use crate::{ActivityEvent, AppUsage, DailyStats, Session};

pub struct Database {
    conn: Mutex<Connection>,
}

impl Database {
    pub fn new() -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let db_path = Self::get_db_path()?;

        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let conn = Connection::open(&db_path)?;

        let db = Self {
            conn: Mutex::new(conn),
        };

        db.init_tables()?;

        log::info!("Database initialized at: {:?}", db_path);

        Ok(db)
    }

    fn get_db_path() -> Result<PathBuf, Box<dyn std::error::Error + Send + Sync>> {
        let proj_dirs = directories::ProjectDirs::from("com", "vibetrack", "desktop")
            .ok_or("Failed to get project directories")?;

        Ok(proj_dirs.data_dir().join("vibetrack.db"))
    }

    fn init_tables(&self) -> SqlResult<()> {
        let conn = self.conn.lock();

        conn.execute(
            "CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                started_at TEXT NOT NULL,
                ended_at TEXT,
                total_duration_seconds REAL DEFAULT 0,
                productive_time_seconds REAL DEFAULT 0,
                neutral_time_seconds REAL DEFAULT 0,
                distracting_time_seconds REAL DEFAULT 0,
                idle_time_seconds REAL DEFAULT 0,
                event_count INTEGER DEFAULT 0,
                avg_productivity_score REAL DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )",
            [],
        )?;

        conn.execute(
            "CREATE TABLE IF NOT EXISTS events (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                timestamp TEXT NOT NULL,
                app_name TEXT NOT NULL,
                app_category TEXT NOT NULL,
                window_title TEXT,
                duration_seconds REAL NOT NULL,
                keystrokes INTEGER DEFAULT 0,
                mouse_clicks INTEGER DEFAULT 0,
                is_idle INTEGER DEFAULT 0,
                productivity_score REAL DEFAULT 0,
                synced INTEGER DEFAULT 0,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES sessions(id)
            )",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)",
            [],
        )?;

        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_events_synced ON events(synced)",
            [],
        )?;

        Ok(())
    }

    pub fn save_session(&self, session: &Session) -> SqlResult<()> {
        let conn = self.conn.lock();

        conn.execute(
            "INSERT OR REPLACE INTO sessions 
             (id, user_id, started_at, ended_at, total_duration_seconds, 
              productive_time_seconds, neutral_time_seconds, distracting_time_seconds, 
              idle_time_seconds, event_count, avg_productivity_score)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            params![
                session.id,
                session.user_id,
                session.started_at.to_rfc3339(),
                session.ended_at.map(|t| t.to_rfc3339()),
                session.total_duration_seconds,
                session.productive_time_seconds,
                session.neutral_time_seconds,
                session.distracting_time_seconds,
                session.idle_time_seconds,
                session.event_count,
                session.avg_productivity_score,
            ],
        )?;

        Ok(())
    }

    pub fn get_session(&self, id: &str) -> SqlResult<Session> {
        let conn = self.conn.lock();

        conn.query_row(
            "SELECT id, user_id, started_at, ended_at, total_duration_seconds,
                    productive_time_seconds, neutral_time_seconds, distracting_time_seconds,
                    idle_time_seconds, event_count, avg_productivity_score
             FROM sessions WHERE id = ?1",
            params![id],
            |row| {
                Ok(Session {
                    id: row.get(0)?,
                    user_id: row.get(1)?,
                    started_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                        .map(|dt| dt.with_timezone(&Utc))
                        .unwrap_or_else(|_| Utc::now()),
                    ended_at: row
                        .get::<_, Option<String>>(3)?
                        .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
                        .map(|dt| dt.with_timezone(&Utc)),
                    total_duration_seconds: row.get(4)?,
                    productive_time_seconds: row.get(5)?,
                    neutral_time_seconds: row.get(6)?,
                    distracting_time_seconds: row.get(7)?,
                    idle_time_seconds: row.get(8)?,
                    event_count: row.get(9)?,
                    avg_productivity_score: row.get(10)?,
                })
            },
        )
    }

    pub fn update_session(&self, session: &Session) -> SqlResult<()> {
        let conn = self.conn.lock();

        conn.execute(
            "UPDATE sessions SET 
             ended_at = ?2, total_duration_seconds = ?3, productive_time_seconds = ?4,
             neutral_time_seconds = ?5, distracting_time_seconds = ?6, idle_time_seconds = ?7,
             event_count = ?8, avg_productivity_score = ?9
             WHERE id = ?1",
            params![
                session.id,
                session.ended_at.map(|t| t.to_rfc3339()),
                session.total_duration_seconds,
                session.productive_time_seconds,
                session.neutral_time_seconds,
                session.distracting_time_seconds,
                session.idle_time_seconds,
                session.event_count,
                session.avg_productivity_score,
            ],
        )?;

        Ok(())
    }

    pub fn save_event(&self, session_id: &str, event: &ActivityEvent) -> SqlResult<()> {
        let conn = self.conn.lock();

        conn.execute(
            "INSERT INTO events 
             (id, session_id, timestamp, app_name, app_category, window_title,
              duration_seconds, keystrokes, mouse_clicks, is_idle, productivity_score, synced)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)",
            params![
                event.id,
                session_id,
                event.timestamp.to_rfc3339(),
                event.app_name,
                event.app_category,
                event.window_title,
                event.duration_seconds,
                event.keystrokes,
                event.mouse_clicks,
                event.is_idle as i32,
                event.productivity_score,
                event.synced as i32,
            ],
        )?;

        Ok(())
    }

    pub fn get_unsynced_events(&self, session_id: &str) -> SqlResult<Vec<ActivityEvent>> {
        let conn = self.conn.lock();

        let mut stmt = conn.prepare(
            "SELECT id, timestamp, app_name, app_category, window_title,
                    duration_seconds, keystrokes, mouse_clicks, is_idle, productivity_score
             FROM events WHERE session_id = ?1 AND synced = 0
             ORDER BY timestamp ASC LIMIT 100",
        )?;

        let events = stmt.query_map(params![session_id], |row| {
            Ok(ActivityEvent {
                id: row.get(0)?,
                timestamp: DateTime::parse_from_rfc3339(&row.get::<_, String>(1)?)
                    .map(|dt| dt.with_timezone(&Utc))
                    .unwrap_or_else(|_| Utc::now()),
                app_name: row.get(2)?,
                app_category: row.get(3)?,
                window_title: row.get(4)?,
                duration_seconds: row.get(5)?,
                keystrokes: row.get(6)?,
                mouse_clicks: row.get(7)?,
                is_idle: row.get::<_, i32>(8)? != 0,
                productivity_score: row.get(9)?,
                synced: true,
            })
        })?;

        events.collect()
    }

    pub fn mark_event_synced(&self, event_id: &str) -> SqlResult<()> {
        let conn = self.conn.lock();
        conn.execute(
            "UPDATE events SET synced = 1 WHERE id = ?1",
            params![event_id],
        )?;
        Ok(())
    }

    pub fn get_session_stats(&self, session_id: &str) -> SqlResult<HashMap<String, f64>> {
        let conn = self.conn.lock();

        let mut stats = HashMap::new();

        let mut stmt = conn.prepare(
            "SELECT app_category, SUM(duration_seconds) as total
             FROM events WHERE session_id = ?1 AND is_idle = 0
             GROUP BY app_category",
        )?;

        let rows = stmt.query_map(params![session_id], |row| {
            Ok((row.get::<_, String>(0)?, row.get::<_, f64>(1)?))
        })?;

        for row in rows {
            if let Ok((category, duration)) = row {
                stats.insert(category, duration);
            }
        }

        let idle: f64 = conn.query_row(
            "SELECT COALESCE(SUM(duration_seconds), 0) FROM events WHERE session_id = ?1 AND is_idle = 1",
            params![session_id],
            |row| row.get(0),
        )?;

        stats.insert("idle".to_string(), idle);

        Ok(stats)
    }

    pub fn get_app_usage(&self, date: &str, user_id: &str) -> SqlResult<Vec<AppUsage>> {
        let conn = self.conn.lock();

        let mut stmt = conn.prepare(
            "SELECT e.app_name, e.app_category, 
                    SUM(e.duration_seconds) as total_time,
                    COUNT(*) as session_count,
                    AVG(e.productivity_score) as avg_score
             FROM events e
             JOIN sessions s ON e.session_id = s.id
             WHERE date(e.timestamp) = ?1 AND s.user_id = ?2 AND e.is_idle = 0
             GROUP BY e.app_name
             ORDER BY total_time DESC
             LIMIT 20",
        )?;

        let apps = stmt.query_map(params![date, user_id], |row| {
            let total: f64 = row.get(2)?;
            Ok(AppUsage {
                app_name: row.get(0)?,
                category: row.get(1)?,
                total_seconds: total,
                session_count: row.get(3)?,
                avg_duration: if let Ok(count) = row.get::<_, u32>(3) {
                    total / count as f64
                } else {
                    0.0
                },
                productivity_score: row.get(4)?,
            })
        })?;

        apps.collect()
    }

    pub fn get_daily_stats(
        &self,
        date: &str,
        user_id: &str,
    ) -> Result<DailyStats, Box<dyn std::error::Error + Send + Sync>> {
        let conn = self.conn.lock();

        let mut stmt = conn.prepare(
            "SELECT 
                COALESCE(SUM(total_duration_seconds), 0) as total,
                COALESCE(SUM(productive_time_seconds), 0) as productive,
                COALESCE(SUM(neutral_time_seconds), 0) as neutral,
                COALESCE(SUM(distracting_time_seconds), 0) as distracting,
                COALESCE(SUM(idle_time_seconds), 0) as idle,
                COALESCE(AVG(avg_productivity_score), 0) as avg_score
             FROM sessions 
             WHERE date(started_at) = ?1 AND user_id = ?2",
        )?;

        let (total, productive, neutral, distracting, idle, avg_score): (
            f64,
            f64,
            f64,
            f64,
            f64,
            f64,
        ) = stmt.query_row(params![date, user_id], |row| {
            Ok((
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                row.get(3)?,
                row.get(4)?,
                row.get(5)?,
            ))
        })?;

        drop(stmt);
        drop(conn);

        let top_apps = self.get_app_usage(date, user_id)?;

        Ok(DailyStats {
            date: date.to_string(),
            total_hours: total / 3600.0,
            productive_hours: productive / 3600.0,
            neutral_hours: neutral / 3600.0,
            distracting_hours: distracting / 3600.0,
            idle_hours: idle / 3600.0,
            top_apps,
            avg_productivity_score: avg_score,
        })
    }

    pub fn get_sessions_in_range(
        &self,
        start_date: &str,
        end_date: &str,
        user_id: &str,
    ) -> SqlResult<Vec<Session>> {
        let conn = self.conn.lock();

        let mut stmt = conn.prepare(
            "SELECT id, user_id, started_at, ended_at, total_duration_seconds,
                    productive_time_seconds, neutral_time_seconds, distracting_time_seconds,
                    idle_time_seconds, event_count, avg_productivity_score
             FROM sessions 
             WHERE date(started_at) BETWEEN ?1 AND ?2 AND user_id = ?3
             ORDER BY started_at DESC",
        )?;

        let sessions = stmt.query_map(params![start_date, end_date, user_id], |row| {
            Ok(Session {
                id: row.get(0)?,
                user_id: row.get(1)?,
                started_at: DateTime::parse_from_rfc3339(&row.get::<_, String>(2)?)
                    .map(|dt| dt.with_timezone(&Utc))
                    .unwrap_or_else(|_| Utc::now()),
                ended_at: row
                    .get::<_, Option<String>>(3)?
                    .and_then(|s| DateTime::parse_from_rfc3339(&s).ok())
                    .map(|dt| dt.with_timezone(&Utc)),
                total_duration_seconds: row.get(4)?,
                productive_time_seconds: row.get(5)?,
                neutral_time_seconds: row.get(6)?,
                distracting_time_seconds: row.get(7)?,
                idle_time_seconds: row.get(8)?,
                event_count: row.get(9)?,
                avg_productivity_score: row.get(10)?,
            })
        })?;

        sessions.collect()
    }
}
