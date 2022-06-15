const r = require('raylib')
const FluidSynth = require('./fluid.js')
const { realpath } = require('fs/promises')
const { basename } = require('path')

if (process.argv.length < 3) {
  console.error('Usage: fluidray FILE1.sf2 FILE2.sf2 ...')
  process.exit(1)
}

r.SetTraceLogLevel(r.LOG_ERROR)
r.InitWindow(640, 480, 'Fluidray')

const fluid = new FluidSynth(true)
fluid.gain(1)

// mod that handles negative wrap-around
const mod = (n, m) => ((n % m) + m) % m

function centerText (text, fontSize, y, color = r.WHITE) {
  const twidth = r.MeasureText(text, fontSize)
  r.DrawText(text, 320 - (twidth / 2), y, fontSize, color)
}

async function main () {
  const fonts = []
  const files = process.argv.slice(2)
  for (const f of files) {
    const file = await realpath(f)
    if (!fonts.find(fo => fo.file === file)) {
      const id = await fluid.load(file)
      const instruments = await fluid.inst(id)
      fonts.push({ id, file, instruments })
    }
  }

  const currentFont = 0
  let currentInstrument = 0
  let currentMenuInstrument = 0

  while (!r.WindowShouldClose()) {
    const i = fonts[currentFont].instruments

    if (r.IsKeyPressed(r.KEY_UP)) {
      currentMenuInstrument = mod(currentMenuInstrument - 1, i.length)
    }
    if (r.IsKeyPressed(r.KEY_DOWN)) {
      currentMenuInstrument = mod(currentMenuInstrument + 1, i.length)
    }

    if (r.IsKeyPressed(r.KEY_X)) {
      currentInstrument = currentMenuInstrument
      fluid.prog(0, i[currentInstrument].program)
    }

    if (r.IsGamepadAvailable(0)) {
      // DPAD up
      if (r.IsGamepadButtonPressed(0, r.GAMEPAD_BUTTON_LEFT_FACE_UP)) {
        currentMenuInstrument = mod(currentMenuInstrument - 1, i.length)
      }
      // DPAD down
      if (r.IsGamepadButtonPressed(0, r.GAMEPAD_BUTTON_LEFT_FACE_DOWN)) {
        currentMenuInstrument = mod(currentMenuInstrument + 1, i.length)
      }
      // X
      if (r.IsGamepadButtonPressed(0, r.GAMEPAD_BUTTON_RIGHT_FACE_DOWN)) {
        currentInstrument = currentMenuInstrument
        fluid.prog(0, i[currentInstrument].program)
      }

      if (r.IsGamepadButtonDown(0, r.GAMEPAD_BUTTON_MIDDLE_LEFT) && r.IsGamepadButtonDown(0, r.GAMEPAD_BUTTON_MIDDLE_RIGHT)) {
        break
      }
    }

    r.BeginDrawing()
    r.ClearBackground(r.BLACK)

    const lockedInColor = currentMenuInstrument === currentInstrument ? r.GREEN : r.YELLOW

    r.DrawText((basename(fonts[currentFont].file, '.sf2')), 20, 20, 20, r.BLUE)

    centerText(i[mod(currentMenuInstrument - 4, i.length)].name, 10, 80, r.DARKGRAY)
    centerText(i[mod(currentMenuInstrument - 3, i.length)].name, 20, 100, r.DARKGRAY)
    centerText(i[mod(currentMenuInstrument - 2, i.length)].name, 30, 130, r.LIGHTGRAY)
    centerText(i[mod(currentMenuInstrument - 1, i.length)].name, 40, 170, r.WHITE)
    centerText(i[mod(currentMenuInstrument, i.length)].name, 50, 215, lockedInColor)
    centerText(i[mod(currentMenuInstrument + 1, i.length)].name, 40, 270, r.WHITE)
    centerText(i[mod(currentMenuInstrument + 2, i.length)].name, 30, 320, r.LIGHTGRAY)
    centerText(i[mod(currentMenuInstrument + 3, i.length)].name, 20, 360, r.DARKGRAY)
    centerText(i[mod(currentMenuInstrument + 4, i.length)].name, 10, 390, r.DARKGRAY)

    r.EndDrawing()
  }

  fluid.quit()
  r.CloseWindow()
}
main()
