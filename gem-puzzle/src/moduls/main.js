import create from './utils/create'
import audio from '../assets/sounds/chpok.mp3'

export default class GemPuzzle {
  constructor(fieldSize) {
    // Elements
    this.field = create('div', 'field')
    this.startMenu = create('div', 'start-menu', create('div', 'start-menu-button', 'START'))
    this.finishMenu = create('div', 'finish-menu', [
      create('div', 'finish-menu-header', 'VICTORY'),
      create('div', 'finish-menu-item'),
      create('div', 'finish-menu-button', 'OK'),
    ])
    this.soundContainer = create('div', 'sound-container', [
      create('audio', null, null, null, ['src', audio]),
    ])
    this.pauseMenu = create('div', 'pause-menu', 'Game paused')
    this.pauseButton = create('button', 'pause-button', 'Pause')
    this.resetButton = create('button', 'reset-button', 'Reset')
    this.soundButton = create('button', 'sound-button', 'Sound Off')
    this.displayTime = create('div', 'timer', '00:00')
    this.displayMoves = create('div', 'moves', '0')
    this.selectList = create('select', 'select-list', [
      create('option', null, '3x3', null, ['value', '8']),
      create('option', null, '4x4', null, ['value', '15'], ['selected', 'selected']),
      create('option', null, '5x5', null, ['value', '24']),
      create('option', null, '6x6', null, ['value', '35']),
      create('option', null, '7x7', null, ['value', '48']),
      create('option', null, '8x8', null, ['value', '63']),
    ])

    // Variables
    this.fieldSize = fieldSize
    this.cellSize = 100 / Math.sqrt(this.fieldSize + 1)
    this.empty = {
      value: 0,
      left: Math.sqrt(this.fieldSize + 1) - 1,
      top: Math.sqrt(this.fieldSize + 1) - 1,
    }
    this.movesCounter = 0
    this.cells = []
    this.min = 0
    this.sec = 0
    this.timerOn = false
    this.soundOn = true
  }

  generateField() {
    this.numbers = [...Array(this.fieldSize).keys()].map((i) => i + 1)
    //  .sort(() => Math.random() - 0.5)
    this.field.innerHTML = ''
    const randomImg = Math.floor(Math.random() * 10) + 1

    for (let i = 0; i <= this.fieldSize - 1; i += 1) {
      const value = this.numbers[i]
      const cell = create('div', 'cell', `${value}`)
      cell.style.height = `${100 / Math.sqrt(this.fieldSize + 1)}%`
      cell.style.width = `${100 / Math.sqrt(this.fieldSize + 1)}%`
      cell.style.backgroundImage = `url(../assets/img/${this.fieldSize + 1}/${randomImg}/${value}.jpg)`

      const left = i % Math.sqrt(this.fieldSize + 1)
      const top = (i - left) / Math.sqrt(this.fieldSize + 1)

      this.cells.push({
        value,
        left,
        top,
        element: cell,
      })

      cell.style.left = `${left * this.cellSize}%`
      cell.style.top = `${top * this.cellSize}%`

      this.field.append(cell)

      cell.onclick = () => {
        this.move(i)
      }
    }

    this.field.prepend(this.startMenu)
    this.pauseButton.setAttribute('disabled', 'disabled')
    this.startMenu.children[0].onclick = () => {
      this.timerOn = true
      this.timer()
      this.startMenu.classList.add('menu-hidden')
      setTimeout(() => {
        this.field.children[0].remove()
        this.startMenu.classList.remove('menu-hidden')
      }, 500)
      this.pauseButton.removeAttribute('disabled')
    }

    return this
  }

