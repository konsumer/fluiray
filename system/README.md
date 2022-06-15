This is files & info for setting up a linux system.

I am using ArkOS, so these instructions will be for that, but should work firn for pi os or debian or ubuntu.

Install with this (over ssh):

```sh
sudo apt update
sudo apt-get -y install fluidsynth git

wget https://deb.nodesource.com/node_18.x/pool/main/n/nodejs/nodejs_18.3.0-1nodesource1_arm64.deb
sudo apt install ./nodejs_18.3.0-1nodesource1_arm64.deb

git clone https://github.com/konsumer/fluiray.git
cd /opt/fluiray
npm i
```

### Emulation Station

```
cp -R /opt/fluiray/system/es-theme-epicnoir/ /roms/themes/
```

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

Put your soundfonts in `/roms/sf2/`.

You might also like

- [love](https://github.com/Jetup13/es-theme-epicnoir/pull/2)
- [apps](https://github.com/Jetup13/es-theme-epicnoir/pull/1)

## TODO

- Notes on setting up [auto_midi_connect](https://github.com/stevelittlefish/auto_midi_connect)
