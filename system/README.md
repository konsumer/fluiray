This is files & info for setting up a linux system.

I am using ArkOS, so these instructions will be for that.

Install with this (over ssh):

```sh
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get -y install nodejs fluidsynth

git clone git@github.com:konsumer/fluiray.git /opt/fluiray
cd /opt/fluiray
npm i
```

### Emulation Station

Install files in es-theme-epicnoir in your theme-dir (in /roms/themes/).

Add this to `/etc/emulationstation/es_systems.cfg`:

```xml
<system>
  <name>sf2</name>
  <fullname>Soundfont</fullname>
  <path>/roms/sf2</path>
  <extension>.sf2</extension>
  <command>node /opt/fluiray/fluiray.js %ROM%</command>
</system>
```

You might also like

- [love](https://github.com/Jetup13/es-theme-epicnoir/pull/2)
- [apps](https://github.com/Jetup13/es-theme-epicnoir/pull/1)

Put your soundfonts in `/roms/sf2/`.

## TODO

- Notes on setting up [auto_midi_connect](https://github.com/stevelittlefish/auto_midi_connect)