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
