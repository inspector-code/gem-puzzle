import create from './utils/create'

export default class GemPuzzle {
  constructor() {
    this.field = create('div', 'field')
    this.startMenu = create('div', 'start-menu', create('div', 'menu-item', 'START'))
    this.finishMenu = create('div', 'finish-menu', [
      create('div', 'finish-menu-item'),
      create('div', 'finish-menu-button', 'OK'),
    ])
    this.displayTime = create('div', 'timer', '00:00')
    this.displayMoves = create('div', 'moves', '0')
    this.movesCounter = 0
    this.empty = {
      value: 0,
      left: 3,
      top: 3,
    }
    this.cellSize = 100
    this.cells = []
    this.numbers = [...Array(15).keys()].map((i) => i + 1)
    // .sort(() => Math.random() - 0.5)
    this.min = 0
    this.sec = 0
  }

  generateField(fieldSize) {
    this.field.innerHTML = ''
    for (let i = 0; i <= fieldSize - 1; i += 1) {
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

      cell.addEventListener('click', () => {
        this.move(i)
      })
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
      this.timer(false)
      this.field.prepend(this.finishMenu)
      this.finishMenu.children[0].innerText = `U WON ${this.displayTime.innerHTML}, moves: ${this.movesCounter}`
      this.finishMenu.children[1].onclick = () => {
        this.field.children[0].remove()
        this.clearTimer()
        this.movesCounter = 0
        this.displayMoves.innerText = '0'
        this.displayTime.innerText = '00:00'
        this.timer(true)
      }
    }
  }

  timer(isOn) {
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

    if (isOn) {
      this.timerInterval = setInterval(tick, 1000)
    } else {
      clearInterval(this.timerInterval)
    }
  }

  clearTimer() {
    this.min = 0
    this.sec = 0
  }

  init() {
    this.field.prepend(this.startMenu)
    this.startMenu.children[0].onclick = () => {
      this.timer(true)
      this.field.children[0].remove()
    }

    this.container = create('div', 'gem-puzzle', [
      create('div', 'header', 'Gem puzzle!'),
      create('div', 'info', [this.displayTime, this.displayMoves]),
      this.field,
      create('div', 'controls'),
    ])
    document.body.append(this.container)
  }
}
