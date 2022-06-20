#!/bin/bash

function finish {
  kill -9 $(pgrep "fluidsynth")
}
trap finish EXIT

DIR_CURRENT="$(dirname "$(realpath "${0}")")"
DIR_SF2="$(dirname "${DIR_CURRENT}")/sf2"

if pgrep -x "fluidsynth" > /dev/null; then
  echo fluidsynth already flowing
else
  fluidsynth -si -p "fluiray" -a alsa -m alsa_seq "${DIR_SF2}"/* &
fi

worlde=$(aconnect -o | grep "WORLDE")
mpk=$(aconnect -o | grep "MPKmini2")

if [[ $mpk ]]; then
  aconnect 'MPKmini2':0 'fluiray':0
  echo MPKmini connected
fi

if [[ $worlde ]]; then
  aconnect 'WORLDE':0 'fluiray':0
  echo WORLDE connected
fi
