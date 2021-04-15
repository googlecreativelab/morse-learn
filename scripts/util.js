export function getClientHeight () {
  return (document.body.clientHeight || window.innerHeight)
}

export function getKeyboardHeight () {
  const documentHeight = (document.body.clientHeight || window.innerHeight)
  const keyboardHeight = Math.max(documentHeight * 0.25, 227)
  return keyboardHeight
}

export function getGameAreaHeight() {
  return getClientHeight() - getKeyboardHeight()
}