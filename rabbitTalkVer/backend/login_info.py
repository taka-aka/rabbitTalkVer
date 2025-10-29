import json
import os
from datetime import date, timedelta

FILE_PATH = "login_info.json"

def load_data():
    if not os.path.exists(FILE_PATH):
        return {"last_login": None, "streak": 1, "flag":0}
    with open(FILE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

def save_data(data):
    with open(FILE_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def update_streak():
    data = load_data()
    today = date.today()
    last_login = date.fromisoformat(data["last_login"]) if data["last_login"] else None

    if last_login == today:
        pass  # 同じ日なら何もしない
    elif last_login == today - timedelta(days=1):
        data["streak"] += 1  # 前日とつながってる
    elif last_login == None:
        data["streak"] = 1 #初回
    else:
        data["flag"] = 1  # 飛んでたらリセット
        data["streak"] = 1

    data["last_login"] = today.isoformat()
    save_data(data)
    return data["streak"], data["flag"]
