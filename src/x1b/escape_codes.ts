import { cmd, esc } from "./utils.ts";

export const enableAlternateScreenBuffer = esc("[?1049h");
export const disableAlternateScreenBuffer = esc("[?1049l");
export const showCursor = esc("[?25h");
export const hideCursor = esc("[?25l");
export const moveCursorTo00 = esc("[H");
export const moveCursorTo = (x: number, y: number) => esc(`[${~~x};${~~y}H`);
export const clearScreen = esc("[2J");

const reportCursorPos = esc("[6n");
const saveCursorPos = esc("[s");
const resetCursorPos = esc("[u");
export const reportScreenSize = cmd(
  saveCursorPos,
  moveCursorTo(999, 999),
  reportCursorPos,
  resetCursorPos,
);
