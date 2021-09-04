export const RANDOM_SOUND_NAME = "random"

export const DEFAULT_VOLUME = 0.4

export const VOLUMES = [0.10, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1]
export const VOLUME_CHOICES = VOLUMES.map(v => ({name: v.toString(), value: v}))

export function getVolumeChoices() {
    return VOLUME_CHOICES
}

import { soundDelete } from "./sound_delete";
import { soundEdit } from "./sound_edit";
import { soundList } from "./sound_list";
import { soundRegister } from "./sound_register";
import { soundPlay } from "./sound_play";
import { soundEditVolume } from "./sound_edit_volume";

export const soundsCommands = [ soundPlay, soundList, soundRegister, soundEdit, soundEditVolume, soundDelete ]