import {
  CURSOR,
  Cursor,
  left,
  map,
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
} from "./parser/index.ts";
import { Attributes, normalizeAttrs } from "./attributes.ts";

export enum TagName {
  Box = "box",
  Italics = "i",
  Underline = "u",
  Bold = "b",
  Strike = "s",
  Cursor = "cursor",
}

export interface Element {
  tag: TagName;
  attrs: Attributes;
  children: TML;
}

export type Node = string | Element;
export type TML = Node[];

const parseAttrKey: Parser<string> = wordBy((grapheme) =>
  (/^[a-z-]$/).test(grapheme)
);
const parseAttrValue: Parser<string> = wordBy((grapheme) =>
  (/^[a-z0-9#-]$/).test(grapheme)
);
const parseAttribute: Parser<[string, string]> = map2(
  right(someWhitespace, parseAttrKey),
  wrap('="', parseAttrValue, '"'),
  (key, value) => [key, value],
);

function parseCustomElem(tag: TagName): Parser<Element> {
  return (input: string, cursor: Cursor = CURSOR) => {
    const parseTag = word(tag);
    const parseOpen: Parser<[string, string][]> = wrap(
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
      (attrs, children): Element => (
        {
          tag,
          attrs: normalizeAttrs(tag, attrs),
          children,
        }
      ),
    );
    return parser(input, cursor);
  };
}

const parseText: Parser<string> = map(
  wordBy((c) => c !== "<"),
  (word) => word.trim(),
);
const parseElem: Parser<Element> = oneOf(
  ...Object.values(TagName).map(parseCustomElem),
);
export const parseML: Parser<TML> = zeroOrMore(
  oneOf<Node>(parseElem, parseText),
);
