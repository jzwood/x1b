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

const BORDER = [
  "thin",
  "solid",
  "double",
  "shaded",
  "transparent",
] as const;
type Border = typeof BORDER[number];
const FLOW = ["wrap", "column"] as const;
type Flow = typeof FLOW[number];
const RGB_KEY = ["border-color", "bg-color", "font-color"] as const;
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
  return key === "flow" && FLOW.includes(value as Flow);
}

function isBorder(key: string, value: string): value is Border {
  return key === "border" && BORDER.includes(value as Border);
}

function isRgbKey(key: string): key is RGBField {
  return RGB_KEY.includes(key as RGBField);
}

export function normalizeAttrs(
  tag: TagName,
  attrs: [string, string][],
): Attributes {
  return attrs.reduce((attrs, [key, value]) => {
    if (key === "id") {
      attrs.id = value;
    } else if (isBorder(key, value)) {
      attrs.border = value;
      return attrs;
    } else if (tag === TagName.Box) {
      attrs.border = "solid";
    } else if (isFlow(key, value)) {
      attrs.flow = value;
    } else if (isRgbKey(key)) {
      attrs[key] = hexToRGB(value);
    }
    return attrs;
  }, clone(BASE_ATTRIBUTES));
}
