import process from "node:process";
import { CURSOR } from "./parser/index.ts";
import { cmd } from "./utils.ts";
import { parseML } from "./markup.ts";
import { renderML } from "./layout.ts";
import { CLEAR_SCREEN, SET_CURSOR_POS_00 } from "./escape_codes.ts";
import { State } from "./x1b.ts";

const ERR_MSG = "INVALID X1B MARKUP:";
function showError(state: State) {
  process.stdout.write(ERR_MSG + state.frame.slice(ERR_MSG.length));
}

export function redraw(state: State) {
  cmd(SET_CURSOR_POS_00, CLEAR_SCREEN);

  try {
    const result = parseML(state.frame, CURSOR);
    if (result.ok) {
      const frame = renderML(result.value.result, state.columns).content.join(
        "\n",
      );
      process.stdout.write(frame);
    } else {
      showError(state);
    }
  } catch (_) {
    showError(state);
  }
}
