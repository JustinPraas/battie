import { deleteSound } from "./delete_sound";
import { editSound } from "./edit_sound";
import { listSounds } from "./list_sounds";
import { registerSound } from "./register_sound";
import { soundboard } from "./soundboard";

export const soundsCommands = [ soundboard, listSounds, registerSound, editSound, deleteSound ]