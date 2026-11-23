import { Element, Node, TagName, TML } from "./markup.ts";
import {
  chunkEvery,
  clamp,
  clone,
  endJoin,
  eqRGB,
  esc,
  maxBy,
  range,
  type RGB,
  sumBy,
} from "./utils.ts";
import { Attributes, BASE_ATTRIBUTES, BORDER_MAP } from "./attributes.ts";
import { RESET_BG_COLOR, setBgColor } from "./escape_codes.ts";
import { State } from "./x1b.ts";

interface Theme {
  background: string;
  middleground: string;
  foreground: string;
  button: string;
  border: string;
  text: string;
}

const THEME: Theme = {
  background: "#3e1c5e",
  middleground: "#5c2b7f",
  foreground: "#8a52a3",
  button: "#b78dd3",
  border: "#1e0e3a",
  text: "#e1c6e7",
};

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
  bg: RGB | null;
  char: string;
}

export interface Block {
  attrs: Attributes;
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
  attrs: Attributes,
  char = " ",
): Cell[] {
  return padEnd(line, width, { char, id: attrs.id, bg: attrs["bg-color"] });
}

function charToCell(attrs: Attributes): (char: string) => Cell {
  return (char: string) => ({ char, id: attrs.id, bg: attrs["bg-color"] });
}

function renderText(text: string, maxWidth: number, attrs: Attributes): Block {
  const lines = text.split("\n");
  const width = Math.min(maxWidth, maxBy(lines, (line) => line.length));
  const content = lines.flatMap((line) => chunkEvery(line, width))
    .map((line) => Array.from(line.padEnd(width)).map(charToCell(attrs)));

  return {
    attrs,
    width,
    height: content.length,
    content,
  };
}

function renderElement(
  elem: Element,
  maxWidth: number,
  parentAttrs: Attributes,
): Block {
  const isCursor = elem.tag === TagName.Cursor;
  const attrs = clone(elem.attrs);

  attrs.id = isCursor ? TagName.Cursor : attrs.id || parentAttrs.id;
  const toCell = charToCell(attrs);
  const borderKey = elem.attrs.border;
  const border = borderKey ? BORDER_MAP[borderKey] : null;
  const indent = border ? 2 : 0;

  //const childBgColor = attrs["bg-color"];
  //const parentBgColor = parentAttrs["bg-color"];

  attrs["bg-color"] ||= parentAttrs["bg-color"];
  attrs["font-color"] ||= parentAttrs["font-color"];

  const block = renderML(elem.children, maxWidth - indent, attrs);
  let content = block.content.map((line) => padLine(line, block.width, attrs));

  if (border && !isCursor) {
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

    content = endJoin(
      north,
      content.map((line) =>
        endJoin({ char: border.W, id: attrs.id, bg: attrs["bg-color"] }, line, {
          char: border.E,
          id: attrs.id,
          bg: attrs["bg-color"],
        })
      ),
      south,
    );

    const padding = 2;
    block.width += padding;
    block.height += padding;
  }

  //if (childBgColor !== parentBgColor && childBgColor != null) {
  //const bgColor = esc(setBgColor(childBgColor));
  //const bgReset = parentBgColor
  //? esc(setBgColor(parentBgColor))
  //: esc(RESET_BG_COLOR);

  //content.forEach((line) => {
  //const sol = line[0];
  //const eol = line[line.length - 1];
  //sol.char = bgColor + sol.char;
  //eol.char = eol.char + bgReset;
  //});
  //}

  block.content = content;

  return block;
}

function renderBlockRow(blocks: Block[], attrs: Attributes): Block {
  const height: number = maxBy(blocks, (block) => block.height);
  const width: number = sumBy(blocks, (block) => block.width);
  const content = range(height).map((_, h) =>
    blocks.flatMap(({ width, height, content, attrs }) =>
      h >= height ? padLine([], width, attrs) : content[h]
    )
  );

  return { attrs, height, width, content };
}

function renderBlockColumn(blocks: Block[], attrs: Attributes): Block {
  const height: number = sumBy(blocks, (block) => block.height);
  const width: number = maxBy(blocks, (block) => block.width);
  const content = blocks.flatMap(({ content }) => content);
  return { attrs, height, width, content };
}

export function renderML(
  ast: TML,
  maxWidth: number,
  attrs: Attributes,
): Block {
  const blocks: Block[][] = [[]];
  const layout = ast.reduce(({ x, r, blocks }, node: Node) => {
    const block: Block = typeof node === "string"
      ? renderText(node, maxWidth, attrs)
      : renderElement(node, maxWidth, attrs);
    if (block.width > (maxWidth - x)) {
      blocks.push([block]);
      return { x: block.width, r: r + 1, blocks };
    } else {
      blocks[r].push(block);
      return { x: x + block.width, r, blocks };
    }
  }, { x: 0, r: 0, blocks });
  if (blocks[0].length === 0) blocks.shift();

  return renderBlockColumn(
    layout.blocks.map((block) => renderBlockRow(block, attrs)),
    attrs,
  );
}

export function renderScreen(ast: TML, state: State): Block {
  const { columns: width, rows: height } = state;
  const screen = renderML(ast, width, BASE_ATTRIBUTES);
  const content = padEnd(
    screen.content,
    height,
    [],
  )
    .map((line) => padLine(line, width, BASE_ATTRIBUTES));

  state.top = clamp(0, state.top, content.length - height);

  screen.content = content.slice(state.top, height + state.top);

  return screen;
}

export function screenToFrame(screen: Block): string {
  let frame = esc(RESET_BG_COLOR);
  let bgColor: RGB | null = null;
  for (const line of screen.content) {
    for (const cell of line) {
      if (!eqRGB(cell.bg, bgColor)) {
        bgColor = cell.bg;
        frame += esc(bgColor == null ? RESET_BG_COLOR : setBgColor(bgColor));
      }
      frame += cell.char;
    }
    frame += "\n";
  }

  return frame;
}
