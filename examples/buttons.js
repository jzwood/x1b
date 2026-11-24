function nextFrame(id) {
  const border = (option, id) => option === id ? "solid" : "thin";
  return `<box bg-color="#cccccc">
      <box bg-color="#00ff00">
        <box border="double" bg-color="#ff00ff">
          <box id="a" bg-color="#94bfbe" border="${border("a", id)}">OPTION A</box>
          <box> </box>
          <box id="b" bg-color="#61304b" border="${border("b", id)}">OPTION B</box>
        </box>
        <box> </box>
        <box id="c" bg-color="#acf7c1">OPTION C</box>
        <box id="d">
          <box>I AM <box id="hello">HELLO</box></box>
        </box>
        <box>
          123<cursor>QWERTY</cursor>456
        </box>
      </box>
      <box border="double" bg-color="#ff0000">
        <box border="solid" bg-color="#00ff00">
          <box border="thin" bg-color="#0000ff">INNER</box>
        </box>
      </box>
  </box>`;
}

process.stdout.write(nextFrame(""));
process.stdin.on("data", (chunk) => {
  const data = chunk.toString("ascii");
  const match = data.match(/CLICK:(\w+)/);
  if (match) {
    const [_, id] = match;
    const frame = nextFrame(id);
    process.stdout.write(frame);
  }
});
