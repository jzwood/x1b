import { cmd, esc } from "./utils.ts";

export const ENABLE_ALT_SCREEN_BUFFER = esc("[?1049h");
export const DISABLE_ALT_SCREEN_BUFFER = esc("[?1049l");
export const SHOW_CURSOR = esc("[?25h");
export const HIDE_CURSOR = esc("[?25l");
export const SET_CURSOR_POS_00 = esc("[H");
export const CLEAR_SCREEN = esc("[2J");
export const ENABLE_MOUSE_EVENT_REPORTING = esc("[?1002h");
export const DISABLE_MOUSE_EVENT_REPORTING = esc("[?1002l");
const REPORT_CURSOR_POS = esc("[6n");
const SAVE_CURSOR_POS = esc("[s");
const RESTORE_CURSOR_POS = esc("[u");

export const moveCursorTo = (x: number, y: number) => esc(`[${~~x};${~~y}H`);
export const reportScreenSize = cmd(
  SAVE_CURSOR_POS,
  moveCursorTo(999, 999),
  REPORT_CURSOR_POS,
  RESTORE_CURSOR_POS,
);
