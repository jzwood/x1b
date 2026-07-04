import { assertEquals } from "@std/assert";
import { CURSOR } from "../../src/parser/index.ts";
import { parseML } from "../../src/markup.ts";
import { renderML } from "../../src/layout.ts";

let input: string = `<box>
    <box>hello</box><box>i am</box><box>sam</box><box>do you like green eggs</box><box>and ham?</box>
  </box>`;

let result = parseML(input, CURSOR);
if (result.ok) {
  let ml = result.value.result;
  console.log(renderML(ml, 45).content.join("\n"));
}

input = `<box>
  header:
  <b flow="auto" bg-color="#34eb0a">hello world</b>
  <box>my name is <s font-color="#ddd">jake</s></box>
  <box>I like <box>chipmunks</box></box>
</box>
`;

result = parseML(input, CURSOR);
if (result.ok) {
  let ml = result.value.result;
  console.log(renderML(ml, 40).content.join("\n"));
}

input = `<box>
hahah it really works
<box>very long no good dirty rotten input -- really quite too long</box>
<box>but also</box><box>is small</box>
</box>
`;

result = parseML(input, CURSOR);
if (result.ok) {
  let ml = result.value.result;
  console.log(renderML(ml, 20).content.join("\n"));
}
