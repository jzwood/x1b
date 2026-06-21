import { ChildProcessWithoutNullStreams } from "node:child_process";
import process from "node:process";
import { Buffer } from "node:buffer";
import { DOWN, LEFT, QUIT, RIGHT, UP } from "./const.ts";
import { cmd, eq } from "./utils.ts";

export function onStdin(
  program: ChildProcessWithoutNullStreams,
  chunk: Buffer,
) {
  const is = eq.bind(null, chunk);
  if (is(QUIT)) {
    // disable alternate screen buffer
    cmd("[?1049l");
    // show cursor
    cmd("[?25h");
    process.exit(0);
  } else if (is(UP)) {
    program.stdin.write("UP");
  } else if (is(RIGHT)) {
    program.stdin.write("RIGHT");
  } else if (is(DOWN)) {
    program.stdin.write("DOWN");
  } else if (is(LEFT)) {
    program.stdin.write("LEFT");
  } else {
    // DO NOTHING
  }
}
