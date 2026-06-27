import { assertEquals } from "@std/assert";
import { CURSOR } from "../../src/parser/index.ts";
import { parseML } from "../../src/x1b/markup.ts";

//Deno.test(function wordTest() {});
const input: string = `<box>
  <b flow="auto" bg-color="#34eb0a">header</b>
  hello world
  <box>my name is <s font-color="#ddd">jake</s> chipmunk</box>
</box>
`;

const result1 = parseML(input, CURSOR);
const result2 = parseML("<box>hello <b></b><u></u>world</box>", CURSOR);
const result3 = parseML(
  `<box border="solid">
  hello <b font-color="#ffff00">outside</b>!
  Look ma, no <u>hands</u>.
</box>
`,
  CURSOR,
);
console.log(JSON.stringify(result1, null, 2));
console.log(JSON.stringify(result2, null, 2));
console.log(JSON.stringify(result3));
