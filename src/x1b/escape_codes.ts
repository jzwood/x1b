import { cmd, esc } from "./utils.ts";

export const enableAlternateScreenBuffer = () => cmd("[?1049h");
export const disableAlternateScreenBuffer = () => cmd("[?1049l");
export const showCursor = () => cmd("[?25h");
export const hideCursor = () => cmd("[?25l");
export const moveCursorTo00 = () => cmd("[H");
export const moveCursorTo = (x: number, y: number) => cmd(`[${~~x};${~~y}H`);
export const clearScreen = () => cmd("[2J");

const reportCursorPos = esc('[6n')
const saveCursorPos = esc('[s')
const restorCursorPos = esc('[u')
export getScreenSize = cmd(saveCursorPos, esc('[999;999H'), reportCursorPos, restorCursorPos)

process.stdin.write(ESC + '[s' + ESC +  + ESC +  + ESC + '[u')

