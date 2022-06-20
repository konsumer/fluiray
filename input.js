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

module.exports = function getMappedInput (once) {
  const k = once ? r.IsKeyPressed : r.IsKeyDown
  const b = once ? r.IsGamepadButtonPressed : r.IsGamepadButtonDown

  const buttons = new Set()

  if (k(r.KEY_X)) {
    buttons.add('A')
  }
  if (k(r.KEY_Z)) {
    buttons.add('B')
  }
  if (k(r.KEY_A)) {
    buttons.add('Y')
  }
  if (k(r.KEY_S)) {
    buttons.add('X')
  }
  if (k(r.KEY_UP)) {
    buttons.add('UP')
  }
  if (k(r.KEY_DOWN)) {
    buttons.add('DOWN')
  }
  if (k(r.KEY_LEFT)) {
    buttons.add('LEFT')
  }
  if (k(r.KEY_RIGHT)) {
    buttons.add('RIGHT')
  }
  if (k(r.KEY_RIGHT_SHIFT)) {
    buttons.add('SELECT')
  }
  if (k(r.KEY_ENTER)) {
    buttons.add('START')
  }

  if (r.IsGamepadAvailable(0)) {
    if (b(0, GAMEPAD_A)) {
      buttons.add('A')
    }
    if (b(0, GAMEPAD_B)) {
      buttons.add('B')
    }
    if (b(0, GAMEPAD_Y)) {
      buttons.add('Y')
    }
    if (b(0, GAMEPAD_X)) {
      buttons.add('X')
    }
    if (b(0, GAMEPAD_SELECT)) {
      buttons.add('SELECT')
    }
    if (b(0, GAMEPAD_START)) {
      buttons.add('START')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_DX) < -10) {
      buttons.add('LEFT')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_DX) > 10) {
      buttons.add('RIGHT')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_DY) < -10) {
      buttons.add('UP')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_DY) > 10) {
      buttons.add('DOWN')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_AX) < -10) {
      buttons.add('LEFT')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_AX) > 10) {
      buttons.add('RIGHT')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_AY) < -10) {
      buttons.add('UP')
    }

    if (r.GetGamepadAxisMovement(0, AXIS_AY) > 10) {
      buttons.add('DOWN')
    }
  }

  return [...buttons]
}
