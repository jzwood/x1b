import process from "node:process";
import { Buffer } from "node:buffer";
import { moveCursorTo00 } from "./escape_codes.ts";

export function onStdout(frame: string) {
  moveCursorTo00();
  // @TODO
  // parse frame
  // pass through rendering engine
  process.stdout.write(frame);
}
