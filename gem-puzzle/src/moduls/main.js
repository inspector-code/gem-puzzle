import create from './utils/create'

export default class GemPuzzle {
  constructor() {
    this.field = create('div', 'field')
    this.empty = {
      top: 0,
      left: 0,
    }
    this.cellSize = 100
    this.cells = []
    this.cells.push(this.empty)
  }

  generateField(fieldSize) {
    this.field.innerHTML = ''
    for (let i = 1; i <= fieldSize; i += 1) {
      const cell = create('div', 'cell', `${i}`)

      const left = i % 4
      const top = (i - left) / 4

      this.cells.push({
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
  }

  init() {
    this.container = create('div', 'gem-puzzle', [
      create('div', 'header', 'Gem puzzle!'),
      create('div', 'info'),
      this.field,
      create('div', 'controls'),
    ])
    document.body.append(this.container)
  }
}
