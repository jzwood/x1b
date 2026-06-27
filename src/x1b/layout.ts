import { Node, TML } from "./markup.ts";
import { range } from "./utils.ts";

//function isLeaf(node: Node): boolean {
//return typeof node === 'string'
//}

//function renderML(ast: TML) {
//return ast.reduce((body, node) => {
//renderNode
//})
//}

const N = "─";
const NE = "┐";
const E = "│";
const SE = "┘";
const S = "─";
const SW = "└";
const W = "│";
const NW = "┌";

export function border(text: string): Block {
  const lines = text.split("\n");
  const width = lines.reduce(
    (max, line) => line.length > max ? line.length : max,
    0,
  );
  const north = NW + range(width, N).join("") + NE;
  const south = SW + range(width, S).join("") + SE;

  const content = [
    north,
    ...lines.map((line) => W + line.padEnd(width) + E),
    south,
  ]
    .join("\n");
  return { width: width + 2, height: lines.length + 2, content };
}

interface Layout {
  x: number;
  r: number;
  blocks: Block[][];
}
interface Block {
  width: number;
  height: number;
  content: string;
}

function renderNode(node: Node, maxWidth: number): Block {
  return typeof node === "string"
    ? border(node)
    : renderML(node.children, maxWidth);
}

function renderML(ast: TML, maxWidth: number): Block {
  const acc: Layout = { x: 0, r: 0, blocks: [[]] };
  const { blocks }: Layout = ast.reduce(({ x, r, blocks }, node) => {
    const meta: Block = renderNode(node, maxWidth);
    if (meta.width > (maxWidth - x)) {
      blocks.push([meta]);
      return { x: 0, r: r + 0, blocks };
    } else {
      blocks[r].push(meta);
      return { x: x + meta.width, r, blocks };
    }
  }, acc);
  return renderBlocks(blocks);
}

function renderBlocks(blocks: Block[][]): Block {
  // TODO
  return { width: 1, height: 1, content: "TODO" };
}

/*
- get MAX_WIDTH
- keep track of X OFFSET and Y OFFSET

1. eval child[n] and get text block and its dimensions
  1.1 every subchild of child[n] knows about MAX_WIDTH and will truncate content at MAX_WIDTH boundary if neccessary
2. check if there's space on current line for child.
  2.1. if so, add to row and update offsets
  2.2. if not, add to row+1 and update offsets.
3. move to child[n+1]
*/
