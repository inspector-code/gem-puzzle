import create from './utils/create'

export default class GemPuzzle {
  constructor(fieldSize) {
    this.field = create('div', 'field')
    this.startMenu = create('div', 'start-menu', create('div', 'start-menu-button', 'START'))
    this.finishMenu = create('div', 'finish-menu', [
      create('div', 'finish-menu-header', 'VICTORY'),
      create('div', 'finish-menu-item'),
      create('div', 'finish-menu-button', 'OK'),
    ])
    this.pauseMenu = create('div', 'pause-menu', 'Game paused')
    this.pauseButton = create('button', 'pause-button', 'Pause')
    this.resetButton = create('button', 'reset-button', 'Reset')
    this.displayTime = create('div', 'timer', '00:00')
    this.displayMoves = create('div', 'moves', '0')
    this.fieldSize = fieldSize
    this.movesCounter = 0
    this.empty = {
      value: 0,
      left: 3,
      top: 3,
    }
    this.cellSize = 100
    this.cells = []
    this.min = 0
    this.sec = 0
    this.timerOn = false
  }

  generateField() {
    this.numbers = [...Array(15).keys()].map((i) => i + 1).sort(() => Math.random() - 0.5)
    this.field.innerHTML = ''

    for (let i = 0; i <= this.fieldSize - 1; i += 1) {
      const value = this.numbers[i]
      const cell = create('div', 'cell', `${value}`)

      const left = i % 4
      const top = (i - left) / 4

      this.cells.push({
        value,
        left,
        top,
        element: cell,
      })

      cell.style.left = `${left * this.cellSize}px`
      cell.style.top = `${top * this.cellSize}px`

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

    cell.element.style.left = `${this.empty.left * this.cellSize}px`
    cell.element.style.top = `${this.empty.top * this.cellSize}px`

    const emptyLeft = this.empty.left
    const emptyTop = this.empty.top
    this.empty.left = cell.left
    this.empty.top = cell.top
    cell.left = emptyLeft
    cell.top = emptyTop

    const isFinished = this.cells.every((c) => c.value === ((c.top * 4 + c.left) + 1))

    this.movesCounter += 1
    this.displayMoves.innerText = this.movesCounter

    if (isFinished) {
      this.pauseButton.setAttribute('disabled', 'disabled')
      this.timerOn = false
      this.timer()
      this.field.prepend(this.finishMenu)
      this.finishMenu.children[1].innerText = `Time: ${this.displayTime.innerText}, moves: ${this.movesCounter}`
      this.finishMenu.children[2].onclick = () => {
        this.pauseButton.removeAttribute('disabled')
        this.field.children[0].remove()
        this.clear()
        this.timerOn = true
        this.timer()
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
    this.empty = {
      value: 0,
      left: 3,
      top: 3,
    }
    this.cells = []
  }

  init() {
    this.generateField(this.fieldSize)

    this.pauseButton.onclick = () => {
      if (this.timerOn) {
        this.timerOn = false
        this.pauseButton.innerText = 'Resume'
        this.field.prepend(this.pauseMenu)
      } else {
        this.timerOn = true
        this.pauseButton.innerText = 'Pause'
        this.field.children[0].remove()
      }
      this.timer()
    }

    this.resetButton.onclick = () => {
      this.clear()
      this.generateField()
      this.timer()
    }

    this.container = create('div', 'gem-puzzle', [
      create('div', 'header', 'Gem puzzle!'),
      create('div', 'info', [this.displayTime, this.displayMoves]),
      this.field,
      create('div', 'controls', [this.pauseButton, this.resetButton]),
    ])
    document.body.append(this.container)
  }
}
