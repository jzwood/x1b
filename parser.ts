type Result<E, T> =
  | { ok: false; error: E }
  | { ok: true; value: T };

interface Cursor {
  line: number;
  col: number;
}

type ParseResult<T> = { result: T; cursor: Cursor; remainder: string };
type ParseError = Cursor;

type Parser<T> = (
  cursor: Cursor,
  input: string,
) => Result<ParseError, ParseResult<T>>;

function bad(error: Cursor) {
  return { ok: false, error };
}

function good<T>(value: T) {
  return { ok: true, value };
}

function satisfy(p: (a: string) => boolean): Parser<string> {
  return (cursor: Cursor, input: string) => {
    const head = input.at(0);
    if (head != null) {
      return {
        ok: true,
        value: { result: head, cursor: cursor, remainder: input.slice(1) },
      };
    }
    return { ok: false, error: cursor };
  };
}
