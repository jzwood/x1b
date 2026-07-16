import { clone, freeze, hexToRGB, RGB } from "./utils.ts";
import { TagName } from "./markup.ts";

export const BORDER_MAP: Record<Border, BorderMeta> = freeze({
  "thin": {
    N: "─",
    NE: "┐",
    E: "│",
    SE: "┘",
    S: "─",
    SW: "└",
    W: "│",
    NW: "┌",
  },
  "solid": {
    N: "━",
    NE: "┓",
    E: "┃",
    SE: "┛",
    S: "━",
    SW: "┗",
    W: "┃",
    NW: "┏",
  },
  "transparent": {
    N: " ",
    NE: " ",
    E: " ",
    SE: " ",
    S: " ",
    SW: " ",
    W: " ",
    NW: " ",
  },
  "double": {
    N: "═",
    NE: "╗",
    E: "║",
    SE: "╝",
    S: "═",
    SW: "╚",
    W: "║",
    NW: "╔",
  },
  "shaded": {
    N: "░",
    NE: "░",
    E: "░",
    SE: "░",
    S: "░",
    SW: "░",
    W: "░",
    NW: "░",
  },
});

interface BorderMeta {
  N: string;
  NE: string;
  E: string;
  SE: string;
  S: string;
  SW: string;
  W: string;
  NW: string;
}

const BORDER: readonly string[] = [
  "thin",
  "solid",
  "double",
  "shaded",
  "transparent",
];
type Border = typeof BORDER[number];
const FLOW: readonly string[] = ["wrap", "column"];
type Flow = typeof FLOW[number];
const RGB_KEY: readonly string[] = ["border-color", "bg-color", "font-color"];
type RGBField = typeof RGB_KEY[number];

export interface Attributes {
  id: string;
  border: Border;
  flow: Flow;
  ["border-color"]: RGB | null;
  ["bg-color"]: RGB | null;
  ["font-color"]: RGB | null;
}

const BASE_ATTRIBUTES: Attributes = freeze({
  id: "",
  flow: "wrap",
  border: "solid",
  ["border-color"]: null,
  ["bg-color"]: null,
  ["font-color"]: null,
  ["max-width"]: null,
  ["max-height"]: null,
});

function isFlow(key: string, value: string): value is Flow {
  return key === "flow" && FLOW.includes(value);
}

function isBorder(key: string, value: string): value is Border {
  return key === "border" && BORDER.includes(value);
}

function isRgbKey(key: string): key is RGBField {
  return RGB_KEY.includes(key);
}

export function normalizeAttrs(
  tag: TagName,
  attrs: [string, string][],
): Attributes {
  return attrs.reduce((attrs, [key, value]) => {
    if (key === "id") {
      return Object.assign(attrs, { id: value });
    }
    if (isBorder(key, value)) {
      return Object.assign(attrs, { border: value });
    }
    if (tag === TagName.Box) {
      return Object.assign(attrs, { border: BORDER_MAP.solid });
    }
    if (isFlow(key, value)) {
      return Object.assign(attrs, { flow: value });
    }
    if (isRgbKey(key)) {
      const rgb = hexToRGB(value);
      return Object.assign(attrs, { [key]: rgb });
    }
    return attrs;
  }, clone(BASE_ATTRIBUTES));
}
