const frame = (data) =>
  `${data}
     <box id="a">A</box>
     <box id="b">B</box>
     <box id="c">C</box>`;

process.stdin.on("data", (chunk) => {
  const data = chunk.toString("ascii");
  process.stdout.write(frame(data));
});
