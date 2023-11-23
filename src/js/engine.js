import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js';
import { getFirestore, addDoc, collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';

const state = {
  view: {
    // Displays (Global)
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    lives: document.querySelector("#lives"),
    sound: document.querySelector(".sound"),
    lang: document.querySelector(".lang"),
    // Display (Start)
    playerName: document.querySelector(".name"),
    // Display (Game)
    squares: document.querySelectorAll(".square"),
    enemy: document.querySelector(".enemy"),
    // Display (Continue)
    level: document.querySelector("#level"),
    // Display (Game Over)
    endGameMessage: document.querySelector("#result"),
    // Display (Ranking)
    dots: document.querySelector("#dots"),
    ranking: document.querySelector(".ranking"),
    // Pages
    startPage: document.querySelector(".start-page"),
    gamePage: document.querySelector(".game-page"),
    continuePage: document.querySelector(".continue-page"),
    gameOverPage: document.querySelector(".game-over-page"),
    waitingPage: document.querySelector(".waiting-page"),
    statsPage: document.querySelector(".stats-page"),
    rulesPage: document.querySelector(".rules-page"),
    // Buttons
    startButton: document.querySelector(".start"),
    continueButton: document.querySelector(".continue"),
    restartButton: document.querySelector(".restart"),
    statsButton: document.querySelector(".stats"),
    rulesButton: document.querySelector(".rules"),
    rulesCloseButton: document.querySelector(".rule-close"),
    statsCloseButton: document.querySelector(".stats-close"),
  },
  values: {
    level: 1,
    levelReset: 1,
    lives: 3,
    livesReset: 3,
    score: 0,
    scoreReset:0,
    playerName: null,
    timerId: null,
    enemyVelocity: 1000,
    countDownTimerId: 1000,
    hitPosition: 0,
    currentTime: 15,
    missClicks: 0,
    matchTime: 15,
    rankingList: [],
    topTenRanking: [],
    dots: 0,
    dotInterval: null,
    soundOn: true,
    soundVolume: 0.2,
    lang: "pt-br"
  }
}
const firebaseConfig = {
  apiKey: "AIzaSyB-d2jTq_vYnCFcsXJI_xlXKSpJ4fJfRLo",
  authDomain: "wreck-it-ralph-40324.firebaseapp.com",
  projectId: "wreck-it-ralph-40324",
  storageBucket: "wreck-it-ralph-40324.appspot.com",
  messagingSenderId: "468588337668",
  appId: "1:468588337668:web:1d23245615bbeec9aa3351"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const coll = "SCORES"

async function FBFetchData () {
  try{
    const collectionRef = collection(db, coll);
    const snapshot = await getDocs(collectionRef);

    const dataFromFirestore = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    state.values.rankingList = dataFromFirestore;
  } catch (error) {
    console.error('Erro ao buscar dados:', error);
  }
};

function countDown() {
  state.values.currentTime--;
  state.view.timeLeft.textContent = state.values.currentTime;

  if (state.values.currentTime<=0) {
    state.view.continuePage.style.display="flex";
    state.view.gamePage.style.display="none"
    clearInterval(state.values.countDownTimerId)
    clearInterval(state.values.timerId)
    state.values.currentTime = state.values.matchTime;
    state.values.level++
    accelerateTheEnemy(false)
  }
}
function accelerateTheEnemy(clean=false) {
  state.values.enemyVelocity = !clean?state.values.enemyVelocity-2*state.values.level:1000

}
function randomSquare() {
  state.view.squares.forEach((square) => {
    square.classList.remove("enemy")
  });
  let randomNumber = Math.floor(Math.random() * 9);
  let randomSquare = state.view.squares[randomNumber];
  randomSquare.classList.add("enemy")
  state.values.hitPosition = randomSquare.id
}
function playSound(audioName) {
  let audio = new Audio("./src/audios/hit.m4a");
  audio.volume = state.values.soundVolume;
  audio.play()
}
function testHit(square){
  if (square.id === state.values.hitPosition) {
    state.values.score+=state.values.level;
    state.view.score.textContent = state.values.score;
    state.values.hitPosition = null;
    if (state.values.soundOn) {
      playSound("hit");
    }
  } else if (square.id !== state.values.hitPosition) {
    state.values.missClicks++;
    const isAlive = loseLife();
    if (isAlive) { gameOver() }        
  }
}
function addListennerHitBox() {
  state.view.squares.forEach((square) => {
    square.addEventListener("click", () => testHit(square));
  })
}
function loseLife () {
  if (state.values.missClicks >= 10) {
    state.values.lives--;
    state.view.lives.textContent = state.values.lives;
    state.values.missClicks = 0;
    return (state.values.lives<=0)?true:false   
  }
}
async function gameOver () {
  clearInterval(state.values.countDownTimerId)
  clearInterval(state.values.timerId)
  state.view.gamePage.style.display="none"
  state.view.gameOverPage.style.display="flex"
  state.view.endGameMessage.textContent=`Game over! O seu resultado foi ${state.values.score}`;
  if (state.values.playerName !== null) {
    await addDoc(collection(db, coll), 
        {
          playerName: state.values.playerName,
          score: state.values.score,
          date: new Date().toLocaleDateString('pt-BT', {day: 'numeric', month: '2-digit', year: 'numeric'}),        
        }
      );
  }
  state.values.score = 0;
  accelerateTheEnemy(true)
}
function restart () {
  state.view.startPage.style.display="flex";
  state.view.gameOverPage.style.display="none";
  state.view.playerName.value=state.values.playerName;
  
  state.values.level = state.values.levelReset;

  state.values.currentTime = state.values.matchTime;
  state.view.timeLeft.textContent = state.values.currentTime;

  state.values.lives = state.values.livesReset;
  state.view.lives.textContent = state.values.livesReset;
  
  state.values.score = state.values.scoreReset;
  state.view.score.textContent = state.values.scoreReset;
}
function moveEnemy() {
  state.values.timerId = setInterval(randomSquare, state.values.enemyVelocity);
}
function startClock() {
  state.values.countDownTimerId = setInterval(countDown, 1000)
}
function changePage(previousPage, currentPage) {
  state.view[previousPage].style.display="none";
  state.view[currentPage].style.display="flex";
}
function playGame(currentPage) {
  changePage(currentPage, "gamePage")
  state.values.playerName = state.view.playerName.value || null;
  moveEnemy();
  startClock();
}
function backToMenu() {
  state.view.statsPage.style.display="none";
  state.view.rulesPage.style.display="none";

  state.view.startPage.style.display="flex";
}
function ranking() {
  clearInterval(state.values.dotInterval)
  changePage("waitingPage", "statsPage");
  state.values.topTenRanking = state.values.rankingList.sort((a, b) => {
    if (a.score < b.score) {
      return 1;
    }
    if (a.score > b.score) {
      return -1;
    }
    if (a.score === b.score) {
      if (a.date > b.date) {
        return 1;
      }
      if (a.date < b.date) {
        return -1;
      }
    }
    return 0
  }).slice(0, 10)
  state.values.topTenRanking.forEach((result, index) => {
    const item = document.createElement("li");

    const positionName = document.createElement("h3");
    positionName.textContent = `#${index +1}  ${result.playerName}`;
    item.appendChild(positionName)
    
    const score = document.createElement("h3");
    score.textContent = result.score
    item.appendChild(score)

    state.view.ranking.appendChild(item);
  })
}
function changeDots() {  
  const dots = [".", "..", "...", " "];
  console.log(state.view)
  state.values.dots++
  state.view.dots.textContent=dots[state.values.dots+1%4]
}
async function waiting() {
  changePage("startPage", "waitingPage");
  state.values.dotInterval = setInterval(changeDots, 500);  
  await FBFetchData();  
  ranking()
}
function closeStats() {
  state.values.rankingList = [];
  state.values.topTenRanking = [];
  while (state.view.ranking.firstChild) {
    state.view.ranking.removeChild(state.view.ranking.firstChild)
  }
  state.view.ranking.innerHTML = "";
  backToMenu()
}
function handleSound() {
  (state.values.soundOn)?
  state.view.sound.innerHTML = 
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#f4f1f1" viewBox="0 0 256 256">
      <path d="M56.88,31.93A12,12,0,1,0,39.12,48.07L64.51,76H32A20,20,0,0,0,12,96v64a20,20,0,0,0,20,20H75.88l68.75,53.47A12,12,0,0,0,164,224V185.44l35.12,38.63a12,12,0,0,0,17.76-16.14ZM36,100H68v56H36Zm104,99.46L92,162.13V106.24L140,159Zm-31-134a12,12,0,0,1,2.11-16.84l33.51-26.07A12,12,0,0,1,164,32V94.94a12,12,0,0,1-24,0V56.54l-14.15,11A12,12,0,0,1,109,65.44Zm74,49.35a12,12,0,0,1,18-15.85,44,44,0,0,1,5.55,50.21,12,12,0,0,1-21-11.55A19.67,19.67,0,0,0,188,128,20,20,0,0,0,183,114.79ZM252,128a84.18,84.18,0,0,1-19.11,53.35,12,12,0,1,1-18.53-15.25A60,60,0,0,0,212.73,88a12,12,0,1,1,17.88-16A83.87,83.87,0,0,1,252,128Z"></path>
    </svg>`:
  state.view.sound.innerHTML = 
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#f4f1f1" viewBox="0 0 256 256">
      <path d="M157.27,21.22a12,12,0,0,0-12.64,1.31L75.88,76H32A20,20,0,0,0,12,96v64a20,20,0,0,0,20,20H75.88l68.75,53.47A12,12,0,0,0,164,224V32A12,12,0,0,0,157.27,21.22ZM36,100H68v56H36Zm104,99.46L92,162.13V93.87l48-37.33ZM212,128a44,44,0,0,1-11,29.11,12,12,0,1,1-18-15.88,20,20,0,0,0,0-26.43,12,12,0,0,1,18-15.86A43.94,43.94,0,0,1,212,128Zm40,0a83.87,83.87,0,0,1-21.39,56,12,12,0,0,1-17.89-16,60,60,0,0,0,0-80,12,12,0,1,1,17.88-16A83.87,83.87,0,0,1,252,128Z"></path>
    </svg>`    
  state.values.soundOn = !state.values.soundOn;
}

function init() {
  state.view.lives.textContent = state.values.lives;
  state.view.startButton.addEventListener("click", e => playGame("startPage"));
  state.view.continueButton.addEventListener("click", e => playGame("continuePage"));
  state.view.restartButton.addEventListener("click", e => restart());
  state.view.statsButton.addEventListener("click", e => waiting());
  state.view.rulesButton.addEventListener("click", e => changePage("startPage", "rulesPage"));
  state.view.statsCloseButton.addEventListener("click", e => closeStats());
  state.view.rulesCloseButton.addEventListener("click", e => backToMenu());

  state.view.sound.addEventListener("click", e => handleSound());
  addListennerHitBox()
  handleSound()
}
init();