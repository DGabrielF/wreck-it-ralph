const state = {
  view: {
    gamePanel: document.querySelector(".panel"),
    startMenu: document.querySelector(".start-menu"),
    squares: document.querySelectorAll(".square"),
    enemy: document.querySelector(".enemy"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
    continuePage: document.querySelector(".continue-page"),
    endGame: document.querySelector(".end-game"),
    endGameMessage: document.querySelector("#result"),
    lives: document.querySelector("#lives"),
    level: document.querySelector("#level"),
    playerName: document.querySelector(".name")
  },
  values: {
    level: 1,
    lives: 3,
    playerName: null,
    timerId: null,
    enemyVelocity: 1000,
    countDownTimerId: 1000,
    hitPosition: 0,
    result: 0,
    currentTime: 20,
    missClicks: 0,
    matchTime: 20,
  }
}
function countDown() {
  state.values.currentTime--;
  state.view.timeLeft.textContent = state.values.currentTime;

  if (state.values.currentTime<=0) {
    state.view.continuePage.style.display="flex";
    state.view.gamePanel.style.display="none"
    clearInterval(state.values.countDownTimerId)
    clearInterval(state.values.timerId)
    state.values.currentTime = state.values.matchTime;
    accelerateTheEnemy(clean=false)

    // clearInterval(state.actions.timerId)
    // clearInterval(state.actions.countDownTimerId);
  }
}
function accelerateTheEnemy(clean=false) {
  state.values.enemyVelocity = !clean?state.values.enemyVelocity-state.values.level:1000

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
// function playSound(audioName) {
//   let audio = new Audio(`.src/audios/${audioName}.m4a`);
//   audio.volume = 0.3;
//   audio.play()
// }

function addListennerHitBox() {
  state.view.squares.forEach((square) => {
    square.addEventListener("mousedown", () => {
      if (square.id === state.values.hitPosition) {
        state.values.result+=state.values.level;
        state.view.score.textContent = state.values.result;
        state.values.hitPosition = null;
        // playSound("hit");
      } else if (square.id !== state.values.hitPosition) {
        state.values.missClicks++;
        const isAlive = loseLife();
        if (isAlive) { gameOver() }        
      }
    })
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
function gameOver () {
  clearInterval(state.values.countDownTimerId)
  clearInterval(state.values.timerId)
  state.view.gamePanel.style.display="none"
  state.view.endGame.style.display="flex"
  state.view.endGameMessage.textContent=`Game over! O seu resultado foi ${state.values.result}`;
  // TODO se o jogador tiver adicionado um nome, enviar o nome e a pontuação para o banco de dados
  state.values.result = 0;
  accelerateTheEnemy(clean=true)
}
function restart () {
  state.view.startMenu.style.display="flex";
  state.view.endGame.style.display="none";
  state.view.playerName.value=state.values.playerName
}

function moveEnemy() {
  state.values.timerId = setInterval(randomSquare, state.values.enemyVelocity);
}
function startClock() {
  state.values.countDownTimerId = setInterval(countDown, 1000)
}


function startGame() {
  if (state.view.startMenu.style.display!=="nome") {
    state.view.startMenu.style.display="none";
  }
  if (state.view.continuePage.style.display!=="nome") {
    state.view.continuePage.style.display="none";
  }
  if (state.view.endGame.style.display!=="nome") {
    state.view.endGame.style.display="none";
  }
  state.view.gamePanel.style.display="flex";
  state.values.playerName = state.view.playerName.value || null;
  moveEnemy();
  startClock();
}

function init() {
  state.view.lives.textContent = state.values.lives
  addListennerHitBox()
  // Zerar o tempo faz aumentar a pontuação por click e aumenta a velocidade do Ralph
  // Enviar o escore com o nome para o firebase
  // Fazer uma página de rank
  // fazer o Ralph desaparacer e aparecer
  // Subir o projeto
}
init();