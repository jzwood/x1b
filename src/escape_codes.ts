export const RESET = "[0m";
export const ENABLE_ALT_SCREEN_BUFFER = "[?1049h";
export const DISABLE_ALT_SCREEN_BUFFER = "[?1049l";
export const SHOW_CURSOR = "[?25h";
export const HIDE_CURSOR = "[?25l";
export const SET_CURSOR_POS_00 = "[H";
export const CLEAR_SCREEN = "[2J";
//export const ENABLE_MOUSE_EVENT_REPORTING = "[?1002h";
export const DISABLE_MOUSE_EVENT_REPORTING = "[?1002l";
export const ENABLE_VT200_MOUSE_REPORTING = "[?1000h";
export const DISABLE_VT200_MOUSE_REPORTING = "[?1000l";
export const ENABLE_SGR_MOUSE_MODE = "[?1006h";
export const DISABLE_SGR_MOUSE_MODE = "[?1006l";
const REPORT_CURSOR_POS = "[6n";
const SAVE_CURSOR_POS = "[s";
const RESTORE_CURSOR_POS = "[u";

export const moveCursorTo = (x: number, y: number) => `[${~~x};${~~y}H`;
export const REPORT_SCREEN_SIZE = [
  SAVE_CURSOR_POS,
  moveCursorTo(999, 999),
  REPORT_CURSOR_POS,
  RESTORE_CURSOR_POS,
];
