#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::State;
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivityEvent {
    pub timestamp: String,
    pub active_app: String,
    pub window_title: String,
    pub duration: f64,
    pub is_idle: bool,
}

pub struct TrackerState {
    pub running: Mutex<bool>,
    pub last_activity: Mutex<Instant>,
    pub event_count: Mutex<u32>,
}

impl Default for TrackerState {
    fn default() -> Self {
        Self {
            running: Mutex::new(false),
            last_activity: Mutex::new(Instant::now()),
            event_count: Mutex::new(0),
        }
    }
}

const IDLE_THRESHOLD_SECS: u64 = 300;

#[tauri::command]
fn start_tracking(state: State<TrackerState>) -> Result<String, String> {
    let mut is_running = state.running.lock().map_err(|e| e.to_string())?;
    *is_running = true;
    
    let mut last_activity = state.last_activity.lock().map_err(|e| e.to_string())?;
    *last_activity = Instant::now();
    
    log::info!("Tracking started");
    Ok("Tracking started".to_string())
}

#[tauri::command]
fn stop_tracking(state: State<TrackerState>) -> Result<String, String> {
    let mut is_running = state.running.lock().map_err(|e| e.to_string())?;
    *is_running = false;
    
    log::info!("Tracking stopped");
    Ok("Tracking stopped".to_string())
}

#[tauri::command]
fn get_tracking_status(state: State<TrackerState>) -> Result<serde_json::Value, String> {
    let is_running = *state.running.lock().map_err(|e| e.to_string())?;
    let event_count = *state.event_count.lock().map_err(|e| e.to_string())?;
    let last_activity = *state.last_activity.lock().map_err(|e| e.to_string())?;
    
    let idle_seconds = last_activity.elapsed().as_secs();
    let is_idle = idle_seconds > IDLE_THRESHOLD_SECS;
    
    Ok(serde_json::json!({
        "is_running": is_running,
        "event_count": event_count,
        "is_idle": is_idle,
        "idle_seconds": idle_seconds
    }))
}

#[tauri::command]
async fn send_activity_event(
    state: State<'_, TrackerState>,
    app_name: String,
    window_title: String,
    duration_secs: f64,
) -> Result<(), String> {
    let is_running = *state.running.lock().map_err(|e| e.to_string())?;
    if !is_running {
        return Ok(());
    }
    
    let last_activity = *state.last_activity.lock().map_err(|e| e.to_string())?;
    let idle_seconds = last_activity.elapsed().as_secs();
    let is_idle = idle_seconds > IDLE_THRESHOLD_SECS;
    
    let event = ActivityEvent {
        timestamp: chrono::Utc::now().to_rfc3339(),
        active_app: app_name.clone(),
        window_title,
        duration: duration_secs,
        is_idle,
    };
    
    let client = reqwest::Client::new();
    let _ = client
        .post("http://localhost:8000/api/event")
        .json(&serde_json::json!({
            "session_id": 1,
            "user_id": 1,
            "event_type": "activity",
            "source": "desktop",
            "content": serde_json::to_string(&event).unwrap_or_default(),
            "duration_seconds": duration_secs as i32
        }))
        .send()
        .await;
    
    let mut count = state.event_count.lock().map_err(|e| e.to_string())?;
    *count += 1;
    
    let mut last = state.last_activity.lock().map_err(|e| e.to_string())?;
    *last = Instant::now();
    
    log::info!("Activity event: {} - {}", app_name, if is_idle { "idle" } else { "active" });
    
    Ok(())
}

fn main() {
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info")).init();
    log::info!("VibeTrack Desktop Tracker starting...");
    
    tauri::Builder::default()
        .manage(TrackerState::default())
        .invoke_handler(tauri::generate_handler![
            start_tracking,
            stop_tracking,
            get_tracking_status,
            send_activity_event
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
