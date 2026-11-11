import process from "node:process";
import { setImmediate } from "node:timers";
import { CURSOR } from "./parser/index.ts";
import { parseML } from "./markup.ts";
import { renderFrame } from "./layout.ts";
import { SET_CURSOR_POS_00 } from "./escape_codes.ts";
import { State } from "./x1b.ts";
import { cmd, getScreenSize } from "./utils.ts";

interface Draw {
  resized: boolean;
  locked: boolean;
  updated: boolean;
}

export enum Change {
  NO_OP,
  NEW_FRAME,
  RESIZED,
}

const draw: Draw = {
  updated: false,
  resized: false,
  locked: false,
};

export function requestDraw(
  state: State,
  change: Change,
  exit: (msg: string) => void,
) {
  if (change === Change.NEW_FRAME) {
    draw.updated = true;
  } else if (change === Change.RESIZED) {
    draw.resized = true;
  } else {
    // do nothing
  }

  if ((draw.updated || draw.resized) && !draw.locked) {
    draw.locked = true;

    if (draw.resized) {
      Object.assign(state, getScreenSize());
      draw.resized = false;
    }

    redraw(state, exit);
    draw.updated = false;

    setImmediate(() => {
      draw.locked = false;
      requestDraw(state, Change.NO_OP, exit);
    });
  }
}

function redraw(state: State, exit: (msg: string) => void): void {
  try {
    const result = parseML(state.frame, CURSOR);
    if (result.ok) {
      if (result.value.remainder === "") {
        const frame = renderFrame(result.value.result, state)
          .content
          .map((row) => row.map(({ char }) => char).join(""))
          .join("\n");

        cmd(SET_CURSOR_POS_00);
        process.stdout.write(frame);
      } else {
        const { row, col } = result.value.cursor;
        exit(
          `Invalid x1b markup. could not parse after row ${row}, column ${col}\ncould not parse: ${result.value.remainder}`,
        );
      }
    } else {
      const { row, col } = result.error;
      exit(
        `Invalid x1b markup. could not parse after row ${row}, column ${col}`,
      );
    }
  } catch (err) {
    exit(String(err));
  }
}
