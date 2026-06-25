import process from "node:process";
import { Buffer } from "node:buffer";
import { ESC } from "./const.ts";

//export function cmd(code: string) {
//return process.stdin.write(ESC + code);
//}

export function esc(code: string): string {
  return ESC + code;
}

//export function esc(...codes: string[]) {
//return codes.map(code => ESC + code).join('');
//}

export function cmd(...codes: string[]) {
  return process.stdin.write(codes.map((code) => ESC + code).join(""));
}

export function eq(buf1: Buffer, buf2: Buffer) {
  return Buffer.compare(buf1, buf2) === 0;
}

export function range(n: number, f: string | number = 0) {
  return Array(n).fill(f);
}
