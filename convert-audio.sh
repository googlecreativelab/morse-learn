#!/bin/bash

for i in assets/sounds/*.mp3;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -i "$i" -c:a libfdk_aac -profile:a aac_he_v2 -b:a 32k "${name}.m4a"
done

for i in assets/sounds/soundalikes-mw/*.mp3;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -i "$i" -c:a libfdk_aac -profile:a aac_he_v2 -b:a 32k "${name}.m4a"
done


for i in assets/sounds/soundalikes-ww/*.mp3;
  do name=`echo "$i" | cut -d'.' -f1`
  echo "$name"
  ffmpeg -i "$i" -c:a libfdk_aac -profile:a aac_he_v2 -b:a 32k "${name}.m4a"
done