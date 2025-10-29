from flask import Flask, render_template, request, jsonify
from backend import manegeReminder
from datetime import date, datetime
import calendar
from backend import rabbitData
from backend import login_info

app = Flask(__name__)

today = date.today()

@app.route("/")
def index():
    streak, flag = login_info.update_streak()

    login_message = None
    if streak > 1:
        login_message = f"{streak}日ログインだよ！すごーい！"
        login_img = "static/img/usagi_log.png"
    elif streak == 1:
        if flag == 1:
            login_message = "さぼっちゃったね…😢 また一緒にがんばろう！"
            login_img = "static/img/usagi_cry.png"
        else:
            login_message = "初ログイン！がんばって続けようね！"
            login_img = "static/img/usagi_welcome.png"

    login_message = login_message or ''
    
    year = request.args.get('year', type=int) or today.year
    month = request.args.get('month', type=int) or today.month
    cal = calendar.Calendar(firstweekday=6) #日曜始まりの週
    month_days = cal.monthdayscalendar(year, month) #その月の日付
    month_name = calendar.month_name[month]
    today_cell = today.day if (year == today.year and month == today.month) else None
    if not year or not month:
        year = today.year
        month = today.month

    return render_template("index.html", 
                           year=year,
                           month=month,
                           month_name=month_name,
                           month_days=month_days,
                           today=today,
                           today_cell = today_cell,
                           login_streak=streak,
                           login_message=login_message,
                           login_img=login_img,
                           reminders={}
                           )
    

@app.route("/get_reminders")
def get_reminders():
    return jsonify(manegeReminder.load_reminders())

@app.route("/add_reminder", methods=["POST"])
def add_reminder():
    data = request.get_json()
    text = data.get("text")
    date = data.get("date")
    time = data.get("time")
    if not text or not date:
        return jsonify({"status": "error", "message": "空のリマインダーは保存できません"}), 400

    reminders = manegeReminder.add_reminder(text, date, time)
    return jsonify({"status": "success", "reminders": reminders})

@app.route("/delete_reminder", methods=["POST"])
def delete_reminder():
    data = request.json
    reminder_id = data.get("id")
    if reminder_id is None:
        return jsonify({"status": "error", "message": "IDが指定されていません"}), 400

    reminders = manegeReminder.load_reminders()
    new_reminders = [r for r in reminders if r["id"] != reminder_id]

    if len(new_reminders) == len(reminders):
        return jsonify({"status": "error", "message": "指定IDのリマインダーが見つかりません"}), 400

    manegeReminder.save_reminders(new_reminders)
    return jsonify({"status": "success", "reminders": new_reminders})


@app.route("/update_reminder", methods=["POST"])
def update_reminder():
    data = request.json
    id = data.get("id")
    text = data.get("text")
    date = data.get("date")
    time = data.get("time")
    reminders = manegeReminder.load_reminders()

    for i, r in enumerate(reminders):
        if r["id"] == id:
            reminders[i] = {"id": id, "text": text, "date": date, "time": time}
            manegeReminder.save_reminders(reminders)
            return jsonify({"status": "success", "reminders": reminders})

    return jsonify({"status": "error", "message": "指定IDのリマインダーが見つかりません"}), 400

##### うさぎの好感度 #############################
@app.route("/get_like")
def get_like():
    like = rabbitData.load_like()
    return jsonify({"like": like})

@app.route("/increase_like", methods=["POST"])
def increase_like():
    data = request.get_json()
    amount = data.get("amount", 0)
    current = rabbitData.load_like()
    new_like = current + amount
    rabbitData.save_like(new_like)
    return jsonify({"like": new_like})

##### 名前 ################################
@app.route("/get_name")
def get_name():
    username = rabbitData.load_name()
    return jsonify({"username": username})

@app.route("/set_name", methods=["POST"])
def set_name():
    data = request.get_json()
    username = data.get("username")
    if not username:
        return jsonify({"status": "error", "message": "名前が空です"}), 400
    rabbitData.save_name(username)
    return jsonify({"status": "success", "username": username})

if __name__ == "__main__":
    # app.run(debug=True)
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
