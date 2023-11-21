const state = {
  view: {
    squares: document.querySelectorAll(".square"),
    enemy: document.querySelector(".enemy"),
    timeLeft: document.querySelector("#time-left"),
    score: document.querySelector("#score"),
  },
  values: {
    enemyVelocity: 1000,
    hitPosition: 0,
    result: 0,
    pointsPerHit: 1,
    currentTime: 60,
  },
  actions: {    
    timerID: setInterval(randomSquare, 1000),
    countDownTimerId: setInterval(countDown, 1000),
  }
}
function countDown() {
  state.values.currentTime--;
  state.view.timeLeft.textContent = state.values.currentTime;

  if (state.values.currentTime<=0) {
    clearInterval(state.actions.timerId)
    clearInterval(state.actions.countDownTimerId)
    alert(`Game over! O seu resultado foi ${state.values.result}`)
  }
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
  let audio = new Audio(`.src/audios/${audioName}.m4a`);
  audio.volume = 0.3;
  audio.play()
}

function addListennerHitBox() {
  state.view.squares.forEach((square) => {
    square.addEventListener("mousedown", () => {
      if(square.id === state.values.hitPosition) {
        state.values.result+=state.values.pointsPerHit;
        state.view.score.textContent = state.values.result;
        state.values.hitPosition = null;
        playSound("hit")
      }
    })
  })
}

function init() {
  addListennerHitBox()

}
init();