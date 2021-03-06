import create from './utils/create'
import { get, set } from './utils/storage'
import audio from '../sounds/chpok.mp3'
import setBg from './set-background'
import sortKey from './sort-array'

const PLAYER = 'player'
const VICTORY = 'victory'
const AUTOCOMPLETE = 'autocomplete'
const LOOSE = 'loose'
const COMPUTER = 'computer'

export default class GemPuzzle {
  constructor(fieldSize) {
    // Elements
    this.field = create('div', 'field')
    this.startMenu = create('div', 'menu',
      create('div', 'start-menu-button', 'START'))
    this.finishMenu = create('div', 'menu', [
      create('div', 'finish-menu-header', 'VICTORY'),
      create('div', 'finish-menu-item'),
      create('div', 'finish-menu-button', 'Ok'),
    ])
    this.looseMenu = create('div', 'menu', [
      create('div', 'loose-menu-header', 'You&nbsp;&nbsp;&nbsp;loose'),
      create('div', 'loose-menu-button', 'Try&nbsp;&nbsp;&nbsp;again'),
    ])
    this.scoreMenu = create('div', 'score-menu', [
      create('div', 'score-menu-header', 'Score'),
      create('div', 'score-menu-container'),
      create('div', 'score-menu-button', 'Ok'),
    ])
    this.pauseMenu = create('div', 'menu',
      create('div', 'pause-menu-header', 'Game Paused'))
    this.soundContainer = create('div', 'sound-container', [
      create('audio', null, null, null, ['src', audio]),
    ])
    this.pauseButton = create('button', 'common-button', 'Pause')
    this.resetButton = create('button', 'common-button', 'Reset')
    this.soundButton = create('button', 'common-button', 'Off sound')
    this.saveButton = create('button', 'common-button', 'Save')
    this.loadButton = create('button', 'common-button', 'Load')
    this.scoreButton = create('button', 'common-button', 'Score')
    this.finishButton = create('button', 'common-button', 'Finish')
    this.displayTime = create('div', 'timer', [
      create('span', 'timer-text', 'Time: '),
      create('span', 'timer-digits', '00:00'),
    ])
    this.displayMoves = create('div', 'moves', '0 moves')
    this.selectList = create('select', 'select-list', [
      create('option', null, '3x3', null, ['value', '8']),
      create('option', null, '4x4', null, ['value', '15'],
        ['selected', 'selected']),
      create('option', null, '5x5', null, ['value', '24']),
      create('option', null, '6x6', null, ['value', '35']),
      create('option', null, '7x7', null, ['value', '48']),
      create('option', null, '8x8', null, ['value', '63']),
    ])
    this.selectGameType = create('select', 'select-list', [
      create('option', null, 'Images', null, ['value', 'images'],
        ['selected', 'selected']),
      create('option', null, 'Digits', null, ['value', 'digits']),
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
    this.gameType = 'images'
    this.gameKey = []
  }

  generateField() {
    this.gameKey = []
    this.field.innerHTML = ''
    this.randomImage = Math.floor(Math.random() * 150) + 1
    const randomArray = [...Array(60 * this.fieldSize).keys()]
      .map(() => Math.floor(Math.random() * this.fieldSize))
      .filter((item, index, array) => item !== array[index + 1])

    for (let i = 0; i <= this.fieldSize - 1; i += 1) {
      const value = i + 1
      const cell = create('div', 'cell unselectable', `${this.gameType === 'images' ? '' : value}`)
      cell.style.height = `${100 / Math.sqrt(this.fieldSize + 1)}%`
      cell.style.width = `${100 / Math.sqrt(this.fieldSize + 1)}%`
      setBg(cell, value, this.gameType, this.fieldSize, this.randomImage)

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

      const appendCells = () => {
        this.field.append(cell)

        setTimeout(() => {
          cell.classList.remove('cell-hidden')
        }, 70)

        cell.onclick = () => {
          this.move(i, PLAYER)
          this.isFinished(VICTORY)
        }

        cell.onmousedown = (event) => {
          this.drag(event, i)
        }
      }

      if (this.gameType === 'images') {
        const img = create('img', null, null, null,
          ['src', `assets/img/background/${this.randomImage}.jpg`])
        img.onload = () => {
          appendCells()
        }
      } else {
        appendCells()
      }
    }

    randomArray.forEach((item) => this.move(item, COMPUTER))

    this.field.prepend(this.startMenu)
    this.pauseButton.setAttribute('disabled', 'disabled')
    this.finishButton.setAttribute('disabled', 'disabled')
    const startButton = this.startMenu.children[0]
    startButton.onclick = () => {
      this.timerOn = true
      this.timer()
      this.startMenu.classList.add('menu-hidden')
      setTimeout(() => {
        this.startMenu.remove()
        this.startMenu.classList.remove('menu-hidden')
      }, 500)
      this.pauseButton.removeAttribute('disabled')
      this.finishButton.removeAttribute('disabled')
    }

    return this
  }

  drag = (ev, ind) => {
    const cell = this.cells[ind]

    const leftDiff = Math.abs(this.empty.left - cell.left)
    const topDiff = Math.abs(this.empty.top - cell.top)

    if (leftDiff + topDiff <= 1) {
      cell.element.classList.add('index')
      cell.element.style.transition = '0s'

      this.field.onmouseleave = () => {
        cell.element.style.transition = '.3s'
        setTimeout(() => {
          cell.element.classList.remove('index')
        }, 300)
        this.move(ind, PLAYER)
      }

      const mouseMove = (left, top) => {
        cell.element.style.left = `${left}%`
        cell.element.style.top = `${top}%`
      }

      this.field.onmousemove = (e) => {
        const {
          clientWidth, offsetLeft, clientLeft, offsetTop, clientTop, clientHeight,
        } = this.field
        const { offsetX, offsetY } = ev
        const { pageX, pageY } = e
        // eslint-disable-next-line max-len
        const left = ((pageX - offsetLeft - offsetX - clientLeft - ev.target.clientLeft) / clientWidth) * 100
        // eslint-disable-next-line max-len
        const top = ((pageY - offsetTop - offsetY - clientTop - ev.target.clientTop) / clientHeight) * 100
        mouseMove(left, top)
      }

      this.field.onmouseup = () => {
        cell.element.style.transition = '.3s'
        setTimeout(() => {
          cell.element.classList.remove('index')
        }, 300)
        this.field.onmousemove = null
        this.field.onmouseup = null
      }
    }
  }

  move = (index, moveMode) => {
    const cell = this.cells[index]
    const leftDiff = Math.abs(this.empty.left - cell.left)
    const topDiff = Math.abs(this.empty.top - cell.top)

    if (leftDiff + topDiff > 1) {
      return
    }

    if (moveMode !== AUTOCOMPLETE) {
      this.gameKey.push(index)
    }

    cell.element.style.left = `${this.empty.left * this.cellSize}%`
    cell.element.style.top = `${this.empty.top * this.cellSize}%`

    const [emptyLeft, emptyTop] = [this.empty.left, this.empty.top]
    this.empty.left = cell.left
    this.empty.top = cell.top
    cell.left = emptyLeft
    cell.top = emptyTop

    this.field.onmouseleave = null
    this.field.onmousemove = null
    this.field.onmouseup = null

    if (moveMode === PLAYER) {
      if (this.soundOn) {
        const moveSound = this.soundContainer.children[0]
        moveSound.play()
        moveSound.currentTime = 0
      }

      this.movesCounter += 1
      this.displayMoves.innerText = `${this.movesCounter} moves`
    }
  }

  isFinished(finishType) {
    const isFinished = this.cells
      .every((c) => c.value === ((c.top * Math.sqrt(this.fieldSize + 1) + c.left) + 1))

    if (isFinished) {
      if (this.gameType === 'images') {
        const img = create('img', 'finished-image finished-image-hide', null, null,
          ['src', `assets/img/background/${this.randomImage}.jpg`], ['alt', 'image'])
        this.field.prepend(img)
        setTimeout(() => {
          img.classList.remove('finished-image-hide')
        }, 50)
      }
      this.pauseButton.setAttribute('disabled', 'disabled')
      this.timerOn = false
      this.timer()

      if (finishType === VICTORY) {
        this.finishMenu.classList.add('menu-hidden')
        this.field.prepend(this.finishMenu)
        setTimeout(() => {
          this.finishMenu.classList.remove('menu-hidden')
        }, 50)
        const finishMenuText = this.finishMenu.children[1]
        finishMenuText.innerText = `Time: ${this.displayTime.children[1].innerText}, moves: ${this.movesCounter}`

        this.score.push({
          game: `${this.gameType} ${Math.sqrt(+this.selectList.value + 1)}x${Math.sqrt(+this.selectList.value + 1)}`,
          displayTime: this.displayTime.children[1].innerText,
          moves: this.movesCounter,
          score: ((this.min * 60) + this.sec) * this.movesCounter,
        })
        set('score', this.score)

        const finishButton = this.finishMenu.children[2]
        finishButton.onclick = () => {
          this.pauseButton.removeAttribute('disabled')
          this.finishMenu.remove()
          this.clear()
          this.generateField()
        }
      } else {
        this.looseMenu.classList.add('menu-hidden')
        this.field.prepend(this.looseMenu)
        setTimeout(() => {
          this.looseMenu.classList.remove('menu-hidden')
        }, 50)

        const looseButton = this.looseMenu.children[1]
        looseButton.onclick = () => {
          this.pauseButton.removeAttribute('disabled')
          this.looseMenu.remove()
          this.clear()
          this.generateField()
        }
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
    const displayTimeField = this.displayTime.children[1]
    displayTimeField.innerText = '00:00'
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
    this.gameKey = []
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

    this.selectGameType.onchange = () => {
      this.gameType = this.selectGameType.value
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
      set('gameType', this.gameType)
      this.loadButton.removeAttribute('disabled')
      set('gameKey', this.gameKey)
    }

    if (get('cells')) {
      this.loadButton.removeAttribute('disabled')
    } else {
      this.loadButton.setAttribute('disabled', 'disabled')
    }

    this.loadButton.onclick = () => {
      const savedCells = get('cells')
      if (savedCells) {
        this.empty = get('empty')
        this.fieldSize = get('fieldSize')
        this.cellSize = 100 / Math.sqrt(this.fieldSize + 1)
        this.randomImage = get('randomImage')
        this.gameType = get('gameType')
        this.gameKey = get('gameKey')

        const newCells = []

        savedCells.forEach((i, index) => {
          const cell = create('div', 'cell unselectable', `${this.gameType === 'images' ? '' : i.value}`)
          cell.style.left = `${i.left * this.cellSize}%`
          cell.style.top = `${i.top * this.cellSize}%`
          cell.style.height = `${100 / Math.sqrt(this.fieldSize + 1)}%`
          cell.style.width = `${100 / Math.sqrt(this.fieldSize + 1)}%`
          setBg(cell, i.value, this.gameType, this.fieldSize, this.randomImage)
          cell.onclick = () => {
            this.move(index, PLAYER)
          }
          cell.onmousedown = (event) => {
            this.drag(event, index)
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

        const appendCells = () => {
          this.cells.forEach(({ element }) => {
            element.classList.add('cell-hidden')
            this.field.append(element)
            setTimeout(() => {
              element.classList.remove('cell-hidden')
            }, 70)
          })
        }

        if (this.gameType === 'images') {
          const img = create('img', null, null, null,
            ['src', `assets/img/background/${this.randomImage}.jpg`])
          img.onload = () => {
            appendCells()
          }
        } else {
          appendCells()
        }

        const [min, sec, moves] = get('timeAndMoves')
        this.min = min
        this.sec = sec
        this.timerOn = true
        this.timer()
        this.pauseButton.innerText = 'Pause'
        this.pauseButton.removeAttribute('disabled')
        this.finishButton.removeAttribute('disabled')
        this.movesCounter = moves
        this.displayMoves.innerText = `${moves} moves`
        this.selectList.value = this.fieldSize
        this.selectGameType.value = this.gameType
      }
    }

    this.scoreButton.onclick = () => {
      const scoreContent = this.scoreMenu.children[1]
      scoreContent.innerHTML = ''
      const scoreArray = get('score')

      if (scoreArray) {
        scoreArray.sort((a, b) => (a.score > b.score ? 1 : -1))
        scoreArray.splice(10)
        scoreArray.forEach(({ game, displayTime, moves }) => {
          const element = create('div', 'score-item',
            `<b>Game:</b> ${game}, <b>time:</b> ${displayTime}, <b>moves:</b> ${moves}`)
          scoreContent.append(element)
        })
      } else {
        scoreContent.innerText = 'No winners yet :('
      }

      this.scoreMenu.classList.add('menu-hidden')
      this.field.prepend(this.scoreMenu)
      setTimeout(() => {
        this.scoreMenu.classList.remove('menu-hidden')
      }, 50)

      const scoreButton = this.scoreMenu.children[2]
      scoreButton.onclick = () => {
        this.scoreMenu.classList.add('menu-hidden')
        setTimeout(() => {
          this.scoreMenu.remove()
          this.scoreMenu.classList.remove('menu-hidden')
        }, 500)
      }
    }

    this.finishButton.onclick = () => {
      if (this.gameKey.length !== 0) {
        const arr = [...this.gameKey].reverse()
        const result = sortKey(arr, 7)

        this.pauseButton.setAttribute('disabled', 'disabled')
        this.resetButton.setAttribute('disabled', 'disabled')
        this.saveButton.setAttribute('disabled', 'disabled')
        this.loadButton.setAttribute('disabled', 'disabled')
        this.finishButton.setAttribute('disabled', 'disabled')
        this.timerOn = false
        this.timer()

        const finished = () => {
          this.pauseButton.removeAttribute('disabled')
          this.resetButton.removeAttribute('disabled')
          this.saveButton.removeAttribute('disabled')
          this.loadButton.removeAttribute('disabled')
          this.finishButton.removeAttribute('disabled')
          this.gameKey = []
          this.isFinished(LOOSE)
        }

        for (let i = 0; i < result.length; i += 1) {
          ((n) => {
            setTimeout(() => {
              this.move(result[n], AUTOCOMPLETE)
              if (i === result.length - 1) {
                finished()
              }
            }, 150 * n)
          })(i)
        }
      }
    }

    this.container = create('div', 'gem-puzzle', [
      create('div', 'header', 'Gem-puzzle'),
      create('div', 'info', [this.displayTime, this.displayMoves]),
      this.field,
      create('div', 'controls', [
        create('div', 'controls-line-buttons', [
          this.pauseButton, this.resetButton, this.soundButton, this.saveButton,
          this.loadButton, this.scoreButton, this.finishButton,
        ]),
        create('div', 'controls-line-list', [this.selectGameType, this.selectList]),
      ]),
      this.soundContainer,
    ])
    document.body.append(this.container)
  }
}
