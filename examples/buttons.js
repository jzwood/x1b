function nextFrame(id) {
  const border = (option, id) => option === id ? "solid" : "thin";
  return `
  <box border="solid">
      <trim id="a" bg-color="#94bfbe" border="${
    border("a", id)
  }">OPTION A</trim>
      <trim id="b" bg-color="#61304b" border="${
    border("b", id)
  }">OPTION B</trim>
      <trim id="c" bg-color="#acf7c1" border="${
    border("c", id)
  }">OPTION C</trim>
    <box id="d" border="${border("d", id)}">
      <trim>I AM <box id="hello">HELLO</box></trim>
    </box>
    <box>
      123<cursor>QWERTY</cursor>456
      </box>
      <box border="double" bg-color="#ff0000">
        <trim border="solid" bg-color="#00ff00">
          <trim border="thin" bg-color="#0000ff">INNER</trim>
        </trim>
      </box>
  </box>
  `;
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
