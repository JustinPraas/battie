import { soundDelete } from "./sound_delete";
import { soundEdit } from "./sound_edit";
import { soundList } from "./sound_list";
import { soundRegister } from "./sound_register";
import { soundPlay } from "./sound_play";

export const RANDOM_SOUND_NAME = "random"

export const soundsCommands = [ soundPlay, soundList, soundRegister, soundEdit, soundDelete ]