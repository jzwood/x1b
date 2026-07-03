import process from "node:process";
import { Buffer } from "node:buffer";
import { ESC } from "./const.ts";

export function esc(code: string): string {
  return ESC + code;
}

export function cmd(...codes: string[]) {
  return process.stdin.write(codes.map(esc).join(""));
}

export function getScreenSize() {
  const BUFF_COLS = 4;
  const { columns, rows } = Deno.consoleSize();
  return { columns: columns - BUFF_COLS, rows };
}

export function eq(buf1: Buffer, buf2: Buffer) {
  return Buffer.compare(buf1, buf2) === 0;
}

export function range<T>(n: number, f: T | number = 0) {
  return Array(n).fill(f);
}

export function maxBy<T>(arr: T[], fn: (x: T) => number): number {
  return arr.reduce((acc, x) => Math.max(acc, fn(x)), 0);
}

export function sumBy<T>(arr: T[], fn: (x: T) => number): number {
  return arr.reduce((acc, x) => acc + fn(x), 0);
}

//export function chunkEvery<T>(arr: T[], count: number, acc: T[][] = []): T[][] {
//if (arr.length === 0) return acc
//const head: T[] = arr.slice(0, count)
//const tail: T[] = arr.slice(count)
//return chunkEvery(tail, count, [...acc, head])
//}

export function chunkEvery(
  str: string,
  count: number,
  acc: string[] = [],
): string[] {
  if (str.length === 0) return acc;
  const head = str.slice(0, count);
  const tail = str.slice(count);
  return chunkEvery(tail, count, [...acc, head]);
}
