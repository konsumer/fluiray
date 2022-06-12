const FluidSynth = require('./fluid.js')

const f = new FluidSynth()

f.load('/opt/homebrew/Cellar/fluid-synth/2.2.7/share/fluid-synth/sf2/VintageDreamsWaves-v2.sf2')

f.on('err', e => console.log('ERR', e))

f.on('noteon', params => {
  console.log('NOTE ON:', params)
})

f.on('noteoff', params => {
  console.log('NOTE OFF:', params)
})

f.on('cc', params => {
  console.log('CC:', params)
})
