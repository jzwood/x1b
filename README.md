# x1B

_pronounced_: chib

A minimalist language agnostic TUI library

## how it works

- you write your TUI application in whatever language you want.
- you manage your application state however you want.
- stdout.write x1b markup and the x1b engine handles rendering.
- read stdout for click, scroll, and key events

## x1b markup

Tags:

```
<box></box>
<i></i>
<u></u>
<b></b>
<s></s>
<cursor />
```

Global Attributes:

```
id="<alphanumeric>"

flow="wrap" | "column"
  default: *.flow="wrap"

border="thin" | "solid" | "shaded" | "none"
  default: box.border="thin"
  default: *.border="none"

border-color="<hex>"

bg-color="<hex>"

font-color="<hex>"
```

### examples

```
FRAME:<box>5:36</box>
FRAME:<box>5:35</box>
FRAME:<box>5:34</box>
```

### API

**incoming:**

```
KEY:<keycode>
CLICK:<element-id>
```

**outgoing:**

```
FRAME:<x1b-markup>
RAW:<string>
QUIT
```

### Distribute

```
deno compile --allow-env --allow-run --output=dist/x1b main.ts

./x1b node examples/fruit.js
```

### DEMO

```
deno run --allow-env --allow-run main.ts node snake.js
```
