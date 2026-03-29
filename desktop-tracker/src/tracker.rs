use std::process::Command;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

pub struct WindowTracker {
    running: Arc<AtomicBool>,
    last_activity: Arc<std::sync::Mutex<Instant>>,
    idle_threshold: Duration,
}

impl WindowTracker {
    pub fn new() -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
            last_activity: Arc::new(std::sync::Mutex::new(Instant::now())),
            idle_threshold: Duration::from_secs(300),
        }
    }

    pub fn start<F>(&self, callback: F)
    where
        F: Fn(String, String) + Send + 'static,
    {
        self.running.store(true, Ordering::SeqCst);

        let running = self.running.clone();
        let last_activity = self.last_activity.clone();
        let idle_threshold = self.idle_threshold;

        thread::spawn(move || {
            let mut last_window = String::new();

            while running.load(Ordering::SeqCst) {
                if let Ok(window_info) = Self::get_active_window() {
                    let (app, title) = window_info;

                    if !app.is_empty() && app != last_window {
                        callback(app.clone(), title.clone());
                        last_window = app;

                        if let Ok(mut last) = last_activity.lock() {
                            *last = Instant::now();
                        }
                    }
                }

                thread::sleep(Duration::from_secs(2));
            }
        });
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
    }

    pub fn is_idle(&self) -> bool {
        if let Ok(last) = self.last_activity.lock() {
            return last.elapsed() > self.idle_threshold;
        }
        false
    }

    #[cfg(target_os = "macos")]
    fn get_active_window() -> Result<(String, String), String> {
        let script = r#"
            tell application "System Events"
                set frontApp to first application process whose frontmost is true
                set appName to name of frontApp
            end tell
            tell application appName
                if it is running then
                    try
                        set windowTitle to name of front window
                    on error
                        set windowTitle to ""
                    end try
                else
                    set windowTitle to ""
                end if
            end tell
            return {appName, windowTitle}
        "#;

        let output = Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map_err(|e| e.to_string())?;

        let result = String::from_utf8_lossy(&output.stdout);
        let parts: Vec<&str> = result.trim().split(", ").collect();

        if parts.len() >= 2 {
            Ok((parts[0].to_string(), parts[1].to_string()))
        } else {
            Ok(("Unknown".to_string(), "".to_string()))
        }
    }

    #[cfg(target_os = "windows")]
    fn get_active_window() -> Result<(String, String), String> {
        Ok(("Windows".to_string(), "Active".to_string()))
    }

    #[cfg(target_os = "linux")]
    fn get_active_window() -> Result<(String, String), String> {
        let output = Command::new("xdotool")
            .arg("getactivewindow")
            .arg("getwindowname")
            .output()
            .map_err(|e| e.to_string())?;

        let title = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(("Linux".to_string(), title))
    }
}

impl Default for WindowTracker {
    fn default() -> Self {
        Self::new()
    }
}
