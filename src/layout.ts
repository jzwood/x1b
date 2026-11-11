import { Element, Node, TML } from "./markup.ts";
import { chunkEvery, endJoin, maxBy, range, sumBy } from "./utils.ts";
import { BORDER_MAP } from "./attributes.ts";
import { State } from "./x1b.ts";

/*
  BASIC ALGORITHM
   1. eval child[n] and get text block and its dimensions
   1.1 every subchild of child[n] knows about MAX_WIDTH and will truncate content at MAX_WIDTH boundary if neccessary
   2. check if there's space on current line for child.
   2.1. if so, add to row and update offsets
   2.2. if not, add to row+1 and update offsets.
   3. move to child[n+1]
 */

export interface Cell {
  id: string;
  char: string;
}

export interface Block {
  id: string;
  width: number;
  height: number;
  content: Cell[][];
}

function padEnd<A>(line: A[], length: number, elem: A): A[] {
  const size = Math.max(0, length - line.length);
  return line.concat(range(size, elem));
}

function padLine(
  line: Cell[],
  width: number,
  id: string = "",
  char = " ",
): Cell[] {
  return padEnd(line, width, { char, id });
}

function charToCell(id: string): (char: string) => Cell {
  return (char: string) => ({ id, char });
}

function renderText(text: string, maxWidth: number, id: string): Block {
  const lines = text.trim().split("\n");
  const width = Math.min(maxWidth, maxBy(lines, (line) => line.length));
  const content = lines.flatMap((line) => chunkEvery(line, width))
    .map((line) => Array.from(line.padEnd(width)).map(charToCell(id)));

  return {
    id,
    width,
    height: content.length,
    content,
  };
}

function renderElement(
  elem: Element,
  maxWidth: number,
  parentId: string,
): Block {
  const id = elem.attrs.id || parentId;
  const toCell = charToCell(id);
  const block = renderML(elem.children, maxWidth, id);
  const border = BORDER_MAP[elem.attrs.border];
  if (border) {
    const north: Cell[] = endJoin(
      border.NW,
      range(block.width, border.N),
      border.NE,
    ).map(toCell);

    const south: Cell[] = endJoin(
      border.SW,
      range(block.width, border.S),
      border.SE,
    ).map(toCell);

    const content = endJoin(
      north,
      block.content.map((line) =>
        endJoin({ char: border.W, id }, padLine(line, block.width, id), {
          char: border.E,
          id,
        })
      ),
      south,
    );

    const padding = 2;
    block.width += padding;
    block.height += padding;
    block.content = content;
  } else {
    block.content = block.content.map((line) => padLine(line, block.width, id));
  }
  return block;
}

function renderBlockRow(blocks: Block[]): Block {
  const height: number = maxBy(blocks, (block) => block.height);
  const width: number = sumBy(blocks, (block) => block.width);
  const content = range(height).map((_, h) =>
    blocks.flatMap(({ width, height, content }) =>
      h >= height ? range(width, { char: " ", id: "" }) : content[h]
    )
  );

  return { id: "", height, width, content };
}

function renderBlockColumn(blocks: Block[]): Block {
  const height: number = sumBy(blocks, (block) => block.height);
  const width: number = maxBy(blocks, (block) => block.width);
  const content = blocks.flatMap(({ content }) => content);
  return { id: "", height, width, content };
}

export function renderML(ast: TML, maxWidth: number, id: string): Block {
  const blocks: Block[][] = [[]];
  const layout = ast.reduce(({ x, r, blocks }, node: Node) => {
    const block: Block = typeof node === "string"
      ? renderText(node, maxWidth, id)
      : renderElement(node, maxWidth, id);
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

export function renderFrame(ast: TML, state: State): Block {
  const { columns: width, rows: height } = state;
  const screen = renderML(ast, width, "");
  const trueWidth = width + 4;
  screen.content = padEnd(
    screen.content,
    height,
    [],
  )
    .map((line) => padLine(line, trueWidth))
    .slice(0, height);

  return screen;
}
