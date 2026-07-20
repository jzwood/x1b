import { Element, Node, TML } from "./markup.ts";
import {
  chunkEvery,
  lineLength,
  maxBy,
  range,
  safeIndex,
  sumBy,
} from "./utils.ts";
import { BORDER_MAP } from "./attributes.ts";

/*
  BASIC ALGORITHM
   1. eval child[n] and get text block and its dimensions
   1.1 every subchild of child[n] knows about MAX_WIDTH and will truncate content at MAX_WIDTH boundary if neccessary
   2. check if there's space on current line for child.
   2.1. if so, add to row and update offsets
   2.2. if not, add to row+1 and update offsets.
   3. move to child[n+1]
 */

interface Block {
  width: number;
  height: number;
  content: string[];
}

function safePad(line: string, width: number): string {
  return line.padEnd(safeIndex(line, width));
}

// OKAY. instead of getLineLength. instead, for each line, we want to remove the escape code and keep track of its index. We'll then calculate width and do chunking and stuff and at the end we'll surgically replace the escape codes.
function renderText(text: string, maxWidth: number): Block {
  const lines = text.trim().split("\n");
  const width = Math.min(maxWidth, maxBy(lines, lineLength));
  const content = lines.flatMap((line) =>
    chunkEvery(line, width).map((line) => safePad(line, width))
  );

  return {
    width,
    height: content.length,
    content,
  };
}

function renderElement(elem: Element, maxWidth: number): Block {
  const block = renderML(elem.children, maxWidth);
  const border = BORDER_MAP[elem.attrs.border];
  if (border) {
    const north: string = [
      border.NW,
      ...range(block.width, border.N),
      border.NE,
    ]
      .join("");
    const south: string = [
      border.SW,
      ...range(block.width, border.S),
      border.SE,
    ]
      .join("");
    block.content = [
      north,
      ...block.content.map((line) =>
        border.W + safePad(line, block.width) + border.E
      ),
      south,
    ];
    const padding = 2;
    block.width += padding;
    block.height += padding;
  } else {
    block.content = block.content.map((line) => safePad(line, block.width));
  }
  return block;
}

function renderBlockRow(blocks: Block[]): Block {
  const height: number = maxBy(blocks, (block) => block.height);
  const width: number = sumBy(blocks, (block) => block.width);
  const content = range(height).map((_, h) =>
    blocks.flatMap(({ width, height, content }) =>
      h >= height ? range(width + 1, "").join(" ") : content[h]
    ).join("")
  );

  return { height, width, content };
}

function renderBlockColumn(blocks: Block[]): Block {
  const height: number = sumBy(blocks, (block) => block.height);
  const width: number = maxBy(blocks, (block) => block.width);
  const content = blocks.flatMap(({ content }) => content);
  return { height, width, content };
}

export function renderML(ast: TML, maxWidth: number): Block {
  const blocks: Block[][] = [[]];
  const layout = ast.reduce(({ x, r, blocks }, node: Node) => {
    const block: Block = typeof node === "string"
      ? renderText(node, maxWidth)
      : renderElement(node, maxWidth);
    if (block.width > (maxWidth - x)) {
      blocks.push([block]);
      return { x: block.width, r: r + 1, blocks };
    } else {
      blocks[r].push(block);
      return { x: x + block.width, r, blocks };
    }
  }, { x: 0, r: 0, blocks });
  if (blocks[0].length === 0) blocks.shift();
  return renderBlockColumn(layout.blocks.map(renderBlockRow));
}
