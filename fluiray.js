const r = require('raylib')
const { realpath } = require('fs/promises')

const FluidSynth = require('./fluidsynth.js')
const buttons = require('./input.js')

r.SetTraceLogLevel(r.LOG_ERROR)
r.InitWindow(640, 480, 'Fluiray')

if (r.IsGamepadAvailable(0)) {
  console.log(`Connect to ${r.GetGamepadName(0)}`)
}

const fluid = new FluidSynth('192.168.86.43')
// const fluid = new FluidSynth()

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

  // TODO: actually parse current layout to figure out what is already loaded

  // console.log(JSON.stringify(fonts, null, 2))

  let currentFont = 0
  let currentInstrument = 0
  let currentMenuInstrument = 0

  while (!r.WindowShouldClose()) {
    const { instruments } = fonts.length ? fonts[currentFont] : []
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

    if (b.includes('LEFT')) {
      currentFont = mod(currentFont - 1, fonts.length)
    }

    if (b.includes('RIGHT')) {
      currentFont = mod(currentFont + 1, fonts.length)
    }

    if (b.includes('A') || b.includes('START')) {
      currentInstrument = currentMenuInstrument
      if (fonts.length) {
        await fluid.select(0, fonts[currentFont].id, instruments[currentInstrument].bank, instruments[currentInstrument].program)
      }
    }

    r.BeginDrawing()
    r.ClearBackground(r.BLACK)

    const lockedInColor = currentMenuInstrument === currentInstrument ? r.GREEN : r.YELLOW

    if (fonts.length) {
      r.DrawText(fonts[currentFont].name, 20, 20, 20, r.BLUE)
    } else {
      centerText('No fonts loaded', 50, 215, r.WHITE)
    }

    if (instruments.length) {
      centerText(instruments[mod(currentMenuInstrument - 4, instruments.length)].name, 10, 80, r.DARKGRAY)
      centerText(instruments[mod(currentMenuInstrument - 3, instruments.length)].name, 20, 100, r.DARKGRAY)
      centerText(instruments[mod(currentMenuInstrument - 2, instruments.length)].name, 30, 130, r.LIGHTGRAY)
      centerText(instruments[mod(currentMenuInstrument - 1, instruments.length)].name, 40, 170, r.WHITE)
      centerText(instruments[mod(currentMenuInstrument, instruments.length)].name, 50, 215, lockedInColor)
      centerText(instruments[mod(currentMenuInstrument + 1, instruments.length)].name, 40, 270, r.WHITE)
      centerText(instruments[mod(currentMenuInstrument + 2, instruments.length)].name, 30, 320, r.LIGHTGRAY)
      centerText(instruments[mod(currentMenuInstrument + 3, instruments.length)].name, 20, 360, r.DARKGRAY)
      centerText(instruments[mod(currentMenuInstrument + 4, instruments.length)].name, 10, 390, r.DARKGRAY)
    }

    r.EndDrawing()
  }
  r.CloseWindow()
}
main()
