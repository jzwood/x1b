const ESC_DEC = 27;
const LEFT_CLICK = "0";
const SCROLL_DOWN = "65";
const SCROLL_UP = "64";
const CLICK_DOWN = "M";
const CLICK_UP = "m";

export function input(buffer: Buffer, write: typeof process.stdin.write) {
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
    return write(`CLICK:${col},${row}`);
  } else if (button === SCROLL_DOWN && m === CLICK_DOWN) {
    return null;
  } else if (button === SCROLL_UP && m === CLICK_DOWN) {
    return null;
  }

  return null;
}
