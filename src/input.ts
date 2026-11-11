import { State } from "./x1b.ts";
import { renderFrame, Cell } from "./layout.ts";
import { CURSOR } from "./parser/index.ts";
import { parseML } from "./markup.ts";

const ESC_DEC = 27;
const LEFT_CLICK = "0";
const SCROLL_DOWN = "65";
const SCROLL_UP = "64";
const CLICK_DOWN = "M";
const CLICK_UP = "m";

export function input(
  buffer: Buffer,
  state: State,
  write: typeof process.stdin.write,
) {
  if (buffer[0] !== ESC_DEC) return write("KEY:" + buffer.toString("utf8"));

  const code = buffer.subarray(1).toString("utf8");

  if (code === "[A") return write("ARROW:UP");
  if (code === "[C") return write("ARROW:RIGHT");
  if (code === "[B") return write("ARROW:DOWN");
  if (code === "[D") return write("ARROW:LEFT");

  const match = code.match(/^\[\<(\d+);(\d+);(\d+)([mM])$/);
  if (match == null) return null;

  const [_, button, col, row, m] = match;
  if (button === LEFT_CLICK && m === CLICK_UP) {
    return null;
  } else if (button === LEFT_CLICK && m === CLICK_DOWN) {
    //return write(`CLICK:${col},${row}`);
    handleClick(parseInt(col), parseInt(row), state, write);
  } else if (button === SCROLL_DOWN && m === CLICK_DOWN) {
    return null;
  } else if (button === SCROLL_UP && m === CLICK_DOWN) {
    return null;
  }

  return null;
}

function handleClick(
  col: number,
  row: number,
  state: State,
  write: typeof process.stdin.write,
) {
  const result = parseML(state.frame, CURSOR);
  if (result.ok) {
    const frame = renderFrame(result.value.result, state).content
    const cell: Cell = frame[row][col];
    write(`CLICK:${cell.id}`);
  }
}
