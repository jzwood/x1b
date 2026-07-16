function repeat(n, c) {
  return Array(n).fill(c).join("");
}

function frame(tick) {
  return `<box>
  BIG FRUIT SALE${repeat((tick % 3) + 1, "!")}
  <box>
    <box border="transparent">Abiu</box>
    <box border="transparent">Açaí</box>
    <box border="transparent">Acerola</box>
    <box border="transparent">Akebi</box>
    <box border="transparent">Ackee</box>
    <box border="transparent">African</box>
    <box border="transparent">Cherry</box>
    <box border="transparent">Orange</box>
    <box border="transparent">Apple</box>
    <box border="transparent">Apricot</box>
    <box border="transparent">Aratiles</box>
    <box border="transparent">Araza</box>
    <box border="transparent">Avocado</box>
    <box border="transparent">Banana</box>
    <box border="transparent">Bilberry</box>
    <box border="transparent">Blackberry</box>
    <box border="transparent">Blackcurrant</box>
    <box border="transparent">Black</box>
    <box border="transparent">sapote</box>
    <box border="transparent">Blueberry</box>
    <box border="transparent">Boysenberry</box>
    <box border="transparent">Breadfruit</box>
    <box border="transparent">Buddha's</box>
    <box border="transparent">hand</box>
    <box border="transparent">(fingered</box>
    <box border="transparent">citron)</box>
    <box border="transparent">Cactus</box>
    <box border="transparent">pear</box>
  </box>
  <box>Login</box>
  <box>Subscribe</box>
  <box>Mystery Box</box>
  <box>Cart</box>
</box>
`;
}

let tick = 0;
setInterval(() => {
  process.stdout.write(frame(tick++));
}, 500);
