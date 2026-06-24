import { assertEquals } from "@std/assert";
import * as P from "../../src/parser/parser.ts";
import { Parser } from "../../src/parser/parser.ts";
import {
  integer,
  isWhitespace,
  trim,
  trimEnd,
  wrap,
} from "../../src/parser/parser_utils.ts";

Deno.test(function wordTest() {
  assertEquals(
    P.word("CAT")("CATMAN", P.CURSOR),
    {
      ok: true,
      value: { result: "CAT", remainder: "MAN", cursor: { row: 0, col: 3, total: 3 } },
    },
  );
});

const parseIntArr: Parser<number[]> = wrap(
  "[",
  P.zeroOrMore(
    trim(
      P.oneOf(
        P.left(
          trimEnd(integer),
          P.char(","),
        ),
        integer,
      ),
    ),
  ),
  "]",
);

Deno.test(function parseIntArrTest() {
  assertEquals(
    parseIntArr(
      "[   1 ,  7 , 3 , 45, 231,   543,   1    ] HELLO THERE",
      P.CURSOR,
    ),
    {
      ok: true,
      value: {
        result: [
          1,
          7,
          3,
          45,
          231,
          543,
          1,
        ],
        cursor: { row: 0, col: 41, total: 41 },
        remainder: " HELLO THERE",
      },
    },
  );
});

interface TaggedInt {
  tag: string;
  value: number;
}

const white = P.map(P.oneOrMore(P.satisfy(isWhitespace)), (cs) => cs.join(""));
const spaceOrEqual = P.oneOf(white, P.char("="));

function taggedInteger(tag: string): (val: number) => TaggedInt {
  return (value) => ({ tag, value });
}

function parseArg(flag: string): Parser<TaggedInt> {
  return trimEnd(P.right(
    P.word("--" + flag),
    P.right(spaceOrEqual, P.map(integer, taggedInteger(flag))),
  ));
}

const parseArgs = P.zeroOrMore(
  P.oneOf(
    parseArg("somename"),
    parseArg("hello"),
    parseArg("my-flag"),
  ),
);

Deno.test(function parseArgsTest() {
  assertEquals(
    parseArgs(
      "--hello=23    --hello=99 --my-flag   9   --somename  9000",
      P.CURSOR,
    ),
    {
      ok: true,
      value: {
        result: [
          { tag: "hello", value: 23 },
          { tag: "hello", value: 99 },
          { tag: "my-flag", value: 9 },
          { tag: "somename", value: 9000 },
        ],
        cursor: { row: 0, col: 57, total: 57 },
        remainder: "",
      },
    },
  );
});

enum Operator {
  Plus,
  Minus,
  Multiply,
  Divide,
}
interface Arithmetic {
  operator: Operator;
  left: Expr;
  right: Expr;
}

type Expr = number | Arithmetic;

const parseOperator: Parser<Operator> = P.oneOf(
  P.map(P.char("+"), () => Operator.Plus),
  P.map(P.char("-"), () => Operator.Minus),
  P.map(P.char("*"), () => Operator.Multiply),
  P.map(P.char("/"), () => Operator.Divide),
);
function parseExpr(): Parser<Expr> {
  return (input: string, cursor: P.Cursor = P.CURSOR) =>
    P.oneOf<Expr>(
      integer,
      wrap(
        "(",
        P.map3(
          parseExpr(),
          trim(parseOperator),
          parseExpr(),
          (left, operator, right) => ({ left, operator, right }),
        ),
        ")",
      ),
    )(input, cursor);
}

Deno.test(function parseExprTest() {
  assertEquals(parseExpr()("(23 + ((1 * 3) / 9))", P.CURSOR), {
    ok: true,
    value: {
      result: {
        left: 23,
        operator: 0,
        right: {
          left: { left: 1, operator: 2, right: 3 },
          operator: 3,
          right: 9,
        },
      },
      cursor: { row: 0, col: 20, total: 20 },
      remainder: "",
    },
  });
});
