export function createRandomId() {
  let id = ''
  for (let i = 1; i <= 8; i++) {
    id += Math.ceil(Math.random() * 9)
  }
  return id
}
