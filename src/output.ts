import process from "node:process";
import { setImmediate } from "node:timers";
import { CURSOR } from "./parser/index.ts";
import { parseML, TagName } from "./markup.ts";
import { Cell, renderScreen } from "./layout.ts";
import {
  HIDE_CURSOR,
  moveCursorTo,
  SET_CURSOR_POS_00,
  SHOW_CURSOR,
} from "./escape_codes.ts";
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

function findCursor(content: Cell[][]): [number, number] | undefined {
  for (let r = 0; r < content.length; r++) {
    const row = content[r];
    for (let c = 0; c < row.length; c++) {
      const cell: Cell = row[c];
      if (cell.id === TagName.Cursor) {
        return [r + 1, c + 1];
      }
    }
  }
}

function redraw(state: State, exit: (msg: string) => void): void {
  try {
    const result = parseML(state.frame, CURSOR);
    if (result.ok) {
      if (result.value.remainder === "") {
        const screen = renderScreen(result.value.result, state).content;

        const frame = screen
          .map((row) => row.map(({ char }) => char).join(""))
          .join("\n");

        cmd(HIDE_CURSOR, SET_CURSOR_POS_00);
        Deno.writeTextFileSync("log.txt", frame);
        process.stdout.write(frame);

        const cursor = findCursor(screen);
        if (cursor) {
          cmd(SHOW_CURSOR, moveCursorTo(...cursor));
        }
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
