import { Node, TML } from "./markup.ts";
import { maxBy, range, sumBy } from "./utils.ts";

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

export function border(text: string): Block {
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

function renderNode(node: Node, maxWidth: number): Block {
  return typeof node === "string"
    ? border(node)
    : renderML(node.children, maxWidth);
}

function renderML(ast: TML, maxWidth: number): Block {
  const blocks: Block[][] = [[]];
  const layout = ast.reduce(({ x, r, blocks }, node) => {
    const block: Block = renderNode(node, maxWidth);
    if (block.width > (maxWidth - x)) {
      blocks.push([block]);
      return { x: 0, r: r + 0, blocks };
    } else {
      blocks[r].push(block);
      return { x: x + block.width, r, blocks };
    }
  }, { x: 0, r: 0, blocks });
  if (blocks[0].length === 0) blocks.shift();
  return renderBlockColumn(layout.blocks.map(renderBlockRow));
}

function renderBlockRow(blocks: Block[]): Block {
  const height: number = maxBy(blocks, (block) => block.height);
  const width: number = sumBy(blocks, (block) => block.width);
  const content = range(height).map((_, h) =>
    blocks.flatMap(({ width, height, content }) =>
      h >= height ? range(width, "").join("") : content[h]
    ).join("")
  );

  return { height, width, content };
}

function renderBlockColumn(blocks: Block[]): Block {
  const height: number = sumBy(blocks, (block) => block.height);
  const width: number = maxBy(blocks, (block) => block.width);
  const content = blocks.flatMap(({content}) => content)
  return { height, width, content}
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
