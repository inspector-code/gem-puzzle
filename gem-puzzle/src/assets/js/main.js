import create from './utils/create'
import { get, set } from './utils/storage'
import audio from '../sounds/chpok.mp3'

export default class GemPuzzle {
  constructor(fieldSize) {
    // Elements
    this.field = create('div', 'field')
    this.startMenu = create('div', 'menu', create('div', 'start-menu-button', 'START'))
    this.finishMenu = create('div', 'menu', [
      create('div', 'finish-menu-header', 'VICTORY'),
      create('div', 'finish-menu-item'),
      create('div', 'finish-menu-button', 'OK'),
    ])
    this.scoreMenu = create('div', 'score-menu', [
      create('div', 'score-menu-header', 'Score'),
      create('div', 'score-menu-container'),
      create('div', 'score-menu-button', 'Ok'),
    ])
    this.pauseMenu = create('div', 'menu', create('div', 'pause-menu-header', 'Game Paused'))
    this.soundContainer = create('div', 'sound-container', [
      create('audio', null, null, null, ['src', audio]),
    ])
    this.pauseButton = create('button', 'common-button', 'Pause')
    this.resetButton = create('button', 'common-button', 'Reset')
    this.soundButton = create('button', 'common-button', 'Off sound')
    this.saveButton = create('button', 'common-button', 'Save')
    this.loadButton = create('button', 'common-button', 'Load')
    this.scoreButton = create('button', 'common-button', 'Score')
    this.displayTime = create('div', 'timer', [
      create('span', 'timer-text', 'Time: '),
      create('span', 'timer-digits', '00:00'),
    ])
    this.displayMoves = create('div', 'moves', '0 moves')
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
    this.randomImage = null
    this.score = get('score') || []
  }

  generateArray() {
    const randomArray = [...Array(this.fieldSize).keys()].map((i) => i + 1)
      .sort(() => Math.random() - 0.5)
    randomArray.push(0)

    let inv = 0
    for (let i = 0; i < this.fieldSize + 1; i += 1) {
      if (randomArray[i]) {
        for (let j = 0; j < i; j += 1) {
          if (randomArray[j] > randomArray[i]) {
            inv += 1
          }
        }
      }
    }
    for (let i = 0; i < this.fieldSize + 1; i += 1) {
      if (randomArray[i] === 0) {
        inv += Math.floor(1 + (i / Math.sqrt(this.fieldSize + 1)))
      }
    }

    if (((this.fieldSize + 1) % 2 === 0) && (inv % 2 === 0)) {
      return randomArray
    }
    if (((this.fieldSize + 1) % 2 !== 0) && (inv % 2 !== 0)) {
      return randomArray
    }
    return this.generateArray()
  }

  generateField() {
    this.numbers = this.generateArray()
    this.field.innerHTML = ''
    this.randomImage = Math.floor(Math.random() * 10) + 1

    for (let i = 0; i <= this.fieldSize - 1; i += 1) {
      const value = this.numbers[i]
      const cell = create('div', 'cell unselectable', `${value}`)
      cell.style.height = `${100 / Math.sqrt(this.fieldSize + 1)}%`
      cell.style.width = `${100 / Math.sqrt(this.fieldSize + 1)}%`
      cell.style.backgroundImage = `url(assets/img/${this.fieldSize + 1}/${this.randomImage}/${value}.jpg)`

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

      cell.classList.add('cell-hidden')
      this.field.append(cell)
      setInterval(() => {
        cell.classList.remove('cell-hidden')
      }, 70)

      cell.onclick = () => {
        this.move(i)
      }

      cell.onmousedown = this.drag
    }

    this.field.prepend(this.startMenu)
    this.pauseButton.setAttribute('disabled', 'disabled')
    this.startMenu.children[0].onclick = () => {
      this.timerOn = true
      this.timer()
      this.startMenu.classList.add('menu-hidden')
      setTimeout(() => {
        this.startMenu.remove()
        this.startMenu.classList.remove('menu-hidden')
      }, 500)
      this.pauseButton.removeAttribute('disabled')
    }

    return this
  }

  drag = (e) => {
    e.target.classList.add('index')
    e.target.style.transition = '0s'

    const mouseMove = (left, top) => {
      e.target.style.left = `${left}%`
      e.target.style.top = `${top}%`
    }

    this.field.onmousemove = (ev) => {
      const left = ((ev.pageX - this.field.offsetLeft - e.offsetX) / this.field.clientWidth) * 100
      const top = ((ev.pageY - this.field.offsetTop - e.offsetY) / this.field.clientHeight) * 100
      mouseMove(left, top)
    }

    this.field.onmouseup = () => {
      e.target.style.transition = '.3s'
      e.target.classList.remove('index')
      this.field.onmousemove = null
      this.field.onmouseup = null
    }
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
    this.displayMoves.innerText = `${this.movesCounter} moves`

    if (isFinished) {
      this.pauseButton.setAttribute('disabled', 'disabled')
      this.timerOn = false
      this.timer()
      this.finishMenu.classList.add('menu-hidden')
      this.field.prepend(this.finishMenu)
      setTimeout(() => {
        this.finishMenu.classList.remove('menu-hidden')
      }, 50)
      this.finishMenu.children[1].innerText = `Time: ${this.displayTime.children[1].innerText}, moves: ${this.movesCounter}`

      this.score.push({
        game: `${Math.sqrt(+this.selectList.value + 1)}x${Math.sqrt(+this.selectList.value + 1)}`,
        displayTime: this.displayTime.children[1].innerText,
        moves: this.movesCounter,
        score: ((this.min * 60) + this.sec) * this.movesCounter,
      })
      set('score', this.score)

      this.finishMenu.children[2].onclick = () => {
        this.pauseButton.removeAttribute('disabled')
        this.finishMenu.remove()
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
          this.displayTime.children[1].innerText = `0${this.min}:0${this.sec}`
        } else {
          this.displayTime.children[1].innerText = `${this.min}:0${this.sec}`
        }
      } else if (this.min < 10) {
        this.displayTime.children[1].innerText = `0${this.min}:${this.sec}`
      } else {
        this.displayTime.children[1].innerText = `${this.min}:${this.sec}`
      }
    }

