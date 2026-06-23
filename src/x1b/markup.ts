import {
  CURSOR,
  Cursor,
  map,
  map3,
  oneOf,
  oneOrMore,
  Parser,
  satisfy,
  word,
  wrap,
  zeroOrMore,
} from "../parser/index.ts";

enum TagName {
  Box = "box",
  Italics = "i",
  Underline = "u",
  Bold = "b",
  Strike = "s",
  Preformatted = "pre",
  Cursor = "cursor",
}

interface Element {
  tag: TagName;
  children: TML;
}

type Node = string | Element;
type TML = Node[];

const textTML: Parser<string> = map(
  oneOrMore(satisfy((c) => c !== "<")),
  (chars) => chars.join(""),
);

function parseCustomElem(tag: TagName): Parser<Element> {
  return (input: string, cursor: Cursor = CURSOR) => {
    const parseOpen: Parser<string> = wrap("<", word(tag), ">");
    const parseClose: Parser<string> = wrap("</", word(tag), ">");
    const parser = map3(
      parseOpen,
      parseML,
      parseClose,
      (_open, children, _close): Element => ({ tag, children }),
    );
    return parser(input, cursor);
  };
}

const parseElem: Parser<Element> = oneOf(
  parseCustomElem(TagName.Box),
  parseCustomElem(TagName.Italics),
  parseCustomElem(TagName.Underline),
  parseCustomElem(TagName.Bold),
  parseCustomElem(TagName.Strike),
  parseCustomElem(TagName.Preformatted),
  parseCustomElem(TagName.Cursor),
);

const parseML: Parser<TML> = zeroOrMore(oneOf<Node>(parseElem, textTML));

const input: string = `<box>
  <b>header</b>
  hello world
  <box>my name is <s>jake</s> chipmunk</box>
</box>
`;

const result1 = parseElem(input, CURSOR)
const result2 = parseElem("<box>hello <b></b><u></u>world</box>", CURSOR);
console.log(result1);
