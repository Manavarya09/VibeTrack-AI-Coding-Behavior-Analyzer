use parking_lot::Mutex;
use std::collections::VecDeque;
use std::process::Command;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Arc;
use std::thread;
use std::time::{Duration, Instant};

pub struct ActivityTracker {
    running: Arc<AtomicBool>,
    current_app: Arc<Mutex<Option<String>>>,
    current_window: Arc<Mutex<Option<String>>>,
    keystrokes: Arc<AtomicU64>,
    mouse_clicks: Arc<AtomicU64>,
    mouse_moves: Arc<AtomicU64>,
    activity_history: Arc<Mutex<VecDeque<ActivitySample>>>,
    last_poll: Arc<Mutex<Instant>>,
    poll_interval: Duration,
}

#[derive(Debug, Clone)]
pub struct ActivitySample {
    pub timestamp: Instant,
    pub app_name: String,
    pub window_title: String,
    pub keystrokes_delta: u64,
    pub mouse_clicks_delta: u64,
    pub mouse_moves_delta: u64,
}

impl ActivityTracker {
    pub fn new() -> Self {
        Self {
            running: Arc::new(AtomicBool::new(false)),
            current_app: Arc::new(Mutex::new(None)),
            current_window: Arc::new(Mutex::new(None)),
            keystrokes: Arc::new(AtomicU64::new(0)),
            mouse_clicks: Arc::new(AtomicU64::new(0)),
            mouse_moves: Arc::new(AtomicU64::new(0)),
            activity_history: Arc::new(Mutex::new(VecDeque::with_capacity(1000))),
            last_poll: Arc::new(Mutex::new(Instant::now())),
            poll_interval: Duration::from_secs(1),
        }
    }

    pub fn start(&self) {
        self.running.store(true, Ordering::SeqCst);

        let running = self.running.clone();
        let current_app = self.current_app.clone();
        let current_window = self.current_window.clone();
        let keystrokes = self.keystrokes.clone();
        let mouse_clicks = self.mouse_clicks.clone();
        let mouse_moves = self.mouse_moves.clone();
        let activity_history = self.activity_history.clone();
        let last_poll = self.last_poll.clone();
        let poll_interval = self.poll_interval;

        thread::spawn(move || {
            let mut last_app = String::new();
            let mut last_keystrokes: u64 = 0;
            let mut last_clicks: u64 = 0;
            let mut last_moves: u64 = 0;

            while running.load(Ordering::SeqCst) {
                let now = Instant::now();

                let (app, title) = Self::get_active_window_info();

                {
                    let mut current = current_app.lock();
                    *current = Some(app.clone());
                }
                {
                    let mut current = current_window.lock();
                    *current = Some(title.clone());
                }

                if app != last_app && !app.is_empty() {
                    last_app = app.clone();

                    let ks = keystrokes.load(Ordering::SeqCst);
                    let mc = mouse_clicks.load(Ordering::SeqCst);
                    let mm = mouse_moves.load(Ordering::SeqCst);

                    let sample = ActivitySample {
                        timestamp: now,
                        app_name: app.clone(),
                        window_title: title.clone(),
                        keystrokes_delta: ks.saturating_sub(last_keystrokes),
                        mouse_clicks_delta: mc.saturating_sub(last_clicks),
                        mouse_moves_delta: mm.saturating_sub(last_moves),
                    };

                    {
                        let mut history = activity_history.lock();
                        history.push_back(sample);
                        if history.len() > 1000 {
                            history.pop_front();
                        }
                    }

                    last_keystrokes = ks;
                    last_clicks = mc;
                    last_moves = mm;
                }

                *last_poll.lock() = now;

                thread::sleep(poll_interval);
            }
        });

        self.start_input_tracking();

        log::info!("Activity tracker started");
    }

    pub fn stop(&self) {
        self.running.store(false, Ordering::SeqCst);
        log::info!("Activity tracker stopped");
    }

    pub fn is_running(&self) -> bool {
        self.running.load(Ordering::SeqCst)
    }

    pub fn get_current_app(&self) -> Option<String> {
        self.current_app.lock().clone()
    }

    pub fn get_current_window(&self) -> Option<String> {
        self.current_window.lock().clone()
    }

    pub fn get_input_stats(&self) -> (u64, u64, u64) {
        (
            self.keystrokes.load(Ordering::SeqCst),
            self.mouse_clicks.load(Ordering::SeqCst),
            self.mouse_moves.load(Ordering::SeqCst),
        )
    }

    pub fn reset_input_stats(&self) {
        self.keystrokes.store(0, Ordering::SeqCst);
        self.mouse_clicks.store(0, Ordering::SeqCst);
        self.mouse_moves.store(0, Ordering::SeqCst);
    }

    pub fn get_recent_activity(&self, seconds: u64) -> Vec<ActivitySample> {
        let history = self.activity_history.lock();
        let cutoff = Instant::now() - Duration::from_secs(seconds);

        history
            .iter()
            .filter(|s| s.timestamp > cutoff)
            .cloned()
            .collect()
    }

