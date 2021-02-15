export default function sortKey(arr, n) {
  let skip = false
  const res = arr.reduce(
    (acc, item, index) => {
      if (!skip) {
        if (item === arr[index + 1]) {
          skip = true
        } else {
          acc.push(item)
        }
      } else {
        skip = false
      }
      return acc
    }, [],
  )

  if (n === 1) {
    return res
  }
  return sortKey(res, n - 1)
}
