export default function generateArray(fieldSize) {
  const randomArray = [...Array(fieldSize).keys()].map((i) => i + 1)
    .sort(() => Math.random() - 0.5)
  randomArray.push(0)

  let inv = 0
  for (let i = 0; i < fieldSize + 1; i += 1) {
    if (randomArray[i]) {
      for (let j = 0; j < i; j += 1) {
        if (randomArray[j] > randomArray[i]) {
          inv += 1
        }
      }
    }
  }
  for (let i = 0; i < fieldSize + 1; i += 1) {
    if (randomArray[i] === 0) {
      inv += Math.floor(1 + (i / Math.sqrt(fieldSize + 1)))
    }
  }

  if (((fieldSize + 1) % 2 === 0) && (inv % 2 === 0)) {
    return randomArray
  }
  if (((fieldSize + 1) % 2 !== 0) && (inv % 2 !== 0)) {
    return randomArray
  }
  return generateArray(fieldSize)
}
