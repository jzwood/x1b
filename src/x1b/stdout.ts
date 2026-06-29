import process from "node:process";
import { Buffer } from "node:buffer";
import { SET_CURSOR_POS_00 } from "./escape_codes.ts";
import { cmd } from "./utils.ts";

export function onStdout(frame: string) {
  cmd(SET_CURSOR_POS_00);
  // @TODO
  // parse frame
  // pass through rendering engine
  process.stdout.write(frame);
}
