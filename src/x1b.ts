import process from "node:process";
import { Buffer } from "node:buffer";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import { DISABLE_ALT_SCREEN_BUFFER, SHOW_CURSOR } from "./escape_codes.ts";
import { cmd, equal, getScreenSize } from "./utils.ts";
import { input } from "./input.ts";
import { once } from "node:events";
import { redraw } from "./output.ts";
import { spawn } from "node:child_process";

import {
  CLEAR_SCREEN,
  ENABLE_ALT_SCREEN_BUFFER,
  ENABLE_SGR_MOUSE_MODE,
  ENABLE_VT200_MOUSE_REPORTING,
  HIDE_CURSOR,
  SET_CURSOR_POS_00,
} from "./escape_codes.ts";

const Q_BUFF = Buffer.from("q", "ascii");
const USAGE = `
USAGE:
  deno run x1b.ts <tui-app>

EXAMPLES:
  deno run --allow-env --allow-run main.ts node snake.js
  deno run x1b.ts python3 tui-app.py
  deno run x1b.ts node tui-app.js
  deno run x1b.ts tui-app.sh
`;

export interface State {
  frame: string;
  columns: number;
  rows: number;
}

export async function main() {
  const [command, ...args] = Deno.args;
  if (!command) {
    console.info(USAGE);
    return null;
  }
  const program: ChildProcessWithoutNullStreams = spawn(command, args);
  const state: State = {
    frame: "",
    ...getScreenSize(),
  };

  process.stdin.setRawMode(true);

  cmd(
    ENABLE_ALT_SCREEN_BUFFER,
    HIDE_CURSOR,
    SET_CURSOR_POS_00,
    CLEAR_SCREEN,
    ENABLE_VT200_MOUSE_REPORTING,
    ENABLE_SGR_MOUSE_MODE,
  );

  process.stdin.on("data", (buffer: Buffer) => {
    if (equal(buffer, Q_BUFF)) {
      cmd(DISABLE_ALT_SCREEN_BUFFER, SHOW_CURSOR);
      process.exit(0);
    }
    input(buffer, program.stdin.write.bind(program));
  });
  program.stdout.on("data", (ouput: Buffer) => {
    state.frame = ouput.toString("utf8");
    redraw(state);
  });
  process.stdout.on("resize", () => {
    Object.assign(state, getScreenSize());
    redraw(state);
  });

  const [_code] = await once(program, "close");
}
