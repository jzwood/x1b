import process from "node:process";
import { ChildProcessWithoutNullStreams } from "node:child_process";
import { Buffer } from "node:buffer";
import { CURSOR } from "./parser/index.ts";
import { DISABLE_ALT_SCREEN_BUFFER, SHOW_CURSOR } from "./escape_codes.ts";
import { cmd, equal, getScreenSize } from "./utils.ts";
import { once } from "node:events";
import { parseML } from "./markup.ts";
import { renderML } from "./layout.ts";
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

export async function main() {
  const [command, ...args] = Deno.args;
  if (!command) {
    console.info(USAGE);
    return null;
  }
  const program: ChildProcessWithoutNullStreams = spawn(command, args);
  const state = {
    frame: "",
    ...getScreenSize(),
  };

  function render() {
    cmd(SET_CURSOR_POS_00, CLEAR_SCREEN);
    if (!state.frame) return null;

    const result = parseML(state.frame, CURSOR);
    const frame = result.ok
      ? renderML(result.value.result, state.columns).content.join(
        "\n",
      )
      : state.frame;
    process.stdout.write(frame);
  }

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
    handleStdIn(buffer);
  });
  program.stdout.on("data", (input: Buffer) => {
    state.frame = input.toString("utf8");
    render();
  });
  process.stdout.on("resize", () => {
    Object.assign(state, getScreenSize());
    render();
  });

  const [_code] = await once(program, "close");
}
