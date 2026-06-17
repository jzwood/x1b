import process from "node:process";
import { spawn } from "node:child_process";
import { Buffer } from "node:buffer";
import { once } from "node:events";
import { USAGE } from "./const.ts";
import { onStdout } from "./stdout.ts";
import { onStdin } from "./stdin.ts";
import { cmd } from "./utils.ts";

export async function main() {
  const command = process.argv.at(2);
  const args = process.argv.slice(3);
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

  // enable alternate screen buffer
  cmd("?1049h");
  // hide cursor
  cmd("?25l");
  // move cursor to 0, 0
  cmd("H");
  // clear screen
  cmd("2J");

  const [_code] = await once(program, "close");
}
