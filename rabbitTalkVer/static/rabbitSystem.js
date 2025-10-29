let rabbitLike = 0;
let flag = true;
let userName = '';

document.addEventListener("DOMContentLoaded", () => {
  const nameModal = document.getElementById("nameModal");
  const nameInput = document.getElementById("nameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const changeNameBtn = document.getElementById("changeNameBtn");
  const msgBox = document.getElementById("rabbitMessage");
  const imgBox = document.getElementById("usagi-img");
  
  async function r_loadReminders() {
      const res = await fetch("/get_name");
      const data = await res.json();
      userName = data.username;
      if(!data.username) nameModal.style.display = "flex";
      else msgBox.textContent = `${data.username}さんやっほ～`;
  }
  r_loadReminders();

  //初回名前登録
  saveNameBtn.addEventListener("click", async () => {
    const inputName = nameInput.value.trim();
    if (!inputName || !(/^[ぁ-んー゛゜]+$/.test(inputName))) {
      alert("うさぎはひらがなしか読めません🐇");
      return;
    }
    const res = await fetch("/set_name", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ "username": inputName })
    });
    const data = await res.json();
    if(data.status === "success") {
      rabbitSayHello(inputName);
      nameModal.style.display = "none";
      r_loadReminders();
    } else {
      alert("保存に失敗しました: " + data.message);
    }
  }); //save

  changeNameBtn.addEventListener("click", async () => {
    let name = prompt("名前を変更するよ（ひらがなのみ）");
    if (!name || !(/^[ぁ-んー゛゜]+$/.test(name))) {
      alert("うさぎはひらがなしか読めません🐇");
      return;
    }

    const res = await fetch("/set_name", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ "username": name })
    });

    const data = await res.json();
    if(data.status === "success") {
      nameModal.style.display = "none";
      flag = false;
      rabbitSayHello(name);
    } else {
      alert("保存に失敗しました: " + data.message);
    }    
  });//update

  function rabbitSayHello(name) {
    const msgBox = document.getElementById("rabbitMessage");
    if(msgBox) {
      if(flag) msgBox.textContent = `${name}さんはじめまして～`;
      else msgBox.textContent = `${name}さんだね！覚えたよ～`;
    }
  }

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let talkData = {};
let currentIndex = 0;
let currentTalk = [];
let subLike;
const talkBtn = document.getElementById("talkBtn");
const closeTalkBtn = document.getElementById("closeTalkBtn");

async function loadTalkData() {
  let res;
  if (rabbitLike < 10) {
    res = await fetch("/static/low_talk.json");  //0~9
    subLike = 1;
  }
  else if (rabbitLike < 20) {
    res = await fetch("/static/mid_talk.json"); //10~19
    subLike = 10;
  }
  else if (rabbitLike < 30) {
    res = await fetch("/static/midmid_talk.json"); //20~29
    subLike = 20;
  }
  else {
    res = await fetch("/static/high_talk.json"); //30~
    subLike = 30;
  }
  talkData = await res.json();
}

function getTalkLevel() {//好感度内でも分0~3,4~6,7~9
  console.log(rabbitLike-(subLike+3), rabbitLike-(subLike+6))
  if ((rabbitLike-(subLike+3)) < 0) return "low";
  else if ((rabbitLike-(subLike+6)) < 0) return "mid";
  else return "high";
}

async function startTalk() {
  await loadTalkData();
  const level = getTalkLevel();
  console.log(level)
  currentTalk = talkData[level];
  currentIndex = 0;
  showTalk();
  document.getElementById("talkModal").classList.remove("hidden");
}

function showTalk() {
  const msgBox = document.getElementById("talkMessage");
  const optBox = document.getElementById("talkOptions");
  optBox.innerHTML = "";
  //会話データなし
  var current = currentTalk[currentIndex];
  if (!current) {
    closeTalk();
    return;
  }

  let text = current.text
  if(userName) text = current.text.replace("あなた", userName+'さん')
  imgBox.src = current.img;
  msgBox.textContent = text;

  // if (current.options) {
  //   current.options.forEach(opt => {
  //     const btn = document.createElement("button");
  //     btn.textContent = opt;
  //     btn.onclick = () => {
  //       // 選択肢によって好感度変化とか
  //       if (opt === "はい" || opt === "もちろん！") rabbitLike += 5;
  //       if (opt === "いいえ" || opt === "たぶん…") rabbitLike -= 2;
  //       save_like(like); // ← Python側と繋ぐならここ
  //       nextTalk();
  //     };
  //     optBox.appendChild(btn);
  //   });
  // } else {
  //   msgBox.onclick = nextTalk; // クリックで次へ
  // }
}

closeTalkBtn.addEventListener("click", async () => {
    currentIndex++;
    if(currentIndex < currentTalk.length) showTalk();
    else closeTalk(); 
  });

function closeTalk() {
  document.getElementById("talkModal").classList.add("hidden");
  currentIndex = 0;
}

// イベント登録
talkBtn.addEventListener("click", async () => {
  startTalk();
});

});///DOM////////////////////////////////////////////////////////////////////////////////////////////////////////////

// 初期ロード
async function loadLike() {
  try {
    const res = await fetch("/get_like");
    const data = await res.json();
    rabbitLike = data.like || 0;
    updateLikeDisplay();
  } catch (err) {
    console.error(err);
  }
}

// 好感度を増やす
async function increaseLike(amount) {
  try {
    const res = await fetch("/increase_like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount })
    });
    const data = await res.json();
    rabbitLike = data.like;
    updateLikeDisplay();
  } catch (err) {
    console.error(err);
  }
}

// 表示更新
function updateLikeDisplay() {
  const display = document.getElementById("like-display");
  if (!display) return;
  const hearts = "🥕".repeat(Math.floor(rabbitLike / 5));
  display.textContent = hearts + ` (${rabbitLike})`;
  if (rabbitLike === 10 || rabbitLike === 20 || rabbitLike === 30) {
    if (rabbitLike === 10) document.getElementById("likeMessage").textContent = `好感度が ${rabbitLike} になりました！ \n うさぎはあなたのことが気になるみたい！`;
    else if (rabbitLike === 20) document.getElementById("likeMessage").textContent = `好感度が ${rabbitLike} になりました！ \n うさぎはあなたのことが好きみたい！`;
    else document.getElementById("likeMessage").textContent = `好感度が ${rabbitLike} になりました！ \n うさぎはあなたのことがとっても好きみたい！`;
    const modal = new bootstrap.Modal(document.getElementById("likeModal"));
    modal.show();
  }
}

function getLike(){
  if(rabbitLike < 10) return 1;
  if(rabbitLike < 20) return 2;
  if(rabbitLike < 30) return 3;
  return 4;
}

document.addEventListener("DOMContentLoaded", loadLike);
