import { cmd } from "./utils.ts";

export const enableAlternateScreenBuffer = () => cmd("[?1049h");
export const hideCursor = () => cmd("[?25l");
export const moveCursorTo00 = () => cmd("[H");
export const clearScreen = () => cmd("[2J");
