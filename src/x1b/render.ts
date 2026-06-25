import { TML } from "./markup.ts";
import { range } from "./utils.ts";

function render(ast: TML) {
}

const N = "─";
const NE = "┐";
const E = "│";
const SE = "┘";
const S = "─";
const SW = "└";
const W = "│";
const NW = "┌";

export function border(text: string) {
  const lines = text.trim().split("\n");

  const width = lines.reduce(
    (max, line) => line.length > max ? line.length : max,
    0,
  );
  const north = NW + range(width, N).join("") + NE;
  const south = SW + range(width, S).join("") + SE;

  return [north, ...lines.map((line) => W + line.padEnd(width) + E), south]
    .join("\n");
}
