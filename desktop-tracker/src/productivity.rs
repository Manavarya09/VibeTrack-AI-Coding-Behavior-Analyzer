use parking_lot::RwLock;
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AppCategory {
    Productive,
    Neutral,
    Distracting,
    Unknown,
}

pub struct ProductivityAnalyzer {
    productive_apps: RwLock<HashMap<String, f64>>,
    distracting_apps: RwLock<HashMap<String, f64>>,
    category_rules: RwLock<HashMap<String, AppCategory>>,
}

impl ProductivityAnalyzer {
    pub fn new() -> Self {
        let mut productive = HashMap::new();

        productive.insert("code".to_string(), 1.0);
        productive.insert("vscode".to_string(), 1.0);
        productive.insert("visual studio code".to_string(), 1.0);
        productive.insert("intellij idea".to_string(), 1.0);
        productive.insert("pycharm".to_string(), 1.0);
        productive.insert("webstorm".to_string(), 1.0);
        productive.insert("goland".to_string(), 1.0);
        productive.insert("rider".to_string(), 1.0);
        productive.insert("android studio".to_string(), 1.0);
        productive.insert("xcode".to_string(), 1.0);
        productive.insert("sublime text".to_string(), 1.0);
        productive.insert("atom".to_string(), 1.0);
        productive.insert("vim".to_string(), 1.0);
        productive.insert("neovim".to_string(), 1.0);
        productive.insert("emacs".to_string(), 1.0);
        productive.insert("terminal".to_string(), 0.9);
        productive.insert("iterm".to_string(), 0.9);
        productive.insert("iterm2".to_string(), 0.9);
        productive.insert("powershell".to_string(), 0.9);
        productive.insert("cmd".to_string(), 0.9);
        productive.insert("git".to_string(), 0.95);
        productive.insert("github".to_string(), 0.9);
        productive.insert("gitlab".to_string(), 0.9);
        productive.insert("bitbucket".to_string(), 0.9);
        productive.insert("docker".to_string(), 0.95);
        productive.insert("kubernetes".to_string(), 0.95);
        productive.insert("aws".to_string(), 0.9);
        productive.insert("azure".to_string(), 0.9);
        productive.insert("gcp".to_string(), 0.9);
        productive.insert("notion".to_string(), 0.85);
        productive.insert("obsidian".to_string(), 0.9);
        productive.insert("bear".to_string(), 0.85);
        productive.insert("ia writer".to_string(), 0.9);
        productive.insert("table".to_string(), 0.8);
        productive.insert("excel".to_string(), 0.8);
        productive.insert("numbers".to_string(), 0.8);
        productive.insert("figma".to_string(), 0.85);
        productive.insert("sketch".to_string(), 0.85);
        productive.insert("adobe xd".to_string(), 0.85);

        let mut distracting = HashMap::new();

        distracting.insert("youtube".to_string(), -1.0);
        distracting.insert("netflix".to_string(), -1.0);
        distracting.insert("spotify".to_string(), -0.3);
        distracting.insert("music".to_string(), -0.3);
        distracting.insert("discord".to_string(), -0.7);
        distracting.insert("slack".to_string(), -0.4);
        distracting.insert("telegram".to_string(), -0.6);
        distracting.insert("whatsapp".to_string(), -0.6);
        distracting.insert("messenger".to_string(), -0.7);
        distracting.insert("instagram".to_string(), -1.0);
        distracting.insert("twitter".to_string(), -0.8);
        distracting.insert("x".to_string(), -0.8);
        distracting.insert("facebook".to_string(), -1.0);
        distracting.insert("tiktok".to_string(), -1.0);
        distracting.insert("reddit".to_string(), -0.9);
        distracting.insert("twitch".to_string(), -1.0);
        distracting.insert("hulu".to_string(), -1.0);
        distracting.insert("prime video".to_string(), -1.0);
        distracting.insert("disney".to_string(), -1.0);
        distracting.insert("candy crush".to_string(), -1.0);
        distracting.insert("games".to_string(), -1.0);
        distracting.insert("steam".to_string(), -1.0);
        distracting.insert("epic games".to_string(), -1.0);

        let mut rules = HashMap::new();

        rules.insert("com.apple.Safari".to_string(), AppCategory::Unknown);
        rules.insert("com.google.Chrome".to_string(), AppCategory::Unknown);
        rules.insert("org.mozilla.firefox".to_string(), AppCategory::Unknown);
        rules.insert("com.microsoft.edgemac".to_string(), AppCategory::Unknown);

        Self {
            productive_apps: RwLock::new(productive),
            distracting_apps: RwLock::new(distracting),
            category_rules: RwLock::new(rules),
        }
    }

