# fluiray

node-raylib frontend for fluidsynth, for handheld computers

![menu](menu.gif)


I have a RG351V, which has sound, a gamepad, and a 640x480 screen built-in. I wanted a way to use easily use fluidsynth with soundfonts on a MIDI keyboard plugged into it.


## installation

```sh
sudo -s

git clone git@github.com:konsumer/fluiray.git /opt/fluiray
cd /opt/fluiray
npm i
```

You need to have node & fluidsynth installed. On deb-based systems (pi os, ArcOS, ubuntu, etc) you can do that with this:

```sh
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get -y install nodejs fluidsynth

# not required, but it's 2 nice soundfonts
sudo apt-get -y install fluid-soundfont-gm fluid-soundfont-gs
```


## usage

Run `npm start` in the dir. Args are the list of SF2 files you have available:

```sh
cd /opt/fluiray
npm start /usr/share/sounds/sf2/*.sf2
```
