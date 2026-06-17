import { assertEquals } from "@std/assert";
import * as P from './parser.ts'
import { Parser } from './parser.ts'
import { wrap, trim, trimEnd, integer, isWhitespace } from './parser_utils.ts'

Deno.test(function addTest() {
  assertEquals(
    P.word("CAT")("CATMAN", P.CURSOR), {ok: true, value: {result: '', cursor: {line: 0, col: 0}, remainder: ''}}
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

console.log(
  parseIntArr("[   1 ,  7 , 3 , 45, 231,   543,   1    ] HELLO THERE"));


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

const input = "--hello=23    --hello=99 --my-flag   9   --somename  9000";

console.log(parseArgs(input));

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

console.log(parseExpr()("(23 + ((1 * 3) / 9))"))
