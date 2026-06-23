import {
  //anyWhitespace,
  //bind,
  char,
  CURSOR,
  Cursor,
  //left,
  //map,
  map,
  map3,
  oneOf,
  oneOrMore,
  Parser,
  //right,
  satisfy,
  traverse,
  //someWhitespace,
  word,
  wrap,
  zeroOrMore,
} from "../parser/index.ts";

//<box></box>
//<i></i>
//<u></u>
//<b></b>
//<s></s>
//<pre></pre>
//<cursor></cursor>

enum TagName {
  Box,
  Italics,
  Underline,
  Bold,
  Strike,
  Preformatted,
  Cursor,
}

interface Element {
  tag: TagName;
  children: TML;
}

type TML = string | Element[];

const textTML: Parser<string> = map(
  oneOrMore(satisfy((c) => c !== "<")),
  (chars) => chars.join(""),
);

const parseElem: Parser<Element> = oneOf(
  parseCustomElem("box", TagName.Box),
  parseCustomElem("i", TagName.Italics),
  parseCustomElem("u", TagName.Underline),
  parseCustomElem("s", TagName.Strike),
  parseCustomElem("cursor", TagName.Cursor),
);

const parseML: Parser<TML> = oneOf<TML>(zeroOrMore(parseElem), textTML);

function parseCustomElem(name: string, tag: TagName): Parser<Element> {
  return (input: string, cursor: Cursor = CURSOR) => {
    const parseOpen: Parser<string> = wrap("<", word(name), ">");
    const parseClose: Parser<string> = wrap("</", word(name), ">");
    const parser = map3(
      parseOpen,
      parseML,
      parseClose,
      (_open, children, _close): Element => ({ tag, children }),
    );
    return parser(input, cursor);
  };
}
