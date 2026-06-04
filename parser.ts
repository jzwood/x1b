type Result<E, T> =
  | { ok: false; error: E }
  | { ok: true; value: T };

interface Cursor {
  line: number;
  col: number;
}

type ParseOk<T> = { result: T; cursor: Cursor; remainder: string };
type ParseError = Cursor;

type ParseResult<T> = Result<ParseError, ParseOk<T>>;
type Parser<T> = (
  cursor: Cursor,
  input: string,
) => ParseResult<T>;

function err<T>(error: Cursor): ParseResult<T> {
  return { ok: false, error };
}

function ok<T>(value: ParseOk<T>): ParseResult<T> {
  return { ok: true, value };
}

function satisfy(p: (a: string) => boolean): Parser<string> {
  return (cursor: Cursor, input: string) => {
    const head = input.at(0);
    if (head != null) {
      return ok({ result: head, cursor: cursor, remainder: input.slice(1) });
    }
    return err(cursor);
  };
}
