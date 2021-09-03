import { getSound } from "./get_sound";
import { playSound } from "./play_sound";
import { uploadSound } from "./upload_sound";

export const SOUND_FILES_DIR_REL_PATH = "../../../static/sound-files"
export const soundsCommands = [ getSound, playSound, uploadSound ]