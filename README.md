# fluiray

node-raylib frontend for fluidsynth, for handheld computers


I have a RG351V, which has sound, a gamepad, and a 640x480 screen built-in. I wanted a way to use easily use fluidsynth with soundfonts on a MIDI keyboard plugged into it.


## installation

```sh
sudo -s

git clone git@github.com:konsumer/fluiray.git /opt/fluiray
cd /opt/fluiray
npm i
```

## usage

Run `npm start` in the dir. Args are the list of SF2 files you have available:

```sh
cd /opt/fluiray
npm start /usr/share/sounds/sf2/*.sf2
```