  move = (index) => {
    const cell = this.cells[index]
    const leftDiff = Math.abs(this.empty.left - cell.left)
    const topDiff = Math.abs(this.empty.top - cell.top)

    if (leftDiff + topDiff > 1) {
      return
    }

    cell.element.style.left = `${this.empty.left * this.cellSize}%`
    cell.element.style.top = `${this.empty.top * this.cellSize}%`

    const emptyLeft = this.empty.left
    const emptyTop = this.empty.top
    this.empty.left = cell.left
    this.empty.top = cell.top
    cell.left = emptyLeft
    cell.top = emptyTop

    if (this.soundOn) {
      this.soundContainer.children[0].play()
      this.soundContainer.children[0].currentTime = 0
    }

    const isFinished = this.cells
      .every((c) => c.value === ((c.top * Math.sqrt(this.fieldSize + 1) + c.left) + 1))

    this.movesCounter += 1
    this.displayMoves.innerText = this.movesCounter

    if (isFinished) {
      this.pauseButton.setAttribute('disabled', 'disabled')
      this.timerOn = false
      this.timer()
      this.finishMenu.classList.add('menu-hidden')
      this.field.prepend(this.finishMenu)
      setTimeout(() => {
        this.finishMenu.classList.remove('menu-hidden')
      }, 50)
      this.finishMenu.children[1].innerText = `Time: ${this.displayTime.innerText}, moves: ${this.movesCounter}`
      this.finishMenu.children[2].onclick = () => {
        this.pauseButton.removeAttribute('disabled')
        this.field.children[0].remove()
        this.clear()
        this.generateField()
      }
    }
  }

  timer() {
    const tick = () => {
      this.sec += 1
      if (this.sec >= 60) {
        this.min += 1
        this.sec -= 60
      }
      if (this.min >= 60) {
        this.min -= 60
      }
      if (this.sec < 10) {
        if (this.min < 10) {
          this.displayTime.innerText = `0${this.min}:0${this.sec}`
        } else {
          this.displayTime.innerText = `${this.min}:0${this.sec}`
        }
      } else if (this.min < 10) {
        this.displayTime.innerText = `0${this.min}:${this.sec}`
      } else {
        this.displayTime.innerText = `${this.min}:${this.sec}`
      }
    }

    if (this.timerOn) {
      this.timerInterval = setInterval(tick, 1000)
    } else {
      clearInterval(this.timerInterval)
    }
  }

  clear() {
    this.min = 0
    this.sec = 0
    this.movesCounter = 0
    this.displayMoves.innerText = '0'
    this.displayTime.innerText = '00:00'
    this.timerOn = false
    this.timer()
    this.empty = {
      value: 0,
      left: Math.sqrt(this.fieldSize + 1) - 1,
      top: Math.sqrt(this.fieldSize + 1) - 1,
    }
    this.cells = []
    this.pauseButton.innerText = 'Pause'
    this.cellSize = 100 / Math.sqrt(this.fieldSize + 1)
  }

  init() {
    this.generateField(this.fieldSize)

    this.pauseButton.onclick = () => {
      if (this.timerOn) {
        this.timerOn = false
        this.pauseButton.innerText = 'Resume'
        this.pauseMenu.classList.add('menu-hidden')
        this.field.prepend(this.pauseMenu)
        setTimeout(() => {
          this.pauseMenu.classList.remove('menu-hidden')
        }, 50)
      } else {
        this.timerOn = true
        this.pauseButton.innerText = 'Pause'
        this.pauseMenu.classList.add('menu-hidden')
        setTimeout(() => {
          this.pauseMenu.classList.remove('menu-hidden')
          this.field.children[0].remove()
        }, 500)
      }
      this.timer()
    }

    this.resetButton.onclick = () => {
      this.clear()
      this.generateField()
      this.timer()
    }

    this.soundButton.onclick = () => {
      if (this.soundOn) {
        this.soundOn = false
        this.soundButton.innerText = 'Sound On'
      } else {
        this.soundOn = true
        this.soundButton.innerText = 'Sound Off'
      }
    }

    this.selectList.onchange = () => {
      this.fieldSize = +this.selectList.value
      this.clear()
      this.generateField()
    }

    this.container = create('div', 'gem-puzzle', [
      create('div', 'header', 'Gem puzzle!'),
      create('div', 'info', [this.displayTime, this.displayMoves]),
      this.field,
      create('div', 'controls', [this.pauseButton, this.resetButton, this.soundButton, this.selectList]),
      this.soundContainer,
    ])
    document.body.append(this.container)
  }
}
