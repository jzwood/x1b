# x1b TUI

A minimalist language agnostic TUI renderer

## how it works

- you write your TUI application in whatever language you want.
- you manage your application state however you want.
- to display your app write x1b markup to stdout and the x1b engine will handle rendering.
- to handle events like keypresses just listen to and read bytes from stdout.


## x1b markup

Tags:

```
<box></box>
<i></i>
<u></u>
<b></b>
<s></s>
<pre></pre>
<cursor />
```

Global Attributes:

```
flow="auto" | "row" | "column"
default: flow="auto"

border="solid" | "none"
default: border="solid"

border-color="<hex>"
default: border-color="#4f2b84"

bg-color="<hex>"
default: bg-color="#16191F"

font-color="<hex>"
default: font-color="#D9D9D9"
```

### examples

```
FRAME:<box>5:36</box>
FRAME:<box>5:35</box>
FRAME:<box>5:34</box>
```
