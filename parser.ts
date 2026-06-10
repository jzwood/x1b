import * as Result from "./result.ts";

interface Cursor {
  line: number;
  col: number;
}

const CUR_INIT = Object.freeze({ line: 0, col: 0 });

type ParseOk<T> = { result: T; cursor: Cursor; remainder: string };
type ParseError = Cursor;
type ParseResult<T> = Result.Result<ParseError, ParseOk<T>>;
// TODO switch order or arguments and make cursor have default value
type Parser<T> = (
  cursor: Cursor,
  input: string,
) => ParseResult<T>;

function satisfy(p: (a: string) => boolean): Parser<string> {
  return (c: Cursor, input: string) => {
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
function fmap<A, B>(parse: Parser<A>, fn: (result: A) => B): Parser<B> {
  return (cursor: Cursor, input: string) =>
    Result.fmap(parse(cursor, input), (ok: ParseOk<A>): ParseOk<B> => ({
      result: fn(ok.result),
      cursor: ok.cursor,
      remainder: ok.remainder,
    }));
}

// IMPLEMENTS APPLICATIVE FUNCTOR
// pure :: a -> f a
function pure<T>(result: T): Parser<T> {
  return (cursor: Cursor, input: string) =>
    Result.ok({ result, cursor, remainder: input });
}

// (<*>) :: f (a -> b) -> f a -> f b
function ap<A, B>(pa: Parser<A>, pab: Parser<(a: A) => B>): Parser<B> {
  return (cursor: Cursor, input: string) =>
    Result.bind(
      pab(cursor, input),
      (ok: ParseOk<(a: A) => B>): ParseResult<B> =>
        fmap(pa, ok.result)(ok.cursor, ok.remainder),
    );
}

// liftA2 :: (a -> b -> c) -> f a -> f b -> f c
function liftA2<A, B, C>(
  abc: (a: A) => (b: B) => C,
  pa: Parser<A>,
  pb: Parser<B>,
): Parser<C> {
  return ap(pb, fmap(pa, abc));
}

// IMPLEMENTS MONAD
// (>>=) :: m a -> (a -> m b) -> m b
function bind<A, B>(pa: Parser<A>, apb: (a: A) => Parser<B>): Parser<B> {
  return (cursor: Cursor, input: string) =>
    Result.bind(
      pa(cursor, input),
      (ok) => apb(ok.result)(ok.cursor, ok.remainder),
    );
}

// (<*) :: f a -> f b -> f a
function left<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<A> {
  return liftA2((a) => (_) => a, pa, pb);
}

// (>>) :: f a -> f b -> f b
function right<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<B> {
  return bind(pa, (_) => pb);
}

// IMPLEMENTS ALTERATIVE
// empty :: Parser<T>
function empty<T>(cursor: Cursor, _: string): Result.Result<ParseError, T> {
  return Result.err(cursor);
}

// (<|>) :: f a -> f a -> f a
function alt<A>(pa1: Parser<A>, pa2: Parser<A>): Parser<A> {
  return (cursor: Cursor, input: string) => {
    const result = pa1(cursor, input);
    return result.ok ? result : pa2(cursor, input);
  };
}

// CORE UTILS
function zeroOrMore<T>(p: Parser<T>): Parser<T[]> {
  return (c: Cursor, i: string) => {
    const parser = alt(oneOrMore(p), pure([]));
    return parser(c, i);
  };
}

function oneOrMore<T>(p: Parser<T>): Parser<T[]> {
  return (c: Cursor, i: string) => {
    const parser = liftA2((x: T) => (xs: T[]) => [x, ...xs], p, zeroOrMore(p));
    return parser(c, i);
  };
}

function zeroOrOne<T>(p: Parser<T>): Parser<T[]> {
  return alt(fmap(p, Array.of.bind(Array)), pure([]));
}

// EXTRA UTILS
function char(grapheme: string): Parser<string> {
  return satisfy((char) => char === grapheme);
}

function isDigit(grapheme: string): boolean {
  return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(grapheme);
}

function isWhitespace(grapheme: string): boolean {
  return [" ", "\t", "\n"].includes(grapheme);
}

const integer: Parser<number> = fmap(
  oneOrMore(satisfy(isDigit)),
  (xs) => parseInt(xs.join(""), 10),
);
const whitespace = zeroOrMore(satisfy(isWhitespace));

function isAlpha(grapheme: string): boolean {
  return (/[a-zA-Z]/).test(grapheme);
}
const alpha = satisfy(isAlpha);

function word(str: string): Parser<string> {
  return fmap(traverse(char, Array.from(str)), (cs) => cs.join(""));
}

function traverse<A, B>(apb: (chr: B) => Parser<A>, chrs: B[]): Parser<A[]> {
  return (c: Cursor, i: string) =>
    chrs.reduceRight(
      (acc, chr) => liftA2((x: A) => (xs: A[]) => [x, ...xs], apb(chr), acc),
      pure<A[]>([]),
    )(c, i);
}

function sequence<T>(ts: Parser<T>[]): Parser<T[]> {
  return traverse((x) => x, ts);
}

//console.log(word("CAT")(CUR_INIT, "CATMAN"));

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
      alt(
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
//CUR_INIT,
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

const spaceOrEqual = alt(char(" "), char("="));
function taggedInteger(tag: string): (val: number) => TaggedInt {
  return (value) => ({ tag, value });
}
function parseArg(flag: string): Parser<TaggedInt> {
  return trimEnd(right(
    word('--' + flag),
    right(spaceOrEqual, fmap(integer, taggedInteger(flag))),
  ));
}

const parseArgs = zeroOrMore(
  alt(parseArg("somename"), alt(parseArg("hello"), parseArg("my-flag"))),
);

const input = "--hello=23 --hello=99 --my-flag 9 --somename 9000";

console.log(parseArgs(CUR_INIT, input));

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
