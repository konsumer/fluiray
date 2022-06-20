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
    if (b(0, r.GAMEPAD_BUTTON_RIGHT_FACE_RIGHT)) {
      buttons.add('A')
    }
    if (b(0, r.GAMEPAD_BUTTON_RIGHT_FACE_DOWN)) {
      buttons.add('B')
    }
    if (b(0, r.GAMEPAD_BUTTON_RIGHT_FACE_LEFT)) {
      buttons.add('Y')
    }
    if (b(0, r.GAMEPAD_BUTTON_RIGHT_FACE_UP)) {
      buttons.add('X')
    }
    if (b(0, r.GAMEPAD_BUTTON_LEFT_FACE_UP)) {
      buttons.add('UP')
    }
    if (b(0, r.GAMEPAD_BUTTON_LEFT_FACE_DOWN)) {
      buttons.add('DOWN')
    }
    if (b(0, r.GAMEPAD_BUTTON_LEFT_FACE_LEFT)) {
      buttons.add('LEFT')
    }
    if (b(0, r.GAMEPAD_BUTTON_LEFT_FACE_RIGHT)) {
      buttons.add('RIGHT')
    }
    if (b(0, r.GAMEPAD_BUTTON_MIDDLE_LEFT)) {
      buttons.add('SELECT')
    }
    if (b(0, r.GAMEPAD_BUTTON_MIDDLE_RIGHT)) {
      buttons.add('START')
    }
  }

  return [...buttons]
}
