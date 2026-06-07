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
function apply<A, B>(pa: Parser<A>, pab: Parser<(a: A) => B>): Parser<B> {
  return (cursor: Cursor, input: string) =>
    Result.bind(
      pab(cursor, input),
      (ok: ParseOk<(a: A) => B>): ParseResult<B> =>
        fmap(pa, ok.result)(ok.cursor, ok.remainder),
    );
}

// (<*) :: f a -> f b -> f a
function seqLeft<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<A> {
  return liftA2((a) => (_) => a, pa, pb);
}

// (*>) :: f a -> f b -> f b
//a1 *> a2 = (id <$ a1) <*> a2
function seqRight<A, B>(pa: Parser<A>, pb: Parser<B>): Parser<B> {
  return seqLeft(pb, pa);
}

// liftA2 :: (a -> b -> c) -> f a -> f b -> f c
function liftA2<A, B, C>(
  abc: (a: A) => (b: B) => C,
  pa: Parser<A>,
  pb: Parser<B>,
): Parser<C> {
  return apply(pb, fmap(pa, abc));
}

// IMPLEMENTS MONAD
// (>>=) :: m a -> (a -> m b) -> m b
function bind<A, B>(pa: Parser<A>, apb: (a: A) => Parser<B>): Parser<B> {
  return (cursor: Cursor, input: string) =>
    Result.bind(pa(cursor, input), (ok) => apb(ok.result)(cursor, input));
}
