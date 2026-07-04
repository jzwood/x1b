const ESC_DEC = 27;
const LEFT_CLICK = "0";
const SCROLL_DOWN = "65";
const SCROLL_UP = "64";
const CLICK_DOWN = "M";
const CLICK_UP = "m";

export type OnStdin =
  | { stdin: string }
  | { noop: true };

export function handleStdin(buffer: Buffer): OnStdin {
  if (buffer[0] !== ESC_DEC) return { stdin: "KEY:" + buffer.toString("utf8") };

  const code = buffer.subarray(1).toString("utf8");
  if (code === "[A") return { stdin: "ARROW:UP" };
  if (code === "[C") return { stdin: "ARROW:RIGHT" };
  if (code === "[B") return { stdin: "ARROW:DOWN" };
  if (code === "[D") return { stdin: "ARROW:LEFT" };

  const match = code.match(/^\[\<(\d+);(\d+);(\d+)([mM])$/);
  if (match == null) return { noop: true };

  const [_, button, col, row, m] = match;
  if (button === LEFT_CLICK && m === CLICK_UP) {
    return { noop: true };
  } else if (button === LEFT_CLICK && m === CLICK_DOWN) {
    return { noop: true };
  } else if (button === SCROLL_DOWN && m === CLICK_DOWN) {
    return { noop: true };
  } else if (button === SCROLL_UP && m === CLICK_DOWN) {
    return { noop: true };
  }

  return { noop: true };
}
