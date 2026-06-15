import * as Result from "./result.ts";

interface Cursor {
  line: number;
  col: number;
}

const CURSOR = Object.freeze({ line: 0, col: 0 });

type ParseOk<T> = { result: T; cursor: Cursor; remainder: string };
type ParseError = Cursor;
type Grapheme = string
type ParseResult<T> = Result.Result<ParseError, ParseOk<T>>;
// TODO switch order or arguments and make cursor have default value
type Parser<T> = (
  input: string,
  cursor: Cursor,
) => ParseResult<T>;

function satisfy(p: (a: Grapheme) => boolean): Parser<Grapheme> {
  return (input: string, c: Cursor) => {
    const result = input.at(0);
    if (result != null && p(result)) {
      const remainder = input.slice(1);
      const { line, col } = c;
      const cursor = result === "\n"
        ? { line: line + 1, col }
        : { line, col: col + 1 };
      return Result.ok({ result, cursor, remainder });
    }
    return Result.err(c);
  };
}

// IMPLEMENTS FUNCTOR
// (<$>) :: f a -> (a -> b) -> f b
function map<A, B>(parse: Parser<A>, fn: (result: A) => B): Parser<B> {
  return (input: string, cursor: Cursor) =>
    Result.map(parse(input, cursor), (ok: ParseOk<A>): ParseOk<B> => ({
      result: fn(ok.result),
      cursor: ok.cursor,
      remainder: ok.remainder,
    }));
}

// IMPLEMENTS APPLICATIVE FUNCTOR
// pure :: a -> f a
function pure<T>(result: T): Parser<T> {
  return (input: string, cursor: Cursor) =>
    Result.ok({ result, cursor, remainder: input });
}

// map2 :: (a -> b -> c) -> f a -> f b -> f c
function map2<A, B, C>(
  pa: Parser<A>,
  pb: Parser<B>,
  abc: (a: A, b: B) => C
): Parser<C> {
  return bind(pa, (a) => bind(pb, (b) => pure(abc(a, b))));
}

// IMPLEMENTS MONAD
// (>>=) :: m a -> (a -> m b) -> m b
function bind<A, B>(pa: Parser<A>, apb: (a: A) => Parser<B>): Parser<B> {
  return (input: string, cursor: Cursor) =>
    Result.bind(
      pa(input, cursor),
      (ok) => apb(ok.result)(ok.remainder, ok.cursor),
    );
}

// (<*) :: f a -> f b -> f a
function left<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<A> {
  return map2(pa, pb, (a, _) => a);
}

// (>>) :: f a -> f b -> f b
function right<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<B> {
  return bind(pa, (_) => pb);
}

function or<A>(...ps: Parser<A>[]): Parser<A> {
  return (input: string, cursor: Cursor) => {
    const [p1, ...p2s] = ps;
    if (p1 == null) return Result.err(cursor);
    const result = p1(input, cursor);
    if (result.ok) {
      return result;
    }
    const parser = or(...p2s);
    return parser(input, cursor);
  };
}

// CORE UTILS
function zeroOrMore<T>(p: Parser<T>): Parser<T[]> {
  return (i: string, c: Cursor) => {
    const parser = or(oneOrMore(p), pure([]));
    return parser(i, c);
  };
}

function oneOrMore<T>(p: Parser<T>): Parser<T[]> {
  return (i: string, c: Cursor) => {
    const parser = map2(p, zeroOrMore(p), (x: T, xs: T[]) => [x, ...xs]);
    return parser(i, c);
  };
}

function zeroOrOne<T>(p: Parser<T>): Parser<T[]> {
  return or(map(p, Array.of.bind(Array)), pure([]));
}

// EXTRA UTILS
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
  return (/[a-zA-Z]/).test(grapheme);
}
const alpha = satisfy(isAlpha);

function word(str: string): Parser<string> {
  return map(traverse(char, Array.from(str)), (cs) => cs.join(""));
}

function traverse<A, B>(apb: (chr: B) => Parser<A>, chrs: B[]): Parser<A[]> {
  return (i: string, c: Cursor) =>
    chrs.reduceRight(
      (acc, chr) => map2(apb(chr), acc, (x: A, xs: A[]) => [x, ...xs]),
      pure<A[]>([]),
    )(i, c);
}

function sequence<T>(ts: Parser<T>[]): Parser<T[]> {
  return traverse((x) => x, ts);
}

//console.log(word("CAT")("CATMAN", CURSOR));

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

//console.log(
//parseIntArr(
//CURSOR,
//"[   1 ,  7 , 3 , 45, 231,   543,   1    ] HELLO THERE",
//),
//);

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
