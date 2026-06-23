import {
  CURSOR,
  Cursor,
  left,
  map2,
  oneOf,
  Parser,
  right,
  satisfy,
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
const parseML: Parser<TML> = zeroOrMore(oneOf<Node>(parseElem, parseText));

const input: string = `<box>
  <b flow="auto" bg-color="#34eb0a">header</b>
  hello world
  <box>my name is <s font-color="#ddd">jake</s> chipmunk</box>
</box>
`;

const result1 = parseElem(input, CURSOR);
const result2 = parseElem("<box>hello <b></b><u></u>world</box>", CURSOR);
console.log(JSON.stringify(result1, null, 2));
