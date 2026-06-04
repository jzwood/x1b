type Result<E, T> =
  | { ok: false; error: E }
  | { ok: true; value: T };

function test() : Result<number, string> {
  return {ok: true, value: "cat"}
}

function good2(a: string): Result<number, string> {
  return {ok: true, value: a}
}

function test2() : Result<number, string> {
  return good2("cats")
}
