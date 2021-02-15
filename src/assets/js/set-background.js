export default function setBg(cellItem, cellValue, gameType, fieldSize, randomImage) {
  const cell = cellItem
  if (gameType === 'images') {
    const size = Math.sqrt(fieldSize + 1)
    cell.style.backgroundImage = `url(assets/img/background/${randomImage}.jpg)`
    cell.style.backgroundRepiat = 'no-repeat'
    cell.style.backgroundSize = `${100 * size}%`
    const numberCell = cellValue - 1
    const multiplier = 100 / (size - 1)
    cell.style.backgroundPosition = `${(numberCell % size) * multiplier}% ${Math.floor(numberCell / size) * multiplier}%`
  } else {
    cell.style.background = '#ffecd2'
  }
  return cell
}
