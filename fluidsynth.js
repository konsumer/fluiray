const net = require('net')
const { basename } = require('path')

module.exports = class FluidSynth {
  constructor (port = 9800, host = '192.168.86.43') {
    this.host = host
    this.port = port
  }

  // run a command on server, response as promise
  command (cmd) {
    return new Promise((resolve, reject) => {
      // console.log('COMMAND:', cmd)
      const client = net.createConnection(this.port, this.host, () => {})
      client.on('error', (data) => reject)
      let out = ''
      setTimeout(() => {
        client.destroy()
        resolve(out)
      }, 100)
      client.on('data', (data) => {
        out += data.toString()
      })
      client.write(cmd + '\n\n')
    })
  }

  // Loads SoundFont (reset=0|1, def 1; bankofs=n, def 0) returns font ID (async)
  // returns id
  async load (filename, bankofs = 1) {
    const rLoad = /^loaded SoundFont has ID ([0-9]+)/
    const r = rLoad.exec(await this.command(`load ${JSON.stringify(filename)} ${bankofs}`))
    if (r) {
      return parseInt(r[1])
    }
  }

  // Get the available instruments for the font ID (async)
  async inst (font) {
    const out = []
    const rInst = /^([0-9]{3})-([0-9]{3}) (.+)/gm
    for (const m of (await this.command(`inst ${font}`, true)).matchAll(rInst)) {
      out.push({
        bank: parseInt(m[1]),
        program: parseInt(m[2]),
        name: m[3]
      })
    }
    return out
  }

  // Loads a file and parse every line as a command
  source (filename) {
    return this.command(`source ${JSON.stringify(filename)}`)
  }

  // Sends noteon
  noteOn (key, vel) {
    return this.command(`noteon ${key} ${vel}`)
  }

  // Sends noteoff
  noteOff (key) {
    return this.command(`noteoff ${key}`)
  }

  // Bends pitch
  pitchBend (offset) {
    return this.command(`pitch_bend ${offset}`)
  }

  // Sets pitch bend range for the given midi channel
  pitchBendRange (range) {
    return this.command(`pitch_bend_range ${range}`)
  }

  // Sends control-change message
  cc (value) {
    return this.command(`cc ${value}`)
  }

  // Sends program-change message
  prog (num, channel = '') {
    return this.command(`prog ${num} ${channel}`)
  }

  // Combination of bank-select and program-change
  select (channel, font, bank, program) {
    return this.command(`select ${channel} ${font} ${bank} ${program}`)
  }

  // Unloads SoundFont by ID (reset=0|1, default 1)
  unload (reset = 1) {
    return this.command(`unload ${reset}`)
  }

  // Reload the SoundFont with the specified ID
  reload (id) {
    return this.command(`reload ${id}`)
  }

  // Display the list of loaded SoundFonts
  async fonts () {
    const rFonts = /^\W+([0-9]+)\W+(.+)/gm
    const out = []
    const r = await this.command('fonts')
    for (const m of r.matchAll(rFonts)) {
      out.push({
        id: parseInt(m[1]),
        file: '/' + m[2],
        name: basename(m[2], '.sf2').replace(/[_-]/g, ' ')
      })
    }
    return out
  }

  // Print out preset of all channels
  channels (verbose = 0) {
    return this.command(`channels ${verbose}`)
  }

  // Choose interpolation method for all channels
  interp (num) {
    return this.command(`interp ${num}`)
  }

  // Choose interpolation method for one channel
  interpc (num) {
    return this.command(`interpc ${num}`)
  }

  // Prints the list of basic channels
  basicChannels () {
    return this.command('basicchannels')
  }

  // Resets all or some basic channels
  resetBasicChannels (channels = []) {
    return this.command(`resetbasicchannels ${channels.join(' ')}`)
  }

  // Sets default, adds basic channels
  setBasicChannels (vals = []) {
    return this.command(`setbasicchannels ${vals.join(' ')}`)
  }

  // Prints channels mode
  channelsMode (channels = []) {
    return this.command(`channelsmode ${channels.join(' ')}`)
  }

  // Prints channels legato mode
  legatoMode (channels) {
    return this.command(`legatomode ${channels.join(' ')}`)
  }

  // Sets legato mode
  setLegatoMode (modes) {
    return this.command(`setlegatomode ${modes.join(' ')}`)
  }

  // Prints channels portamento mode
  portamentoMode (channels) {
    return this.command(`portamentomode ${channels.join(' ')}`)
  }

  // Sets portamento mode
  setPortamentoMode (modes) {
    return this.command(`setportamentomode ${modes.join(' ')}`)
  }

  // Prints channels breath mode
  breathMode (channels) {
    return this.command(`breathmode ${channels.join(' ')}`)
  }

  // poly(1/0) mono(1/0) breath_sync(1/0) [..]  Sets breath mode
  setBreathMode (chan, mode) {
    return this.command(`setbreathmode ${chan} ${mode}`)
  }

  // Load preset num into all reverb unit
  revPreset (num) {
    return this.command(`rev_preset ${num}`)
  }

  // Set room size of all or one reverb group to num
  revSetRoomsize (num) {
    return this.command(`rev_setroomsize ${num}`)
  }

  // Set damping of all or one reverb group to num
  revSetDamp (num) {
    return this.command(`rev_setdamp ${num}`)
  }

  // Set width of all or one reverb group to num
  revSetWidth (num) {
    return this.command(`rev_setwidth ${num}`)
  }

  // Set output level of all or one reverb group to num
  revSetLevel (num) {
    return this.command(`rev_setlevel ${num}`)
  }

  // 0|1|on|off   Turn all or one reverb group on or off
  reverb (group) {
    return this.command(`reverb ${group !== undefined ? group : ''}`)
  }

  // Set n delay lines (default 3) in all or one chorus group
  choSetNr (n = 3) {
    return this.command(`cho_set_nr ${n}`)
  }

  // Set output level of all or one chorus group to num
  choSetLevel (num) {
    return this.command(`cho_set_level ${num}`)
  }

  // Set mod speed of all or one chorus group to num (Hz)
  choSetSpeed (num) {
    return this.command(`cho_set_speed ${num}`)
  }

  // Set modulation depth of all or one chorus group to num (ms)
  choSetDepth (num) {
    return this.command(`cho_set_depth ${num}`)
  }

  // 0|1|on|off   Turn all or one chorus group on or off
  chorus (group) {
    if (typeof group !== 'undefined') {
      return this.command(`chorus ${group}`)
    } else {
      return this.command('chorus')
    }
  }

  // Set the master gain: 0-5
  gain (value) {
    return this.command(`gain ${value}`)
  }

  // Get number of active synthesis voices
  voiceCount () {
    return this.command('voice_count')
  }

  // Create a tuning with name, bank number, and program number (0 <= bank,prog <= 127)
  tuning (prog) {
    return this.command(`tuning ${prog}`)
  }

  // Tune a key
  tune (pitch) {
    return this.command(`tune ${pitch}`)
  }

  // Set the tuning for a MIDI channel
  setTuning (prog) {
    return this.command(`settuning ${prog}`)
  }

  // Restore the default tuning of a MIDI channel
  resetTuning (chan) {
    return this.command(`resettuning ${chan}`)
  }

  // Print the list of available tunings
  tunings () {
    return this.command('tunings ')
  }

  // Print the pitch details of the tuning
  dumpTuning (prog) {
    return this.command(`dumptuning ${prog}`)
  }

  // System reset (all notes off, reset controllers)
  reset () {
    return this.command('reset ')
  }

  // Set the value of a setting (must be a real-time setting to take effect immediately)
  set (value) {
    return this.command(`set ${value}`)
  }

  // Get the value of a setting
  get (name) {
    return this.command(`get ${name}`)
  }

  // Get information about a setting
  info (name) {
    return this.command(`info ${name}`)
  }

  // Print out all settings
  settings () {
    return this.command('settings ')
  }

  // Print arg
  echo (arg) {
    return this.command(`echo ${arg}`)
  }

  // sleep duration (in ms)
  sleep (duration) {
    return this.command(`sleep ${duration}`)
  }

  // Clears all routing rules from the midi router
  routerClear () {
    return this.command('router_clear ')
  }

  // Resets the midi router to default state
  routerDefault () {
    return this.command('router_default ')
  }

  // [note|cc|prog|pbend|cpress|kpress]   Starts a new routing rule
  routerBegin () {
    return this.command('router_begin ')
  }

  // filters and maps midi channels on current rule
  routerChan (add) {
    return this.command(`router_chan ${add}`)
  }

  // filters and maps parameter 1 (key/ctrl nr)
  routerPar1 (add) {
    return this.command(`router_par1 ${add}`)
  }

  // filters and maps parameter 2 (vel/cc val)
  routerPar2 (add) {
    return this.command(`router_par2 ${add}`)
  }

  // closes and commits the current routing rule
  routerEnd () {
    return this.command('router_end ')
  }

  // Start playing from the beginning of current song
  playerStart () {
    return this.command('player_start ')
  }

  // Stop playing (cannot be executed in a user command file)
  playerStop () {
    return this.command('player_stop ')
  }

  // Continue playing (cannot be executed in a user command file)
  playerCont () {
    return this.command('player_cont ')
  }

  // Move forward/backward in current song to +/-num ticks
  playerSeek (num) {
    return this.command(`player_seek ${num}`)
  }

  // Move to next song (cannot be executed in a user command file)
  playerNext () {
    return this.command('player_next ')
  }

  // Set loop number to num (-1 = loop forever)
  playerLoop (num) {
    return this.command(`player_loop ${num}`)
  }

  // Set tempo to num beats per minute
  playerTempoBpm (num) {
    return this.command(`player_tempo_bpm ${num}`)
  }

  // Set internal tempo multiplied by mul (default mul=1.0)
  playerTempoInt (mul = 1.0) {
    return this.command(`player_tempo_int ${mul}`)
  }
}
