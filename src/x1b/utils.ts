import process from "node:process";
import { Buffer } from "node:buffer";
import { ESC } from "./const.ts";

export function cmd(code: string) {
  return process.stdin.write(ESC + code);
}

export function eq(buf1: Buffer, buf2: Buffer) {
  return Buffer.compare(buf1, buf2) === 0;
}
