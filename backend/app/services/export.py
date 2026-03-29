import json
import csv
import io
from typing import List, Dict
from datetime import datetime


def export_to_json(sessions: List[Dict]) -> str:
    return json.dumps(sessions, indent=2, default=str)


def export_to_csv(sessions: List[Dict]) -> str:
    if not sessions:
        return ""

    output = io.StringIO()
    fieldnames = [
        "id",
        "user_id",
        "start_time",
        "end_time",
        "duration_minutes",
        "prompt_count",
        "break_time_minutes",
        "vibe_score",
        "classification",
    ]

    writer = csv.DictWriter(output, fieldnames=fieldnames)
    writer.writeheader()

    for session in sessions:
        row = {k: session.get(k, "") for k in fieldnames}
        writer.writerow(row)

    return output.getvalue()


def export_to_markdown(sessions: List[Dict]) -> str:
    md = "# VibeTrack Session Report\n\n"
    md += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n"

    total_minutes = sum(s.get("duration_minutes", 0) for s in sessions)
    total_sessions = len(sessions)
    avg_minutes = total_minutes / total_sessions if total_sessions > 0 else 0

    md += "## Summary\n\n"
    md += f"- Total Sessions: {total_sessions}\n"
    md += f"- Total Minutes: {total_minutes:.2f}\n"
    md += f"- Average Session: {avg_minutes:.2f} minutes\n\n"

    md += "## Sessions\n\n"
    md += "| Date | Duration | Prompts | Vibe Score | Classification |\n"
    md += "|------|----------|---------|------------|----------------|\n"

    for session in sessions:
        date = session.get("start_time", "N/A")
        if isinstance(date, str):
            date = date[:10]
        duration = session.get("duration_minutes", 0)
        prompts = session.get("prompt_count", 0)
        vibe = session.get("vibe_score", "N/A")
        classification = session.get("classification", "N/A")

        md += (
            f"| {date} | {duration:.0f} min | {prompts} | {vibe} | {classification} |\n"
        )

    return md


def generate_pdf_report(sessions: List[Dict], stats: Dict) -> bytes:
    report = f"""
    VibeTrack Report
    ================
    Generated: {datetime.now()}
    
    Summary
    -------
    Total Sessions: {stats.get("total_sessions", 0)}
    Total Minutes: {stats.get("total_minutes", 0)}
    Average Session: {stats.get("avg_session_minutes", 0)} minutes
    Deep Flow Sessions: {stats.get("deep_flow_count", 0)}
    High Dependency: {stats.get("high_dependency_count", 0)}
    
    Sessions
    --------
    """

    for session in sessions[:50]:
        report += f"""
    Session {session.get("id")}
    - Date: {session.get("start_time")}
    - Duration: {session.get("duration_minutes", 0):.2f} minutes
    - Prompts: {session.get("prompt_count", 0)}
    - Classification: {session.get("classification", "N/A")}
    - Vibe Score: {session.get("vibe_score", "N/A")}
        """

    return report.encode("utf-8")
