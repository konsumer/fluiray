const EventEmitter = require('events')
const { spawn, execSync } = require('child_process')
const readline = require('readline')

const regexVersion = /FluidSynth executable version ([0-9.]+)/gm

// TODO: figure out how to better collect output from commands
// TODO: handle remote synth, too

// pick good default drivers for platform
// TODO: what is good for windows?
let defaultAudioDriver = 'portaudio'
let defaultMidiDriver = 'coremidi'

if (process.platform === 'darwin') {
  defaultAudioDriver = 'coreaudio'
  defaultMidiDriver = 'coremidi'
}

if (process.platform === 'linux') {
  defaultAudioDriver = 'alsa'
  defaultMidiDriver = 'alsa_seq'
}

module.exports = class FluidSynth extends EventEmitter {
  constructor (debug = false, audioDriver = defaultAudioDriver, midiDriver = defaultMidiDriver) {
    super()
    this.debug = debug
    this.output = []
    this.version = regexVersion.exec(execSync('fluidsynth --version').toString())[1].split('.')
    const args = ['-q', '-d', '-p', 'fluidray', '-a', audioDriver, '-m', midiDriver, '-s']
    if (this.version[0] >= 2) {
      args.push('-o')
      args.push('midi.autoconnect=1')
    }
    if (this.debug) {
      console.log(['START:', 'fluidsynth', ...args].join(' '))
    }
    this.ps = spawn('fluidsynth', args, {
      cwd: process.cwd(),
      shell: false,
      stdio: 'pipe'
    })
    this.ps.stderr.setEncoding('utf8')
    this.ps.stdout.setEncoding('utf8')
    this.ps.stderr.on('data', d => this.emit('err', d))

    this.rl = readline.createInterface({
      input: this.ps.stdout
    })

    // this defeats fluidsynth's output cache
    this.ioInterval = setInterval(() => {
      this.ps.stdin.write('\n')
    }, 100)

    this.rl.on('line', line => {
      if (line && line.startsWith('event')) {
        const [, stage, n] = line.split('_')
        let [name, ...params] = n.split(' ')
        params = params.map(n => Number(n))
        if (stage === 'pre') {
          this.emit(name, params)
        }
        this.emit(`${stage}_${name}`, params)
      }
    })
  }

  // run a command on server, with optional arg for checker-function (returns true or false, per line) to get output
  command (cmd) {
    if (this.debug) {
      console.log('COMMAND:', cmd)
    }
    this.ps.stdin.write(cmd + '\n')
  }

  // Loads SoundFont (reset=0|1, def 1; bankofs=n, def 0) returns font ID (async)
  load (filename, bankofs = 1) {
    const rLoad = /^loaded SoundFont has ID ([0-9]+)/
    let id
    const lineWatcher = line => {
      const r = rLoad.exec(line)
      if (r) {
        id = parseInt(r[1])
      }
      return r
    }
    this.rl.on('line', lineWatcher)
    this.command(`load ${JSON.stringify(filename)} ${bankofs}`)
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.rl.off('line', lineWatcher)
        resolve(id)
      }, 1500)
    })
  }

  // Get the available instruments for the font ID (async)
  async inst (font) {
    const rInst = /^([0-9]{3})-([0-9]{3}) (.+)/
    const out = []

    return new Promise((resolve, reject) => {
      const lineWatcher = line => {
        const m = line.match(rInst)
        if (m) {
          out.push({
            bank: parseInt(m[1]),
            program: parseInt(m[2]),
            name: m[3]
          })
          // a bit of a hack
          setTimeout(() => {
            this.rl.off('line', lineWatcher)
            resolve(out)
          }, 1500)
        }
      }
      this.rl.on('line', lineWatcher)
      this.command(`inst ${font}`)
    })
  }

  // Quit the synthesizer
  quit () {
    clearInterval(this.ioInterval)
    this.command('quit')
  }

  // Loads a file and parse every line as a command
  source (filename) {
    this.command(`source ${JSON.stringify(filename)}`)
  }

  // Sends noteon
  noteOn (vel) {
    this.command(`noteon ${vel}`)
  }

  // Sends noteoff
  noteOff (key) {
    this.command(`noteoff ${key}`)
  }

  // Bends pitch
  pitchBend (offset) {
    this.command(`pitch_bend ${offset}`)
  }

  // Sets pitch bend range for the given midi channel
  pitchBendRange (range) {
    this.command(`pitch_bend_range ${range}`)
  }

  // Sends control-change message
  cc (value) {
    this.command(`cc ${value}`)
  }

  // Sends program-change message
  prog (num, channel = '') {
    this.command(`prog ${num} ${channel}`)
  }

  // Combination of bank-select and program-change
  select (prog) {
    this.command(`select ${prog}`)
  }

  // Unloads SoundFont by ID (reset=0|1, default 1)
  unload (reset = 1) {
    this.command(`unload ${reset}`)
  }

  // Reload the SoundFont with the specified ID
  reload (id) {
    this.command(`reload ${id}`)
  }

  // Display the list of loaded SoundFonts
  fonts () {
    this.command('fonts')
  }

  // Print out preset of all channels
  channels (verbose = 0) {
    this.command(`channels ${verbose}`)
  }

  // Choose interpolation method for all channels
  interp (num) {
    this.command(`interp ${num}`)
  }

  // Choose interpolation method for one channel
  interpc (num) {
    this.command(`interpc ${num}`)
  }

  // Prints the list of basic channels
  basicChannels () {
    this.command('basicchannels')
  }

  // Resets all or some basic channels
  resetBasicChannels (channels = []) {
    this.command(`resetbasicchannels ${channels.join(' ')}`)
  }

  // Sets default, adds basic channels
  setBasicChannels (vals = []) {
    this.command(`setbasicchannels ${vals.join(' ')}`)
  }

  // Prints channels mode
  channelsMode (channels = []) {
    this.command(`channelsmode ${channels.join(' ')}`)
  }

  // Prints channels legato mode
  legatoMode (channels) {
    this.command(`legatomode ${channels.join(' ')}`)
  }

  // Sets legato mode
  setLegatoMode (modes) {
    this.command(`setlegatomode ${modes.join(' ')}`)
  }

  // Prints channels portamento mode
  portamentoMode (channels) {
    this.command(`portamentomode ${channels.join(' ')}`)
  }

  // Sets portamento mode
  setPortamentoMode (modes) {
    this.command(`setportamentomode ${modes.join(' ')}`)
  }

  // Prints channels breath mode
  breathMode (channels) {
    this.command(`breathmode ${channels.join(' ')}`)
  }

  // poly(1/0) mono(1/0) breath_sync(1/0) [..]  Sets breath mode
  setBreathMode (chan, mode) {
    this.command(`setbreathmode ${chan} ${mode}`)
  }

  // Load preset num into all reverb unit
  revPreset (num) {
    this.command(`rev_preset ${num}`)
  }

  // Set room size of all or one reverb group to num
  revSetRoomsize (num) {
    this.command(`rev_setroomsize ${num}`)
  }

  // Set damping of all or one reverb group to num
  revSetDamp (num) {
    this.command(`rev_setdamp ${num}`)
  }

  // Set width of all or one reverb group to num
  revSetWidth (num) {
    this.command(`rev_setwidth ${num}`)
  }

  // Set output level of all or one reverb group to num
  revSetLevel (num) {
    this.command(`rev_setlevel ${num}`)
  }

  // 0|1|on|off   Turn all or one reverb group on or off
  reverb (group) {
    this.command(`reverb ${group !== undefined ? group : ''}`)
  }

  // Set n delay lines (default 3) in all or one chorus group
  choSetNr (n = 3) {
    this.command(`cho_set_nr ${n}`)
  }

  // Set output level of all or one chorus group to num
  choSetLevel (num) {
    this.command(`cho_set_level ${num}`)
  }

  // Set mod speed of all or one chorus group to num (Hz)
  choSetSpeed (num) {
    this.command(`cho_set_speed ${num}`)
  }

  // Set modulation depth of all or one chorus group to num (ms)
  choSetDepth (num) {
    this.command(`cho_set_depth ${num}`)
  }

  // 0|1|on|off   Turn all or one chorus group on or off
  chorus (group) {
    if (typeof group !== 'undefined') {
      this.command(`chorus ${group}`)
    } else {
      this.command('chorus')
    }
  }

  // Set the master gain: 0-5
  gain (value) {
    this.command(`gain ${value}`)
  }

  // Get number of active synthesis voices
  voiceCount () {
    this.command('voice_count')
  }

  // Create a tuning with name, bank number, and program number (0 <= bank,prog <= 127)
  tuning (prog) {
    this.command(`tuning ${prog}`)
  }

  // Tune a key
  tune (pitch) {
    this.command(`tune ${pitch}`)
  }

  // Set the tuning for a MIDI channel
  setTuning (prog) {
    this.command(`settuning ${prog}`)
  }

  // Restore the default tuning of a MIDI channel
  resetTuning (chan) {
    this.command(`resettuning ${chan}`)
  }

  // Print the list of available tunings
  tunings () {
    this.command('tunings ')
  }

  // Print the pitch details of the tuning
  dumpTuning (prog) {
    this.command(`dumptuning ${prog}`)
  }

  // System reset (all notes off, reset controllers)
  reset () {
    this.command('reset ')
  }

  // Set the value of a setting (must be a real-time setting to take effect immediately)
  set (value) {
    this.command(`set ${value}`)
  }

  // Get the value of a setting
  get (name) {
    this.command(`get ${name}`)
  }

  // Get information about a setting
  info (name) {
    this.command(`info ${name}`)
  }

  // Print out all settings
  settings () {
    this.command('settings ')
  }

  // Print arg
  echo (arg) {
    this.command(`echo ${arg}`)
  }

  // sleep duration (in ms)
  sleep (duration) {
    this.command(`sleep ${duration}`)
  }

  // Clears all routing rules from the midi router
  routerClear () {
    this.command('router_clear ')
  }

  // Resets the midi router to default state
  routerDefault () {
    this.command('router_default ')
  }

  // [note|cc|prog|pbend|cpress|kpress]   Starts a new routing rule
  routerBegin () {
    this.command('router_begin ')
  }

  // filters and maps midi channels on current rule
  routerChan (add) {
    this.command(`router_chan ${add}`)
  }

  // filters and maps parameter 1 (key/ctrl nr)
  routerPar1 (add) {
    this.command(`router_par1 ${add}`)
  }

  // filters and maps parameter 2 (vel/cc val)
  routerPar2 (add) {
    this.command(`router_par2 ${add}`)
  }

  // closes and commits the current routing rule
  routerEnd () {
    this.command('router_end ')
  }

  // Start playing from the beginning of current song
  playerStart () {
    this.command('player_start ')
  }

  // Stop playing (cannot be executed in a user command file)
  playerStop () {
    this.command('player_stop ')
  }

  // Continue playing (cannot be executed in a user command file)
  playerCont () {
    this.command('player_cont ')
  }

  // Move forward/backward in current song to +/-num ticks
  playerSeek (num) {
    this.command(`player_seek ${num}`)
  }

  // Move to next song (cannot be executed in a user command file)
  playerNext () {
    this.command('player_next ')
  }

  // Set loop number to num (-1 = loop forever)
  playerLoop (num) {
    this.command(`player_loop ${num}`)
  }

  // Set tempo to num beats per minute
  playerTempoBpm (num) {
    this.command(`player_tempo_bpm ${num}`)
  }

  // Set internal tempo multiplied by mul (default mul=1.0)
  playerTempoInt (mul = 1.0) {
    this.command(`player_tempo_int ${mul}`)
  }
}
