import { clone, freeze } from "./utils.ts";
import { TagName } from './markup.ts'

const BORDER_MAP: Record<BorderKey, BorderValue> = freeze({
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

type BorderKey =
  | "thin"
  | "solid"
  | "double"
  | "shaded"
  | "transparent"
  | "none";

interface BorderValue {
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

export interface Attributes {
  id: string;
  border: BorderValue;
}

const BASE_ATTRIBUTES: Attributes = freeze({
  id: "",
  border: BORDER_MAP.solid,
});

export function normalizeAttrs(tag: TagName, attrs: [string, string][]): Attributes {
  return attrs.reduce((attrs, [key, value]) => {
    if (key === "border" && value in BORDER_MAP) {
      const border = BORDER_MAP[value as BorderKey];
      return Object.assign(attrs, { border });
    }
    if (tag === TagName.Box) {
      return Object.assign(attrs, { border: BORDER_MAP.solid });
    }
    return attrs;
  }, clone(BASE_ATTRIBUTES));
}
