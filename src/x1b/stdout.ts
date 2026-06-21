import process from "node:process";
import { Buffer } from "node:buffer";
import { cmd } from "./utils.ts";

export function onStdout(frame: string) {
  cmd("[H");
  process.stdout.write(frame);
}
