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
```

### examples

```
FRAME:<box>5:36</box>
FRAME:<box>5:35</box>
FRAME:<box>5:34</box>
```

## Config

```
{
    "theme": "dark" | "light" | "rainbow"
}
```