    fn start_input_tracking(&self) {
        let running = self.running.clone();
        let keystrokes = self.keystrokes.clone();
        let mouse_clicks = self.mouse_clicks.clone();
        let mouse_moves = self.mouse_moves.clone();

        #[cfg(target_os = "macos")]
        {
            thread::spawn(move || {
                let mut last_x: i32 = 0;
                let mut last_y: i32 = 0;
                let mut initialized = false;

                while running.load(Ordering::SeqCst) {
                    if let Ok((x, y, clicks)) = Self::get_mouse_info_macos() {
                        if !initialized {
                            last_x = x;
                            last_y = y;
                            initialized = true;
                        } else {
                            if x != last_x || y != last_y {
                                mouse_moves.fetch_add(1, Ordering::SeqCst);
                                last_x = x;
                                last_y = y;
                            }
                        }

                        let current_clicks = mouse_clicks.load(Ordering::SeqCst);
                        if clicks > current_clicks {
                            mouse_clicks.store(clicks, Ordering::SeqCst);
                        }
                    }

                    thread::sleep(Duration::from_millis(100));
                }
            });
        }

        #[cfg(target_os = "windows")]
        {
            let _ = running;
            let _ = keystrokes;
            let _ = mouse_clicks;
            let _ = mouse_moves;
        }
    }

    #[cfg(target_os = "macos")]
    fn get_active_window_info() -> (String, String) {
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

        Command::new("osascript")
            .arg("-e")
            .arg(script)
            .output()
            .map(|output| {
                let result = String::from_utf8_lossy(&output.stdout);
                let parts: Vec<&str> = result.trim().split(", ").collect();

                if parts.len() >= 2 {
                    (parts[0].to_string(), parts[1].to_string())
                } else {
                    ("Unknown".to_string(), String::new())
                }
            })
            .unwrap_or_else(|_| ("Unknown".to_string(), String::new()))
    }

    #[cfg(target_os = "windows")]
    fn get_active_window_info() -> (String, String) {
        use windows::Win32::Foundation::*;
        use windows::Win32::UI::WindowsAndMessaging::*;

        unsafe {
            let hwnd = GetForegroundWindow();
            if hwnd.0.is_null() {
                return ("Unknown".to_string(), String::new());
            }

            let mut title = [0u16; 256];
            let len = GetWindowTextW(hwnd, &mut title);
            let title_str = String::from_utf16_lossy(&title[..len as usize]);

            let mut process_id: u32 = 0;
            GetWindowThreadProcessId(hwnd, Some(&mut process_id));

            ("Windows App".to_string(), title_str)
        }
    }

    #[cfg(target_os = "linux")]
    fn get_active_window_info() -> (String, String) {
        let app = Command::new("xdotool")
            .arg("getactivewindow")
            .arg("getwindowname")
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
            .unwrap_or_else(|_| "Unknown".to_string());

        (app.clone(), app)
    }

    #[cfg(target_os = "macos")]
    fn get_mouse_info_macos() -> Result<(i32, i32, u64), String> {
        let script = r#"
            tell application "System Events"
                set mouseInfo to do shell script "echo $(xdotool getmouselocation)"
                return mouseInfo
            end tell
        "#;

        let output = Command::new("python3")
            .arg("-c")
            .arg("import Quartz; p = Quartz.NSEvent.mouseLocation(); print(int(p.x), int(Quartz.NSScreen.screens()[0].frame().size.height - p.y))")
            .output()
            .map_err(|e| e.to_string())?;

        let coords = String::from_utf8_lossy(&output.stdout);
        let parts: Vec<&str> = coords.trim().split(' ').collect();

        let x = parts.first().and_then(|s| s.parse().ok()).unwrap_or(0);
        let y = parts.get(1).and_then(|s| s.parse().ok()).unwrap_or(0);

        Ok((x, y, 0))
    }

    pub fn get_activity_summary(&self, duration_secs: u64) -> ActivitySummary {
        let samples = self.get_recent_activity(duration_secs);

        let mut app_times: std::collections::HashMap<String, f64> =
            std::collections::HashMap::new();

        for i in 0..samples.len().saturating_sub(1) {
            let current = &samples[i];
            let next = &samples[i + 1];
            let delta = next
                .timestamp
                .duration_since(current.timestamp)
                .as_secs_f64();

            *app_times.entry(current.app_name.clone()).or_insert(0.0) += delta;
        }

        let (total_ks, total_clicks, total_moves) = self.get_input_stats();

        ActivitySummary {
            app_times,
            total_keystrokes: total_ks,
            total_mouse_clicks: total_clicks,
            total_mouse_moves: total_moves,
            sample_count: samples.len(),
        }
    }
}

impl Default for ActivityTracker {
    fn default() -> Self {
        Self::new()
    }
}

#[derive(Debug, Clone)]
pub struct ActivitySummary {
    pub app_times: std::collections::HashMap<String, f64>,
    pub total_keystrokes: u64,
    pub total_mouse_clicks: u64,
    pub total_mouse_moves: u64,
    pub sample_count: usize,
}

impl ActivitySummary {
    pub fn most_active_app(&self) -> Option<(String, f64)> {
        self.app_times
            .iter()
            .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
            .map(|(k, v)| (k.clone(), *v))
    }

    pub fn total_active_time(&self) -> f64 {
        self.app_times.values().sum()
    }
}
