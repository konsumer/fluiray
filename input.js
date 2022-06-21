// mapped input

const r = require('raylib')

/*

Input is similar to default libretro. Based on SNES layout.

buttons:

      X
     Y A
      B
select start

keys:

      S
     A X
      Z

rshift enter
*/

// controls on RG351V
const GAMEPAD_A = 0
const GAMEPAD_B = 1
const GAMEPAD_X = 2
const GAMEPAD_Y = 3
const GAMEPAD_SELECT = 7
const GAMEPAD_START = 6
// const GAMEPAD_L1 = 4
// const GAMEPAD_R1 = 5
// const GAMEPAD_FUNCTION = 9
// const GAMEPAD_L2 = 10
// const GAMEPAD_R2 = 11

const AXIS_DX = 6
const AXIS_DY = 7
const AXIS_AX = 0
const AXIS_AY = 1

const previosAxisState = {}
function IsGamepadAxisPressed (gamepad, axis, direction) {
  previosAxisState[gamepad] = previosAxisState[gamepad] || {}
  previosAxisState[gamepad][axis] = previosAxisState[gamepad][axis] || {}
  previosAxisState[gamepad][axis][direction] = previosAxisState[gamepad][axis][direction] || {}
  const s = IsGamepadAxisDown(gamepad, axis, direction)
  if (previosAxisState[gamepad][axis][direction] !== s) {
    previosAxisState[gamepad][axis][direction] = s
    return s
  }
  return false
}

function IsGamepadAxisDown (gamepad, axis, direction) {
  const c = r.GetGamepadAxisMovement(gamepad, axis)
  if (c < -0.75 && direction === -1) {
    return true
  }
  if (c > 0.75 && direction === 1) {
    return true
  }
  return false
}

// this wasn't working correctly, so I made my own
const previosButtonState = {}
function IsGamepadButtonPressed (gamepad, button) {
  previosButtonState[gamepad] = previosButtonState[gamepad] || {}
  previosButtonState[gamepad][button] = previosButtonState[gamepad][button] || {}
  const s = r.IsGamepadButtonDown(gamepad, button)
  if (previosButtonState[gamepad][button] !== s) {
    previosButtonState[gamepad][button] = s
    return s
  }
  return false
}

module.exports = function getMappedInput (once) {
  const k = once ? r.IsKeyPressed : r.IsKeyDown
  const b = once ? IsGamepadButtonPressed : r.IsGamepadButtonDown
  const a = once ? IsGamepadAxisPressed : IsGamepadAxisDown

  const buttons = []
  if (k(r.KEY_X) || b(0, GAMEPAD_A)) buttons.push('A')
  if (k(r.KEY_Z) || b(0, GAMEPAD_B)) buttons.push('B')
  if (k(r.KEY_A) || b(0, GAMEPAD_Y)) buttons.push('Y')
  if (k(r.KEY_S) || b(0, GAMEPAD_X)) buttons.push('X')
  if (k(r.KEY_RIGHT_SHIFT) || b(0, GAMEPAD_SELECT)) buttons.push('SELECT')
  if (k(r.KEY_ENTER) || b(0, GAMEPAD_START)) buttons.push('START')
  if (k(r.KEY_UP) || a(0, AXIS_DY, -1) || a(0, AXIS_AY, -1)) buttons.push('UP')
  if (k(r.KEY_DOWN) || a(0, AXIS_DY, 1) || a(0, AXIS_AY, 1)) buttons.push('DOWN')
  if (k(r.KEY_LEFT) || a(0, AXIS_DX, -1) || a(0, AXIS_AX, -1)) buttons.push('LEFT')
  if (k(r.KEY_RIGHT) || a(0, AXIS_DX, 1) || a(0, AXIS_AX, 1)) buttons.push('RIGHT')
  return buttons
}
