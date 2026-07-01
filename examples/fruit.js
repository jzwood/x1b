function repeat(n, c) {
  return Array(n).fill(c).join('');
}

function frame(tick) {
return `<box>
  BIG FRUIT SALE${repeat((tick % 3) + 1, '!')}
  <box>
    <box>Abiu</box>
    <box>Açaí</box>
    <box>Acerola</box>
    <box>Akebi</box>
    <box>Ackee</box>
    <box>African</box>
    <box>Cherry</box>
    <box>Orange</box>
    <box>Apple</box>
    <box>Apricot</box>
    <box>Aratiles</box>
    <box>Araza</box>
    <box>Avocado</box>
    <box>Banana</box>
    <box>Bilberry</box>
    <box>Blackberry</box>
    <box>Blackcurrant</box>
    <box>Black</box>
    <box>sapote</box>
    <box>Blueberry</box>
    <box>Boysenberry</box>
    <box>Breadfruit</box>
    <box>Buddha's</box>
    <box>hand</box>
    <box>(fingered</box>
    <box>citron)</box>
    <box>Cactus</box>
    <box>pear</box>
  </box>
  <box>Login</box>
  <box>Subscribe</box>
  <box>Mystery Box</box>
  <box>Cart</box>
</box>
`
}

let tick = 0
setInterval(() => {
  process.stdout.write(frame(tick++));
}, 500);
