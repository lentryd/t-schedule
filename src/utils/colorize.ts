const EVENT_COLORS = [
  {
    hex: "#959dd5",
    colorId: 1,
  },
  {
    hex: "#6ac594",
    colorId: 2,
  },
  {
    hex: "#a559b8",
    colorId: 3,
  },
  {
    hex: "#ed978e",
    colorId: 4,
  },
  {
    hex: "#fbcb62",
    colorId: 5,
  },
  {
    hex: "#fa7b50",
    colorId: 6,
  },
  {
    hex: "#66aee9",
    colorId: 7,
  },
  {
    hex: "#7e7e7e",
    colorId: 8,
  },
  {
    hex: "#6e71c2",
    colorId: 9,
  },
  {
    hex: "#509967",
    colorId: 10,
  },
  {
    hex: "#e3573a",
    colorId: 11,
  },
];
const SHORTHAND_REGEX = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;

type RGB = { r: number; g: number; b: number };

function distance(a: RGB, b: RGB) {
  return Math.sqrt(
    Math.pow(a.r - b.r, 2) + Math.pow(a.g - b.g, 2) + Math.pow(a.b - b.b, 2)
  );
}

function hexToRgb(hex: string): RGB {
  hex = hex.replace(SHORTHAND_REGEX, function (_: any, r: any, g: any, b: any) {
    return r + r + g + g + b + b;
  });
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  return {
    r: parseInt(result?.[1] ?? "0", 16),
    g: parseInt(result?.[2] ?? "0", 16),
    b: parseInt(result?.[3] ?? "0", 16),
  };
}

export default function nearestColor(colorHex: string) {
  let tmp = 0;
  let index = 0;
  let lowest = Number.POSITIVE_INFINITY;

  EVENT_COLORS.forEach((el, i) => {
    tmp = distance(hexToRgb(colorHex), hexToRgb(el.hex));
    if (tmp > lowest) return;

    index = i;
    lowest = tmp;
  });
  return EVENT_COLORS[index].colorId;
}
