# fluiray

node-raylib frontend for fluidsynth, for handheld computers

![menu](menu.gif)


I have a RG351V, which has sound, a gamepad, and a 640x480 screen built-in. I wanted a way to use easily use fluidsynth with soundfonts on a MIDI keyboard plugged into it.

You need to run fluidsynth first, on port 31337.

```
fluidsynth -q -d -p fluidray -s -o shell.port=31337
```


Hints for installation & usage can be found [here](system/).