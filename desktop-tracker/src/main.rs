#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::{Deserialize, Serialize};
use std::sync::Mutex;
use std::time::{Duration, Instant};
use tauri::State;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ActivityEvent {
    pub timestamp: String,
    pub active_app: String,
    pub window_title: String,
    pub duration: f64,
    pub is_idle: bool,
}

#[derive(Default)]
pub struct TrackerState {
    pub current_session: Mutex<Option<ActivityEvent>>,
    pub last_activity: Mutex<Instant>,
    pub event_count: Mutex<u32>,
    pub is_tracking: Mutex<bool>,
}

const IDLE_THRESHOLD_SECS: u64 = 300;

#[tauri::command]
fn start_tracking(state: State<TrackerState>) -> Result<String, String> {
    let mut is_tracking = state.is_tracking.lock().unwrap();
    *is_tracking = true;
    
    let mut last_activity = state.last_activity.lock().unwrap();
    *last_activity = Instant::now();
    
    Ok("Tracking started".to_string())
}

#[tauri::command]
fn stop_tracking(state: State<TrackerState>) -> Result<String, String> {
    let mut is_tracking = state.is_tracking.lock().unwrap();
    *is_tracking = false;
    Ok("Tracking stopped".to_string())
}

#[tauri::command]
fn get_tracking_status(state: State<TrackerState>) -> Result<serde_json::Value, String> {
    let is_tracking = *state.is_tracking.lock().unwrap();
    let event_count = *state.event_count.lock().unwrap();
    let last_activity = *state.last_activity.lock().unwrap();
    
    let idle_seconds = last_activity.elapsed().as_secs();
    let is_idle = idle_seconds > IDLE_THRESHOLD_SECS;
    
    Ok(serde_json::json!({
        "is_tracking": is_tracking,
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
    let is_tracking = *state.is_tracking.lock().unwrap();
    if !is_tracking {
        return Ok(());
    }
    
    let last_activity = *state.last_activity.lock().unwrap();
    let idle_seconds = last_activity.elapsed().as_secs();
    let is_idle = idle_seconds > IDLE_THRESHOLD_SECS;
    
    let event = ActivityEvent {
        timestamp: chrono::Utc::now().to_rfc3339(),
        active_app: app_name,
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
    
    let mut count = state.event_count.lock().unwrap();
    *count += 1;
    
    let mut last = state.last_activity.lock().unwrap();
    *last = Instant::now();
    
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
