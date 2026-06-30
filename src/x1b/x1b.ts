import process from "node:process";
import { spawn } from "node:child_process";
import { Buffer } from "node:buffer";
import { once } from "node:events";
import { USAGE } from "./const.ts";
import { onStdin } from "./stdin.ts";
import { renderML } from "./layout.ts";
import { parseML } from "./markup.ts";
import { CURSOR } from "../parser/index.ts";

import {
  CLEAR_SCREEN,
  DISABLE_ALT_SCREEN_BUFFER,
  ENABLE_ALT_SCREEN_BUFFER,
  HIDE_CURSOR,
  SET_CURSOR_POS_00,
  SHOW_CURSOR,
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
    columns: 80,
    rows: 24,
  };

  function render() {
    cmd(SET_CURSOR_POS_00);
    if (!state.frame) return null;

    const result = parseML(state.frame, CURSOR);
    if (result.ok) {
      const frame = renderML(result.value.result, state.columns).content.join(
        "\n",
      );
      process.stdout.write(frame);
    }
  }

  process.stdin.setRawMode(true);

  cmd(
    ENABLE_ALT_SCREEN_BUFFER,
    HIDE_CURSOR,
    SET_CURSOR_POS_00,
    CLEAR_SCREEN,
  );

  process.stdin.on("data", (buffer: Buffer) => {
    onStdin(program, buffer);
  });
  program.stdout.on("data", (input: Buffer) => {
    state.frame = input.toString("utf8");
    render();
  });
  process.stdout.on("resize", () => {
    const { columns, rows } = Deno.consoleSize();
    state.columns = columns;
    state.rows = rows;
    cmd(CLEAR_SCREEN);
    render();
  });

  const [_code] = await once(program, "close");
}
