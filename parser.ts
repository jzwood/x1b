import * as Result from "./result.ts";

interface Cursor {
  line: number;
  col: number;
}

type ParseOk<T> = { result: T; cursor: Cursor; remainder: string };
type ParseError = Cursor;
type ParseResult<T> = Result.Result<ParseError, ParseOk<T>>;
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
function fmap<A, B>(parse: Parser<A>, fn: (result: A) => B): Parser<B> {
  const transform = (ok: ParseOk<A>): ParseOk<B> => ({
    result: fn(ok.result),
    cursor: ok.cursor,
    remainder: ok.remainder,
  });
  return (cursor: Cursor, input: string) =>
    Result.fmap(parse(cursor, input), transform);
}

// IMPLEMENTS APPLICATIVE FUNCTOR
function pure<T>(result: T): Parser<T> {
  return (cursor: Cursor, input: string) =>
    Result.ok({ result, cursor, remainder: input });
}

function apply<A, B>(pab: Parser<(a: A) => B>, pa: Parser<A>): Parser<B> {
  const ap = (ok: ParseOk<(a: A) => B>): ParseResult<B> => {
    const pb = fmap(pa, ok.result);
    return pb(ok.cursor, ok.remainder);
  };
  return (cursor: Cursor, input: string) => Result.bind(pab(cursor, input), ap);
}

function seqRight() {
}

function seqLeft() {
}

function liftA2() {}
