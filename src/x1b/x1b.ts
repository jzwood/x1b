import process from "node:process";
import { spawn } from "node:child_process";
import { Buffer } from "node:buffer";
import { once } from "node:events";
import { USAGE } from "./const.ts";
import { onStdout } from "./stdout.ts";
import { onStdin } from "./stdin.ts";
import {
  clearScreen,
  enableAlternateScreenBuffer,
  hideCursor,
  moveCursorTo00,
} from "./escape_codes.ts";

export async function main() {
  const [command, ...args] = Deno.args;
  if (!command) {
    console.info(USAGE);
    return null;
  }
  const program = spawn(command, args);

  process.stdin.setRawMode(true);
  process.stdin.on("data", (buffer: Buffer) => {
    onStdin(program, buffer);
  });
  program.stdout.on("data", onStdout);

  enableAlternateScreenBuffer();
  hideCursor();
  moveCursorTo00();
  clearScreen();

  const [_code] = await once(program, "close");
}
