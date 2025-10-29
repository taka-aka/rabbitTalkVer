import json
import os

DATA_FILE = "reminders.json"

def load_reminders():
    """保存済みリマインダーを読み込む"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                content = f.read().strip()
                if not content:
                    return []  # 空ファイルなら空リストを返す
                return json.loads(content)
        except json.JSONDecodeError:
            return []  # JSON 壊れてたら空リストで復旧
    return []


def save_reminders(reminders):
    """リマインダーを保存"""
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(reminders, f, ensure_ascii=False, indent=2)

def add_reminder(text, date, time):
    """リマインダーを追加"""
    reminders = load_reminders()
    new_id = max([r.get("id", 0) for r in reminders], default=0) + 1
    # new_id = max([r["id"] for r in reminders], default=0) + 1
    reminder = {"id": new_id, "text": text, "date": date, "time": time}
    reminders.append(reminder)
    save_reminders(reminders)
    return reminders

def delete_reminder(reminder_id):
    """指定したIDのリマインダーを削除"""
    reminders = load_reminders()
    reminders = [r for r in reminders if r["id"] != reminder_id]
    save_reminders(reminders)
    return reminders