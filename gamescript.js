const opponent = document.getElementById('opponent')
const discOne = document.getElementById('1')
const discTwo = document.getElementById('2')
const discThree = document.getElementById('3')
const discFour = document.getElementById('4')
const discFive = document.getElementById('5')
const discSix = document.getElementById('6')
const discSeven = document.getElementById('7')
const discEight = document.getElementById('8')
const playerOne = document.getElementById('playerOne')
const playerTwo = document.getElementById('playerTwo')
const discs = [discOne,discTwo,discThree,discFour,discFive,discSix,discSeven,discEight]
const soundOne = new Audio('./sound1.mp3');
const soundTwo = new Audio('./sound2.wav');
const popOne = new Audio('./pop1.wav');
const popTwo = new Audio('./pop2.wav');
const popThree = new Audio('./pop3.mp3');
const popFour = new Audio('./pop4.mp3');
const popFive = new Audio('./pop5.mp3');
const sounds = [soundOne,soundTwo]
const pops = [popOne,popTwo,popThree,popFour,popFive]
sounds.forEach(sound=>sound.volume = 0.005)
pops.forEach(pop=>pop.volume = 0.07)

document.addEventListener('mousemove', (e)=>{
    const mousePosition = {
        x : e.clientX,
        y : e.clientY
    }
    localVideo.style.top = `${mousePosition.y - 60}px`
    localVideo.style.left = `${mousePosition.x - 60}px`
    socket.emit('mouse-position', mousePosition)
})

socket.on('opponent', position=>{
    remoteVideo.style.top = `${position.y - 60}px`
    remoteVideo.style.left = `${position.x - 60}px`
})

socket.on('game-state', gameState=> {
    discs[gameState[0]].classList.toggle("disc--active")
    if(discs[gameState[0]].classList[1]==="disc--active"){
        sounds[gameState[1]].play();
    }
})

socket.on('player-score', player => {
    if (player.socketId === socket.id){
        playerOne.innerText=`You: ${player.score}`
    } else {
        playerTwo.innerText=`Them: ${player.score}`
    }
})

socket.on('resetButton', ()=>{
    menu.innerHTML = ""
    const reset = document.createElement("button")
    reset.addEventListener('click', ()=> {
        socket.emit('reset')
    })
    reset.innerText = "Reset"
    const exit = document.createElement("button")
    exit.addEventListener('click', ()=> {
        location.reload()
    })
    exit.innerText = "Exit"
    menu.appendChild(reset)
    menu.appendChild(exit)
})

socket.on('clearGame', ()=>{
    
    for(i=0;i<discs.length;i++){
        discs[i].classList.remove("disc--active")
    }
    playerOne.innerText=`You: ${0}`
    playerTwo.innerText=`Them: ${0}`
})


socket.on('toggle', discId => {
    discs[discId-1].classList.toggle("disc--active")
})

discs.forEach(disc=>{
    disc.addEventListener('click', ()=> {
        if(disc.classList.length>1){
            socket.emit('clicked', disc.id)
        }
        pops[Math.floor(Math.random()*5)].play()
    })
})