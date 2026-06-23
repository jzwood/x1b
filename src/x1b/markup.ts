import {
  CURSOR,
  Cursor,
  //anyWhitespace,
  //bind,
  //char,
  //left,
  //map,
  map3,
  oneOf,
  Parser,
  //oneOrMore,
  //right,
  //satisfy,
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

//const parseTagName: Parser<TagName> = oneOf(
//map(word("box"), () => TagName.Box),
//map(word("i"), () => TagName.Italics),
//map(word("u"), () => TagName.Underline),
//map(word("s"), () => TagName.Strike),
//map(word("pre"), () => TagName.Preformatted),
//map(word("cursor"), () => TagName.Cursor),
//);

const parseTagName: Parser<string> = oneOf(
  word("box"),
  word("i"),
  word("u"),
  word("s"),
  word("pre"),
  word("cursor"),
);

const parseML: Parser<TML> = zeroOrMore(
  oneOf(
    parseElem("box", TagName.Box),
    parseElem("i", TagName.Italics),
    parseElem("u", TagName.Underline),
    parseElem("s", TagName.Strike),
    parseElem("cursor", TagName.Cursor),
  ),
);

function parseElem(name: string, tag: TagName): Parser<Element> {
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
