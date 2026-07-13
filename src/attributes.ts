import { clone, freeze, RGB, hexToRGB } from "./utils.ts";
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
    padding: 2,
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
    padding: 2,
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
    padding: 2,
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
    padding: 2,
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
    padding: 2,
  },
  "none": {
    N: "",
    NE: "",
    E: "",
    SE: "",
    S: "",
    SW: "",
    W: "",
    NW: "",
    padding: 0,
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
  padding: number;
}

const BORDER: readonly string[] = [
  "thin",
  "solid",
  "double",
  "shaded",
  "transparent",
  "none",
];
type Border = typeof BORDER[number];
const FLOW: readonly string[] = ["wrap", "column"];
type Flow = typeof FLOW[number];

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
});

function isFlow(key: string, value: string): value is Flow {
  return key === "flow" && FLOW.includes(value);
}

function isBorder(key: string, value: string): value is Border {
  return key === "border" && BORDER.includes(value);
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
      const border = BORDER_MAP[value];
      return Object.assign(attrs, { border });
    }
    if (tag === TagName.Box) {
      return Object.assign(attrs, { border: BORDER_MAP.solid });
    }
    if (isFlow(key, value)) {
      return Object.assign(attrs, { flow: value });
    }
    if (key in BASE_ATTRIBUTES && key.endsWith("-color")) {
      const rgb = hexToRGB(value);
      return Object.assign(attrs, { [key]: rgb });
    }
    return attrs;
  }, clone(BASE_ATTRIBUTES));
}
