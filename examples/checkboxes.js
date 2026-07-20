const frame = (data) =>
  `${data}
     <box id="a">A</box>
     <box id="b">B</box>
     <box id="c">C</box>
     <box border="shaded"> this is a test \x1b[41m IS THIS RED?\x1b[0m I hope so</box>
    `;

process.stdin.on("data", (chunk) => {
  const data = chunk.toString("ascii");
  process.stdout.write(frame(data));
});
