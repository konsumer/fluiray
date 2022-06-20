const r = require('raylib')
const { realpath } = require('fs/promises')

const FluidSynth = require('./fluidsynth.js')
const buttons = require('./input.js')

r.SetTraceLogLevel(r.LOG_ERROR)
r.InitWindow(640, 480, 'Fluiray')

const fluid = new FluidSynth()

// mod that handles negative wrap-around
const mod = (n, m) => ((n % m) + m) % m

// horiz center text on screen
function centerText (text, fontSize, y, color = r.WHITE) {
  const twidth = r.MeasureText(text, fontSize)
  r.DrawText(text, 320 - (twidth / 2), y, fontSize, color)
}

async function main () {
  await fluid.gain(3)

  const files = process.argv.slice(2)
  for (const f of files) {
    await fluid.load(await realpath(f))
  }

  const fonts = await fluid.fonts()

  for (const font of fonts) {
    font.instruments = await fluid.inst(font.id)
  }

  // console.log(JSON.stringify(fonts, null, 2))

  const currentFont = 0
  let currentInstrument = 0
  let currentMenuInstrument = 0

  while (!r.WindowShouldClose()) {
    const i = fonts[currentFont].instruments
    const b = buttons(true)
    const d = buttons()

    if (d.includes('START') && d.includes('SELECT')) {
      break
    }

    if (b.includes('UP')) {
      currentMenuInstrument = mod(currentMenuInstrument - 1, i.length)
    }
    if (b.includes('DOWN')) {
      currentMenuInstrument = mod(currentMenuInstrument + 1, i.length)
    }
    if (b.includes('A')) {
      currentInstrument = currentMenuInstrument
      await fluid.select(0, fonts[currentFont].id, i[currentInstrument].bank, i[currentInstrument].program)
    }

    r.BeginDrawing()
    r.ClearBackground(r.BLACK)

    const lockedInColor = currentMenuInstrument === currentInstrument ? r.GREEN : r.YELLOW

    r.DrawText(fonts[currentFont].name, 20, 20, 20, r.BLUE)

    if (i.length) {
      centerText(i[mod(currentMenuInstrument - 4, i.length)].name, 10, 80, r.DARKGRAY)
      centerText(i[mod(currentMenuInstrument - 3, i.length)].name, 20, 100, r.DARKGRAY)
      centerText(i[mod(currentMenuInstrument - 2, i.length)].name, 30, 130, r.LIGHTGRAY)
      centerText(i[mod(currentMenuInstrument - 1, i.length)].name, 40, 170, r.WHITE)
      centerText(i[mod(currentMenuInstrument, i.length)].name, 50, 215, lockedInColor)
      centerText(i[mod(currentMenuInstrument + 1, i.length)].name, 40, 270, r.WHITE)
      centerText(i[mod(currentMenuInstrument + 2, i.length)].name, 30, 320, r.LIGHTGRAY)
      centerText(i[mod(currentMenuInstrument + 3, i.length)].name, 20, 360, r.DARKGRAY)
      centerText(i[mod(currentMenuInstrument + 4, i.length)].name, 10, 390, r.DARKGRAY)
    }

    r.EndDrawing()
  }
  r.CloseWindow()
}
main()
