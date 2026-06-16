import * as Result from "./result.ts";

interface Cursor {
  line: number;
  col: number;
}

const CURSOR = Object.freeze({ line: 0, col: 0 });

type ParseOk<T> = { result: T; cursor: Cursor; remainder: string };
type ParseError = Cursor;
type Grapheme = string;
type ParseResult<T> = Result.Result<ParseError, ParseOk<T>>;
type Parser<T> = (
  input: string,
  cursor: Cursor,
) => ParseResult<T>;

function satisfy(predicate: (grapheme: Grapheme) => boolean): Parser<Grapheme> {
  return (input: string, cursor: Cursor) => {
    const result = input.at(0);
    if (result != null && predicate(result)) {
      const remainder = input.slice(1);
      const { line, col } = cursor;
      const ncursor = result === "\n"
        ? { line: line + 1, col }
        : { line, col: col + 1 };
      return Result.ok({ result, cursor: ncursor, remainder });
    }
    return Result.err(cursor);
  };
}

function map<A, B>(pa: Parser<A>, fn: (result: A) => B): Parser<B> {
  return (input: string, cursor: Cursor) =>
    Result.map(pa(input, cursor), (ok: ParseOk<A>): ParseOk<B> => ({
      result: fn(ok.result),
      cursor: ok.cursor,
      remainder: ok.remainder,
    }));
}

function bind<A, B>(pa: Parser<A>, apb: (a: A) => Parser<B>): Parser<B> {
  return (input: string, cursor: Cursor) =>
    Result.bind(
      pa(input, cursor),
      (ok) => apb(ok.result)(ok.remainder, ok.cursor),
    );
}

function pure<A>(result: A): Parser<A> {
  return (input: string, cursor: Cursor) =>
    Result.ok({ result, cursor, remainder: input });
}

function map2<A, B, C>(
  pa: Parser<A>,
  pb: Parser<B>,
  abc: (a: A, b: B) => C,
): Parser<C> {
  return bind(pa, (a) => bind(pb, (b) => pure(abc(a, b))));
}

function map3<A, B, C, D>(
  pa: Parser<A>,
  pb: Parser<B>,
  pc: Parser<C>,
  abcd: (a: A, b: B, c: C) => D,
): Parser<D> {
  return bind(pa, (a) => bind(pb, (b) => bind(pc, (c) => pure(abcd(a, b, c)))));
}

function left<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<A> {
  return map2(pa, pb, (a, _) => a);
}

function right<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<B> {
  return map2(pa, pb, (_, b) => b);
}

function or<A>(...pas: Parser<A>[]): Parser<A> {
  return (input: string, cursor: Cursor) => {
    const [p, ...ps] = pas;
    if (p == null) return Result.err(cursor);
    const result = p(input, cursor);
    return result.ok ? result : or(...ps)(input, cursor);
  };
}

function zeroOrMore<T>(p: Parser<T>): Parser<T[]> {
  return (input: string, cursor: Cursor) =>
    or(oneOrMore(p), pure([]))(input, cursor);
}

function oneOrMore<T>(p: Parser<T>): Parser<T[]> {
  return (input: string, cursor: Cursor) =>
    map2(p, zeroOrMore(p), (x: T, xs: T[]) => [x, ...xs])(input, cursor);
}

function zeroOrOne<T>(p: Parser<T>): Parser<T[]> {
  return or(map(p, Array.of.bind(Array)), pure([]));
}

function char(grapheme: Grapheme): Parser<Grapheme> {
  return satisfy((char) => char === grapheme);
}

function isDigit(grapheme: Grapheme): boolean {
  return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(grapheme);
}

function isWhitespace(grapheme: Grapheme): boolean {
  return [" ", "\t", "\n"].includes(grapheme);
}

const integer: Parser<number> = map(
  oneOrMore(satisfy(isDigit)),
  (xs) => parseInt(xs.join(""), 10),
);
const whitespace = zeroOrMore(satisfy(isWhitespace));

function isAlpha(grapheme: Grapheme): boolean {
  return (/^[a-zA-Z]$/).test(grapheme);
}
const alpha = satisfy(isAlpha);

function word(str: string): Parser<string> {
  return map(traverse(char, Array.from(str)), (chars) => chars.join(""));
}

function traverse<A, B>(apb: (x: B) => Parser<A>, xs: B[]): Parser<A[]> {
  return (input: string, cursor: Cursor) =>
    xs.reduceRight(
      (acc, x) => map2(apb(x), acc, (y: A, ys: A[]) => [y, ...ys]),
      pure<A[]>([]),
    )(input, cursor);
}

function sequence<T>(ps: Parser<T>[]): Parser<T[]> {
  return traverse((p) => p, ps);
}

console.log(word("CAT")("CATMAN", CURSOR));

function wrap<T>(l: string, p: Parser<T>, r: string): Parser<T> {
  return right(char(l), left(p, char(r)));
}

function trim<T>(p: Parser<T>): Parser<T> {
  return right(whitespace, left(p, whitespace));
}

function trimEnd<T>(p: Parser<T>): Parser<T> {
  return left(p, whitespace);
}

const parseIntArr: Parser<number[]> = wrap(
  "[",
  zeroOrMore(
    trim(
      or(
        left(
          trimEnd(integer),
          char(","),
        ),
        integer,
      ),
    ),
  ),
  "]",
);

console.log(
  parseIntArr(
    "[   1 ,  7 , 3 , 45, 231,   543,   1    ] HELLO THERE",
    CURSOR,
  ),
);

/*
{
  ok: true,
  value: {
    result: [ 1, 7, 3, 45, 231, 543, 1 ],
    cursor: { line: 0, col: 41 },
    remainder: " HELLO THERE"
  }
}
*/

//// char? str? string? idk types
//const paramName: Parser<char> = oneOrMore(char("-"),oneOrMore(satisfy(isAlphabet));

//const parseArg: Parser<idkman> = somethingHere(paramName, trim(integer));

//var input = "--somename 17"

interface TaggedInt {
  tag: string;
  value: number;
}

const white = map(oneOrMore(satisfy(isWhitespace)), (cs) => cs.join(""));
const spaceOrEqual = or(white, char("="));

function taggedInteger(tag: string): (val: number) => TaggedInt {
  return (value) => ({ tag, value });
}

function parseArg(flag: string): Parser<TaggedInt> {
  return trimEnd(right(
    word("--" + flag),
    right(spaceOrEqual, map(integer, taggedInteger(flag))),
  ));
}

const parseArgs = zeroOrMore(
  or(
    parseArg("somename"),
    parseArg("hello"),
    parseArg("my-flag"),
  ),
);

const input = "--hello=23    --hello=99 --my-flag   9   --somename  9000";

console.log(parseArgs(input, CURSOR));

//{
//ok: true,
//value: {
//result: [
//{ tag: "hello", value: 23 },
//{ tag: "hello", value: 99 },
//{ tag: "my-flag", value: 9 }
//],
//cursor: { line: 0, col: 34 },
//remainder: "somename 9000"
//}
//}
