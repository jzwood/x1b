import {
  CURSOR,
  Cursor,
  left,
  map2,
  oneOf,
  Parser,
  right,
  someWhitespace,
  trimEnd,
  word,
  wordBy,
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

interface Attribute {
  key: string;
  value: string;
}

interface Element {
  tag: TagName;
  attrs: Attribute[];
  children: TML;
}

type Node = string | Element;
type TML = Node[];

const parseAttrKey: Parser<string> = wordBy((grapheme) =>
  (/^[a-z-]$/).test(grapheme)
);
const parseAttrValue: Parser<string> = wordBy((grapheme) =>
  (/^[a-z0-9#-]$/).test(grapheme)
);
const parseAttribute: Parser<Attribute> = map2(
  right(someWhitespace, parseAttrKey),
  wrap('="', parseAttrValue, '"'),
  (key, value) => ({ key, value }),
);

function parseCustomElem(tag: TagName): Parser<Element> {
  return (input: string, cursor: Cursor = CURSOR) => {
    const parseTag = word(tag);
    const parseOpen: Parser<Attribute[]> = wrap(
      "<",
      trimEnd(right(parseTag, zeroOrMore(parseAttribute))),
      ">",
    );
    const parseClose: Parser<string> = wrap("</", parseTag, ">");
    const parser = map2(
      parseOpen,
      left(
        parseML,
        parseClose,
      ),
      (attrs, children): Element => ({ tag, attrs, children }),
    );
    return parser(input, cursor);
  };
}

const parseText: Parser<string> = wordBy((c) => c !== "<");
const parseElem: Parser<Element> = oneOf(
  ...Object.values(TagName).map(parseCustomElem),
);
export const parseML: Parser<TML> = zeroOrMore(oneOf<Node>(parseElem, parseText));
