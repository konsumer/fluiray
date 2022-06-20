
const FluidSynth = require('./fluidsynth.js')
const fluid = new FluidSynth()

async function main () {
  const fonts = await fluid.fonts()

  const inst = await fluid.inst(fonts[0].id)

  console.log(fonts, inst)
}
main()
