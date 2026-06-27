import { TML, Node } from "./markup.ts";
import { range } from "./utils.ts";

//function isLeaf(node: Node): boolean {
  //return typeof node === 'string'
//}

function renderML(ast: TML) {
  return ast.reduce((body, node) => {
    renderNode
  })
}

function renderNode(node: Node) { // }, width: number, height: number) {
  if (typeof node === 'string') return node
  return renderML(node.children)
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
  const lines = text.split("\n");
  const width = lines.reduce(
    (max, line) => line.length > max ? line.length : max,
    0,
  );
  const north = NW + range(width, N).join("") + NE;
  const south = SW + range(width, S).join("") + SE;

  return [north, ...lines.map((line) => W + line.padEnd(width) + E), south]
    .join("\n");
}

- get MAX_WIDTH
- keep track of X OFFSET and Y OFFSET

1. eval child[n] and get text block and its dimensions
  1.1 every subchild of child[n] knows about MAX_WIDTH and will truncate content at MAX_WIDTH boundary if neccessary
2. check if there's space on current line for child.
  2.1. if so, add to row and update offsets
  2.2. if not, add to row+1 and update offsets.
3. move to child[n+1]
