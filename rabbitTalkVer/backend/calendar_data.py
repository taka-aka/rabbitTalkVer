# from datetime import date
# import json, os

# LOGIN_FILE = "login.json"

# def load_logins():
#     if not os.path.exists(LOGIN_FILE):
#         return {"login": []}
#     with open(LOGIN_FILE, "r", encoding='utf-8') as f:
#         return json.load(f)

# def save_logins(data):
#     with open(LOGIN_FILE, "w", encoding='utf-8') as f:
#         json.dump(data, f, ensure_ascii=False, indent=2)
