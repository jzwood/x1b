import {
  CURSOR,
  Cursor,
  join,
  map,
  map3,
  oneOf,
  oneOrMore,
  Parser,
  right,
  satisfy,
  trimEnd,
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

enum AttrKey {
  Flow = "flow",
  BorderStyle = "border-style",
  BorderColor = "border-color",
  BgColor = "bg-color",
  FontColor = "font-color",
}

//const ATTR_VALUE = {
//[AttrKey.Flow]: ['auto', 'row', 'column'],
//Flow = "flow",
//BorderStyle = "border-style",
//BorderColor = "border-color",
//BgColor = "bg-color",
//FontColor = "font-color",
//}

//enum AttrValue {
//Auto,
//Row,
//Column,
//Solid,
//None,
//}

interface Attribute {
  key: string;
  value: string;
}

function isAttrChar(grapheme: string) {
  return (/^[a-z0-9#-]$/).test(grapheme);
}
function parseAttribute(key: string): Parser<Attribute> {
  const parseValue = wrap('="', map(oneOrMore(satisfy(isAttrChar)), join), '"');
  return map(right(word(key), parseValue), (value) => ({ key, value }));
}

interface Element {
  tag: TagName;
  attrs: Attribute[];
  children: TML;
}

type Node = string | Element;
type TML = Node[];

function parseCustomElem(tag: TagName): Parser<Element> {
  return (input: string, cursor: Cursor = CURSOR) => {
    const parseTag = word(tag);
    const parseOpen: Parser<string> = wrap("<", parseTag, ">");
    const parseClose: Parser<string> = wrap("</", parseTag, ">");
    const parser = map3(
      parseOpen,
      parseML,
      parseClose,
      (_open, children, _close): Element => ({ tag, children }),
    );
    return parser(input, cursor);
  };
}

const parseText: Parser<string> = map(
  oneOrMore(satisfy((c) => c !== "<")),
  join,
);
const parseElem: Parser<Element> = oneOf(
  ...Object.values(TagName).map(parseCustomElem),
);
const parseML: Parser<TML> = zeroOrMore(oneOf<Node>(parseElem, parseText));

const input: string = `<box>
  <b>header</b>
  hello world
  <box>my name is <s>jake</s> chipmunk</box>
</box>
`;

const result1 = parseElem(input, CURSOR);
const result2 = parseElem("<box>hello <b></b><u></u>world</box>", CURSOR);
console.log(JSON.stringify(result1, null, 2));
