import process from "node:process";
import { CURSOR } from "./parser/index.ts";
import { cmd } from "./utils.ts";
import { parseML } from "./markup.ts";
import { renderML } from "./layout.ts";
import { CLEAR_SCREEN, SET_CURSOR_POS_00 } from "./escape_codes.ts";
import { State } from "./x1b.ts";

export function redraw(state: State) {
  cmd(SET_CURSOR_POS_00, CLEAR_SCREEN);

  const result = parseML(state.frame, CURSOR);
  const frame = result.ok
    ? renderML(result.value.result, state.columns).content.join(
      "\n",
    )
    : state.frame;
  process.stdout.write(frame);
}
