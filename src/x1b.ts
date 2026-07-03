import process from "node:process";
import { spawn } from "node:child_process";
import { Buffer } from "node:buffer";
import { once } from "node:events";
import { USAGE } from "./const.ts";
import { onStdin } from "./stdin.ts";
import { renderML } from "./layout.ts";
import { parseML } from "./markup.ts";
import { CURSOR } from "./parser/index.ts";
import { getScreenSize } from "./utils.ts";

import {
  CLEAR_SCREEN,
  ENABLE_ALT_SCREEN_BUFFER,
  ENABLE_SGR_MOUSE_MODE,
  ENABLE_VT200_MOUSE_REPORTING,
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
  const state = {
    frame: "",
    ...getScreenSize(),
  };

  function render() {
    cmd(SET_CURSOR_POS_00);
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
    onStdin(program, buffer);
  });
  program.stdout.on("data", (input: Buffer) => {
    state.frame = input.toString("utf8");
    render();
  });
  process.stdout.on("resize", () => {
    Object.assign(state, getScreenSize());
    cmd(CLEAR_SCREEN);
    render();
  });

  const [_code] = await once(program, "close");
}
