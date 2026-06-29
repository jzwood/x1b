import process from "node:process";
import { spawn } from "node:child_process";
import { Buffer } from "node:buffer";
import { once } from "node:events";
import { USAGE } from "./const.ts";
import { onStdout } from "./stdout.ts";
import { onStdin } from "./stdin.ts";
import {
  CLEAR_SCREEN,
  ENABLE_ALT_SCREEN_BUFFER,
  HIDE_CURSOR,
  SET_CURSOR_POS_00,
} from "./escape_codes.ts";
import { cmd } from "./utils.ts";

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

  cmd(
    ENABLE_ALT_SCREEN_BUFFER,
    HIDE_CURSOR,
    SET_CURSOR_POS_00,
    CLEAR_SCREEN,
  );

  const [_code] = await once(program, "close");
}
