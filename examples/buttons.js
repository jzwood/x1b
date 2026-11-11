function nextFrame(id) {
  const border = (option, id) => option === id ? 'solid' : 'thin'
  return `
  <box border="solid">
     <box id="a" border="${border('a', id)}">OPTION A</box>
     <box id="b" border="${border('b', id)}">OPTION B</box>
     <box id="c" border="${border('c', id)}">OPTION C</box>
     <box id="d" border="${border('d', id)}">
        I AM <box id="hello">HELLO</box>
     </box>
  </box>
  `;
}

process.stdout.write(nextFrame(''));
process.stdin.on("data", (chunk) => {
  const data = chunk.toString("ascii");
  const match = data.match(/CLICK:(\w+)/)
  if (match) {
    const [_, id] = match
    const frame = nextFrame(id)
    process.stdout.write(frame);
  }
});
