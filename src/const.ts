import { Buffer } from 'node:buffer';

export const ESC = "\x1b"
export const QUIT = Buffer.from("q", "ascii");
export const UP = Buffer.from("\x1b\x5b\x41");
export const DOWN = Buffer.from("\x1b\x5b\x42");
export const LEFT = Buffer.from("\x1b\x5b\x44");
export const RIGHT = Buffer.from("\x1b\x5b\x43");
export const USAGE = `
USAGE:
  deno run x1b.ts <tui-app>

EXAMPLES:
  deno run x1b.ts python3 tui-app.py
  deno run x1b.ts node tui-app.js
  deno run x1b.ts tui-app.sh
`
