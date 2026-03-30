#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod tracker;
mod database;
mod productivity;

use chrono::{DateTime, Utc, Duration as ChronoDuration};
use parking_lot::Mutex;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use std::time::Instant;
use tauri::{Manager, State, WindowEvent};
use uuid::Uuid;

pub use database::Database;
pub use tracker::ActivityTracker;
pub use productivity::ProductivityAnalyzer;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivityEvent {
    pub id: String,
    pub timestamp: DateTime<Utc>,
    pub app_name: String,
    pub app_category: String,
    pub window_title: String,
    pub duration_seconds: f64,
    pub keystrokes: u32,
    pub mouse_clicks: u32,
    pub is_idle: bool,
    pub productivity_score: f64,
    pub synced: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Session {
    pub id: String,
    pub user_id: String,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub total_duration_seconds: f64,
    pub productive_time_seconds: f64,
    pub neutral_time_seconds: f64,
    pub distracting_time_seconds: f64,
    pub idle_time_seconds: f64,
    pub event_count: u32,
    pub avg_productivity_score: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AppUsage {
    pub app_name: String,
    pub category: String,
    pub total_seconds: f64,
    pub session_count: u32,
    pub avg_duration: f64,
    pub productivity_score: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DailyStats {
    pub date: String,
    pub total_hours: f64,
    pub productive_hours: f64,
    pub neutral_hours: f64,
    pub distracting_hours: f64,
    pub idle_hours: f64,
    pub top_apps: Vec<AppUsage>,
    pub avg_productivity_score: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TrackingStatus {
    pub is_tracking: bool,
    pub session_id: Option<String>,
    pub current_app: Option<String>,
    pub current_category: Option<String>,
    pub session_duration_seconds: f64,
    pub event_count: u32,
    pub is_idle: bool,
    pub idle_seconds: u64,
    pub today_stats: DailyStats,
}

pub struct AppState {
    pub db: Arc<Database>,
    pub tracker: Arc<ActivityTracker>,
    pub productivity: Arc<ProductivityAnalyzer>,
    pub session_id: Mutex<Option<String>>,
    pub session_start: Mutex<Option<Instant>>,
    pub event_count: Mutex<u32>,
    pub last_activity: Mutex<Instant>,
    pub is_tracking: Mutex<bool>,
}

impl AppState {
    pub fn new() -> Result<Self, Box<dyn std::error::Error + Send + Sync>> {
        let db = Arc::new(Database::new()?);
        let tracker = Arc::new(ActivityTracker::new());
        let productivity = Arc::new(ProductivityAnalyzer::new());
        
        Ok(Self {
            db,
            tracker,
            productivity,
            session_id: Mutex::new(None),
            session_start: Mutex::new(None),
            event_count: Mutex::new(0),
            last_activity: Mutex::new(Instant::now()),
            is_tracking: Mutex::new(false),
        })
    }
}

const IDLE_THRESHOLD_SECS: u64 = 120;

#[tauri::command]
async fn start_tracking(
    state: State<'_, AppState>,
    user_id: String,
) -> Result<TrackingStatus, String> {
    let session_id = Uuid::new_v4().to_string();
    let now = Utc::now();
    
    {
        let mut is_tracking = state.is_tracking.lock();
        if *is_tracking {
            return Err("Tracking already started".to_string());
        }
        *is_tracking = true;
    }
    
    *state.session_id.lock() = Some(session_id.clone());
    *state.session_start.lock() = Some(Instant::now());
    *state.event_count.lock() = 0;
    *state.last_activity.lock() = Instant::now();

    let session = Session {
        id: session_id.clone(),
        user_id: user_id.clone(),
        started_at: now,
        ended_at: None,
        total_duration_seconds: 0.0,
        productive_time_seconds: 0.0,
        neutral_time_seconds: 0.0,
        distracting_time_seconds: 0.0,
        idle_time_seconds: 0.0,
        event_count: 0,
        avg_productivity_score: 0.0,
    };

    state.db.save_session(&session).map_err(|e| e.to_string())?;
    
    log::info!("Tracking started with session: {}", session_id);

    get_tracking_status(state).await
}

#[tauri::command]
async fn stop_tracking(state: State<'_, AppState>) -> Result<Session, String> {
    let is_tracking = *state.is_tracking.lock();
    if !is_tracking {
        return Err("Tracking not started".to_string());
    }

    let session_id = state.session_id.lock().take();
    let session_start = state.session_start.lock().take();
    
    *state.is_tracking.lock() = false;

    if let (Some(sid), Some(start)) = (session_id, session_start) {
        let duration = start.elapsed().as_secs_f64();
        let event_count = *state.event_count.lock();
        
        let mut session = state.db.get_session(&sid).map_err(|e| e.to_string())?;
        session.ended_at = Some(Utc::now());
        session.total_duration_seconds = duration;
        session.event_count = event_count;
        
        let stats = state.db.get_session_stats(&sid).map_err(|e| e.to_string())?;
        session.productive_time_seconds = stats.get("productive").copied().unwrap_or(0.0);
        session.neutral_time_seconds = stats.get("neutral").copied().unwrap_or(0.0);
        session.distracting_time_seconds = stats.get("distracting").copied().unwrap_or(0.0);
        session.idle_time_seconds = stats.get("idle").copied().unwrap_or(0.0);
        
        if duration > 0.0 {
            session.avg_productivity_score = 
                (session.productive_time_seconds - session.distracting_time_seconds) / duration;
        }

        state.db.update_session(&session).map_err(|e| e.to_string())?;
        
        log::info!("Tracking stopped. Session: {}, Duration: {:.1}s, Events: {}", 
            sid, duration, event_count);
        
        Ok(session)
    } else {
        Err("No active session".to_string())
    }
}

#[tauri::command]
async fn get_tracking_status(state: State<'_, AppState>) -> Result<TrackingStatus, String> {
    let is_tracking = *state.is_tracking.lock();
    let session_id = state.session_id.lock().clone();
    let session_start = state.session_start.lock();
    let event_count = *state.event_count.lock();
    let last_activity = *state.last_activity.lock();

    let idle_seconds = last_activity.elapsed().as_secs();
    let is_idle = idle_seconds > IDLE_THRESHOLD_SECS;

    let current = state.tracker.get_current_app();
    let current_category = current.as_ref().map(|app| {
        state.productivity.categorize_app(app)
    });

    let session_duration = session_start
        .map(|s| s.elapsed().as_secs_f64())
        .unwrap_or(0.0);

    let today = Utc::now().format("%Y-%m-%d").to_string();
    let today_stats = state.db.get_daily_stats(&today, "1").map_err(|e| e.to_string())?;

    Ok(TrackingStatus {
        is_tracking,
        session_id,
        current_app: current,
        current_category,
        session_duration_seconds: session_duration,
        event_count,
        is_idle,
        idle_seconds,
        today_stats,
    })
}

#[tauri::command]
async fn record_activity(
    state: State<'_, AppState>,
    app_name: String,
    window_title: String,
    duration_seconds: f64,
    keystrokes: u32,
    mouse_clicks: u32,
) -> Result<(), String> {
    let is_tracking = *state.is_tracking.lock();
    if !is_tracking {
        return Ok(());
    }

    let session_id = state.session_id.lock().clone();
    let last_activity = &mut *state.last_activity.lock();
    
    let idle_seconds = last_activity.elapsed().as_secs();
    let is_idle = idle_seconds > IDLE_THRESHOLD_SECS;

    if !is_idle {
        *last_activity = Instant::now();
    }

    let category = state.productivity.categorize_app(&app_name);
    let productivity_score = state.productivity.calculate_score(
        &app_name, 
        keystrokes, 
        mouse_clicks, 
        duration_seconds
    );

    let event = ActivityEvent {
        id: Uuid::new_v4().to_string(),
        timestamp: Utc::now(),
        app_name: app_name.clone(),
        app_category: category.clone(),
        window_title,
        duration_seconds,
        keystrokes,
        mouse_clicks,
        is_idle,
        productivity_score,
        synced: false,
    };

    if let Some(sid) = session_id.as_ref() {
        state.db.save_event(sid, &event).map_err(|e| e.to_string())?;
        *state.event_count.lock() += 1;
    }

    log::debug!("Activity: {} ({}) - {:.1}s, score: {:.2}", 
        app_name, category, duration_seconds, productivity_score);

    Ok(())
}

#[tauri::command]
async fn sync_events(state: State<'_, AppState>) -> Result<u32, String> {
    let session_id = state.session_id.lock().clone();
    if let Some(sid) = session_id {
        let unsynced = state.db.get_unsynced_events(&sid).map_err(|e| e.to_string())?;
        let count = unsynced.len();
        
        if count > 0 {
            let client = reqwest::Client::new();
            
            for event in unsynced.iter().take(50) {
                let payload = serde_json::json!({
                    "session_id": sid,
                    "user_id": "1",
                    "event_type": "activity",
                    "source": "desktop",
                    "content": serde_json::to_string(event).unwrap_or_default(),
                    "duration_seconds": event.duration_seconds,
                    "app_category": event.app_category,
                    "productivity_score": event.productivity_score,
                    "is_idle": event.is_idle,
                });

                let _ = client
                    .post("http://localhost:8000/api/event")
                    .json(&payload)
                    .timeout(std::time::Duration::from_secs(5))
                    .send()
                    .await;
            }

            for event in unsynced.iter().take(50) {
                state.db.mark_event_synced(&event.id).ok();
            }

            log::info!("Synced {} events to server", count.min(50));
        }
        
        Ok(count as u32)
    } else {
        Ok(0)
    }
}

#[tauri::command]
async fn get_app_usage(state: State<'_, AppState>, date: String) -> Result<Vec<AppUsage>, String> {
    state.db.get_app_usage(&date, "1").map_err(|e| e.to_string())
}

#[tauri::command]
async fn get_weekly_stats(state: State<'_, AppState>) -> Result<Vec<DailyStats>, String> {
    let mut stats = Vec::new();
    for i in 0..7 {
        let date = (Utc::now() - ChronoDuration::days(i)).format("%Y-%m-%d").to_string();
        let daily = state.db.get_daily_stats(&date, "1").map_err(|e| e.to_string())?;
        stats.push(daily);
    }
    Ok(stats)
}

#[tauri::command]
async fn get_productivity_report(
    state: State<'_, AppState>, 
    start_date: String, 
    end_date: String
) -> Result<serde_json::Value, String> {
    let sessions = state.db.get_sessions_in_range(&start_date, &end_date, "1")
        .map_err(|e| e.to_string())?;
    
    let mut total_productive = 0.0;
    let mut total_distracting = 0.0;
    let mut total_neutral = 0.0;
    let mut total_idle = 0.0;
    let mut session_count = 0;
    
    for session in &sessions {
        total_productive += session.productive_time_seconds;
        total_distracting += session.distracting_time_seconds;
        total_neutral += session.neutral_time_seconds;
        total_idle += session.idle_time_seconds;
        session_count += 1;
    }
    
    let total = total_productive + total_distracting + total_neutral + total_idle;
    let avg_score = if total > 0.0 {
        (total_productive - total_distracting) / total
    } else {
        0.0
    };

    Ok(serde_json::json!({
        "period": {
            "start": start_date,
            "end": end_date
        },
        "summary": {
            "total_hours": total / 3600.0,
            "productive_hours": total_productive / 3600.0,
            "distracting_hours": total_distracting / 3600.0,
            "neutral_hours": total_neutral / 3600.0,
            "idle_hours": total_idle / 3600.0,
            "session_count": session_count,
            "avg_productivity_score": avg_score,
            "productivity_percentage": if total > 0.0 { (total_productive / total) * 100.0 } else { 0.0 }
        }
    }))
}

fn main() -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
    env_logger::Builder::from_env(
        env_logger::Env::default().default_filter_or("info")
    ).init();
    
    log::info!("VibeTrack Desktop Tracker v1.0.0 starting...");
    
    let app_state = AppState::new()?;
    
    tauri::Builder::default()
        .manage(app_state)
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                event.window().hide().ok();
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            start_tracking,
            stop_tracking,
            get_tracking_status,
            record_activity,
            sync_events,
            get_app_usage,
            get_weekly_stats,
            get_productivity_report
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    
    Ok(())
}
