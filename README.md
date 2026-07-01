# x1b TUI

A minimalist language agnostic TUI renderer

## how it works

- you write your TUI application in whatever language you want.
- you manage your application state however you want.
- to display your app write x1b markup to stdout and the x1b engine will handle
  rendering.
- to handle events like keypresses just listen to and read bytes from stdout.

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

### Distribute
```
deno compile --allow-env --allow-run main.ts
./x1b_deno node examples/fruit.js
```

### DEMO

```
deno run --allow-env --allow-run main.ts node snake.js
```