    if (this.timerOn) {
      clearInterval(this.timerInterval)
      this.timerInterval = setInterval(tick, 1000)
    } else {
      clearInterval(this.timerInterval)
    }
  }

  clear() {
    this.min = 0
    this.sec = 0
    this.movesCounter = 0
    this.displayMoves.innerText = '0 moves'
    this.displayTime.children[1].innerText = '00:00'
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
        this.pauseButton.innerText = 'Play!'
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
          this.pauseMenu.remove()
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
        this.soundButton.innerText = 'On sound'
      } else {
        this.soundOn = true
        this.soundButton.innerText = 'Off sound'
      }
    }

    this.selectList.onchange = () => {
      this.fieldSize = +this.selectList.value
      this.clear()
      this.generateField()
    }

    this.saveButton.onclick = () => {
      set('empty', this.empty)
      const savedCells = []
      this.cells.forEach(({ value, left, top }) => savedCells.push({ value, left, top }))
      set('cells', savedCells)
      set('timeAndMoves', [this.min, this.sec, this.movesCounter])
      set('fieldSize', this.fieldSize)
      set('randomImage', this.randomImage)
    }

    this.loadButton.onclick = () => {
      const savedCells = get('cells')
      if (savedCells) {
        this.empty = get('empty')
        this.fieldSize = get('fieldSize')
        this.cellSize = 100 / Math.sqrt(this.fieldSize + 1)
        this.randomImage = get('randomImage')

        const newCells = []

        savedCells.forEach((i, index) => {
          const cell = create('div', 'cell unselectable', `${i.value}`)
          cell.style.left = `${i.left * this.cellSize}%`
          cell.style.top = `${i.top * this.cellSize}%`
          cell.style.height = `${100 / Math.sqrt(this.fieldSize + 1)}%`
          cell.style.width = `${100 / Math.sqrt(this.fieldSize + 1)}%`
          cell.style.backgroundImage = `url(assets/img/${this.fieldSize + 1}/${this.randomImage}/${i.value}.jpg)`
          cell.onclick = () => {
            this.move(index)
          }
          newCells.push({
            value: i.value,
            left: i.left,
            top: i.top,
            element: cell,
          })
        })
        this.cells = newCells

        this.field.innerHTML = ''
        this.cells.forEach(({ element }) => {
          element.classList.add('cell-hidden')
          this.field.append(element)
          setTimeout(() => {
            element.classList.remove('cell-hidden')
          }, 70)
        })

        const [min, sec, moves] = get('timeAndMoves')
        this.min = min
        this.sec = sec
        this.timerOn = true
        this.timer()
        this.pauseButton.innerText = 'Pause'
        this.pauseButton.removeAttribute('disabled')
        this.movesCounter = moves
        this.displayMoves.innerText = `${moves} moves`
        this.selectList.value = this.fieldSize
      }
    }

    this.scoreButton.onclick = () => {
      this.scoreMenu.children[1].innerHTML = ''
      const scoreArray = get('score')

      if (scoreArray) {
        scoreArray.sort((a, b) => (a.score > b.score ? 1 : -1))
        scoreArray.splice(10)
        scoreArray.forEach(({ game, displayTime, moves }) => {
          const element = create('div', 'score-item', `<b>Game:</b> ${game}, <b>time:</b> ${displayTime}, <b>moves:</b> ${moves}`)
          this.scoreMenu.children[1].append(element)
        })
      } else {
        this.scoreMenu.children[1].innerText = 'No winners yet :('
      }

      this.scoreMenu.classList.add('menu-hidden')
      this.field.prepend(this.scoreMenu)
      setTimeout(() => {
        this.scoreMenu.classList.remove('menu-hidden')
      }, 50)

      this.scoreMenu.children[2].onclick = () => {
        this.scoreMenu.classList.add('menu-hidden')
        setTimeout(() => {
          this.scoreMenu.remove()
          this.scoreMenu.classList.remove('menu-hidden')
        }, 500)
      }
    }

    this.container = create('div', 'gem-puzzle', [
      create('div', 'header', 'Gem-puzzle'),
      create('div', 'info', [this.displayTime, this.displayMoves]),
      this.field,
      create('div', 'controls', [
        create('div', 'controls-line-buttons', [
          this.pauseButton, this.resetButton, this.soundButton, this.saveButton,
          this.loadButton, this.scoreButton,
        ]),
        create('div', 'controls-line-list', this.selectList),
      ]),
      this.soundContainer,
    ])
    document.body.append(this.container)
  }
}
