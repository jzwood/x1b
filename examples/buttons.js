const frame = (data) =>
  `
  <box border="shaded">
     <box id="a">A</box>
     <box id="b">B</box>
     <box id="c">C</box>
     <box id="d">
        I AM <box id="hello">HELLO</box>
     </box>
    </box>
  `;

process.stdin.on("data", (chunk) => {
  const data = chunk.toString("ascii");
  process.stdout.write(frame(data));
});
