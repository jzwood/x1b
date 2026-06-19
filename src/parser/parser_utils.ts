import * as P from "./parser.ts";
import { Parser } from "./parser.ts";

// USEFUL UTILS BUT NOTHING A USER COULDN'T MAKE THEMSELVES

export function isDigit(grapheme: P.Grapheme): boolean {
  return /^\d$/.test(grapheme);
}

export function isWhitespace(grapheme: P.Grapheme): boolean {
  return [" ", "\t", "\n"].includes(grapheme);
}

export const integer: Parser<number> = P.map(
  P.oneOrMore(P.satisfy(isDigit)),
  (xs) => parseInt(xs.join(""), 10),
);

export const whitespace = P.zeroOrMore(P.satisfy(isWhitespace));

export function isAlpha(grapheme: P.Grapheme): boolean {
  return (/^[a-zA-Z]$/).test(grapheme);
}
export const alpha = P.satisfy(isAlpha);

export function wrap<T>(l: string, p: Parser<T>, r: string): Parser<T> {
  return P.right(P.char(l), P.left(p, P.char(r)));
}

export function trim<T>(p: Parser<T>): Parser<T> {
  return P.right(whitespace, P.left(p, whitespace));
}

export function trimEnd<T>(p: Parser<T>): Parser<T> {
  return P.left(p, whitespace);
}
