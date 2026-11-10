import process from "node:process";
import { Buffer } from "node:buffer";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import { DISABLE_ALT_SCREEN_BUFFER, SHOW_CURSOR } from "./escape_codes.ts";
import { cmd, equal, getScreenSize } from "./utils.ts";
import { setImmediate } from "node:timers";
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

interface Draw {
  resized: boolean;
  locked: boolean;
  updated: boolean;
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

  const draw: Draw = {
    updated: false,
    resized: false,
    locked: false,
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

  function requestFrame() {
    if ((draw.updated || draw.resized) && !draw.locked) {
      draw.locked = true;

      if (draw.resized) {
        Object.assign(state, getScreenSize());
        draw.resized = false;
      }

      redraw(state);
      draw.updated = false;

      setImmediate(() => {
        draw.locked = false;
        requestFrame();
      });
    }
  }

  const write = program.stdin.write.bind(program.stdin);
  process.stdin.on("data", (buffer: Buffer) => {
    if (equal(buffer, Q_BUFF)) {
      cmd(DISABLE_ALT_SCREEN_BUFFER, SHOW_CURSOR);
      process.exit(0);
    }
    input(buffer, write);
  });
  program.stdout.on("data", (ouput: Buffer) => {
    state.frame = ouput.toString("utf8");
    draw.updated = true;
    requestFrame();
  });
  process.stdout.on("resize", () => {
    draw.resized = true;
    requestFrame();
  });

  const [_code] = await once(program, "close");
}
