#!/bin/sh

rsvg-convert pilot-small.svg -h 16 > pilot16.png
rsvg-convert pilot-small.svg -h 32 > pilot32.png

rsvg-convert pilot.svg -h 48 > pilot48.png
rsvg-convert pilot.svg -h 128 > pilot128.png

rsvg-convert zodiac.svg -h 16 > zodiac16.png
rsvg-convert zodiac.svg -h 32 > zodiac32.png
rsvg-convert zodiac.svg -h 48 > zodiac48.png
rsvg-convert zodiac.svg -h 128 > zodiac128.png