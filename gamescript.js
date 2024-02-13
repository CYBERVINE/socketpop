const opponent = document.getElementById('opponent')
const discOne = document.getElementById('1')
const discTwo = document.getElementById('2')
const discThree = document.getElementById('3')
const discFour = document.getElementById('4')
const playerOne = document.getElementById('playerOne')
const playerTwo = document.getElementById('playerTwo')

const discs = [discOne,discTwo,discThree,discFour]

document.addEventListener('mousemove', (e)=>{
    const mousePosition = {
        x : e.clientX,
        y : e.clientY
    }
    socket.emit('mouse-position', mousePosition)
})

socket.on('opponent', position=>{
    opponent.style.top = `${position.y}px`
    opponent.style.left = `${position.x}px`
})

socket.on('game-state', gameState=> {
    discs[gameState].classList.toggle("disc--active")
})

socket.on('player-score', player => {
    if (player.socketId === socket.id){
        playerOne.innerText=`Your Score ${player.score}`
    } else {
        playerTwo.innerText=`Their Score ${player.score}`
    }


})
socket.on('toggle', discId => {
    console.log('toggle',discId)
    console.log(discs[discId-1].classList[1])
    discs[discId-1].classList.toggle("disc--active")
})

discs.forEach(disc=>{
    disc.addEventListener('click', ()=> {
        if(disc.classList.length>1){
            console.log(disc.id)
            socket.emit('clicked', disc.id)
        }
    })
})


function changeColor(disc){
    console.log(disc)
    disc.classList.toggle('disc--active')
    console.log('click')
}