    pub fn categorize_app(&self, app_name: &str) -> String {
        let app_lower = app_name.to_lowercase();

        {
            let productive = self.productive_apps.read();
            if productive.contains_key(&app_lower) {
                return "productive".to_string();
            }
        }

        {
            let distracting = self.distracting_apps.read();
            if distracting.contains_key(&app_lower) {
                return "distracting".to_string();
            }
        }

        for (keyword, category) in [
            ("code", "productive"),
            ("terminal", "productive"),
            ("git", "productive"),
            ("docker", "productive"),
            ("sql", "productive"),
            ("notion", "productive"),
            ("obsidian", "productive"),
            ("youtube", "distracting"),
            ("netflix", "distracting"),
            ("discord", "distracting"),
            ("instagram", "distracting"),
            ("twitter", "distracting"),
            ("facebook", "distracting"),
            ("reddit", "distracting"),
            ("tiktok", "distracting"),
            ("game", "distracting"),
        ] {
            if app_lower.contains(keyword) {
                return category.to_string();
            }
        }

        "neutral".to_string()
    }

    pub fn calculate_score(
        &self,
        app_name: &str,
        keystrokes: u32,
        mouse_clicks: u32,
        duration_seconds: f64,
    ) -> f64 {
        let app_lower = app_name.to_lowercase();

        let base_score = {
            let productive = self.productive_apps.read();
            productive
                .get(&app_lower)
                .copied()
                .or_else(|| {
                    let distracting = self.distracting_apps.read();
                    distracting.get(&app_lower).copied()
                })
                .unwrap_or(0.0)
        };

        let activity_level = if duration_seconds > 0.0 {
            let keystrokes_per_min = (keystrokes as f64) / (duration_seconds / 60.0);
            let clicks_per_min = (mouse_clicks as f64) / (duration_seconds / 60.0);

            let activity = (keystrokes_per_min + clicks_per_min * 0.5) / 100.0;
            activity.clamp(0.0, 1.0)
        } else {
            0.5
        };

        let score = base_score * 0.7 + activity_level * 0.3;

        score.clamp(-1.0, 1.0)
    }

    pub fn get_app_score(&self, app_name: &str) -> f64 {
        let app_lower = app_name.to_lowercase();

        self.productive_apps
            .read()
            .get(&app_lower)
            .copied()
            .or_else(|| self.distracting_apps.read().get(&app_lower).copied())
            .unwrap_or(0.0)
    }

    pub fn add_productive_app(&self, app_name: &str, score: f64) {
        self.productive_apps
            .write()
            .insert(app_name.to_lowercase(), score.clamp(0.0, 1.0));
    }

    pub fn add_distracting_app(&self, app_name: &str, score: f64) {
        self.distracting_apps
            .write()
            .insert(app_name.to_lowercase(), (-score).clamp(-1.0, 0.0));
    }

    pub fn get_top_productive_apps(&self) -> Vec<(String, f64)> {
        let productive = self.productive_apps.read();
        let mut apps: Vec<_> = productive.iter().map(|(k, v)| (k.clone(), *v)).collect();
        apps.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));
        apps
    }

    pub fn get_top_distracting_apps(&self) -> Vec<(String, f64)> {
        let distracting = self.distracting_apps.read();
        let mut apps: Vec<_> = distracting.iter().map(|(k, v)| (k.clone(), *v)).collect();
        apps.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
        apps
    }
}

impl Default for ProductivityAnalyzer {
    fn default() -> Self {
        Self::new()
    }
}
