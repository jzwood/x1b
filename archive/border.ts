import { chunkEvery, maxBy, range, sumBy } from "../src/utils.ts";

const N = "─";
const NE = "┐";
const E = "│";
const SE = "┘";
const S = "─";
const SW = "└";
const W = "│";
const NW = "┌";

interface Block {
  width: number;
  height: number;
  content: string[];
}

function border(text: string): Block {
  const lines = text.split("\n");
  const width = maxBy(lines, (line) => line.length);

  const north: string = [NW, ...range(width, N), NE].join("");
  const south: string = [SW, ...range(width, S), SE].join("");
  const content = [
    north,
    ...lines.map((line) => [W, ...line.padEnd(width), E].join("")),
    south,
  ];

  return {
    width: content[0]?.length ?? 0,
    height: content.length,
    content,
  };
}
