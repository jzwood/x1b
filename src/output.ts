import process from "node:process";
import { CURSOR } from "./parser/index.ts";
import { cmd } from "./utils.ts";
import { parseML } from "./markup.ts";
import { renderScreen } from "./layout.ts";
import { CLEAR_SCREEN, SET_CURSOR_POS_00 } from "./escape_codes.ts";
import { State } from "./x1b.ts";

const ERR_MSG = "INVALID X1B MARKUP:";
function showError(state: State) {
  process.stdout.write(ERR_MSG + state.frame.slice(ERR_MSG.length));
}

export function redraw(state: State) {
  // I think I need to remove the CLEAR_SCREEN and write full width/height each time
  //cmd(SET_CURSOR_POS_00, CLEAR_SCREEN);
  try {
    const result = parseML(state.frame, CURSOR);
    if (result.ok) {
      const frame = renderScreen(result.value.result, state.columns, state.rows)
        .content
        .map((row) => row.map(({ char }) => char).join(""))
        .join("\n");

      cmd(SET_CURSOR_POS_00);
      process.stdout.write(frame);
    } else {
      showError(state);
    }
  } catch (err) {
    console.error(err);
    //showError(state);
  }
}
