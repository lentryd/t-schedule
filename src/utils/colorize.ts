import chroma from "chroma-js";

// Массив цветов для событий
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

// Коэффициенты для формулы CIE94
const kL = 1;
const kC = 1;
const kH = 1;
const k1 = 0.045;
const k2 = 0.015;

// Тип для LCH цвета
type LCH = { l: number; c: number; h: number };

/**
 * Конвертирует HEX цвет в LCH
 * @param hex HEX цвет
 * @returns LCH цвет
 */
function hexToLch(hex: string): LCH {
  const lchColor = chroma(hex).lch();
  return { l: lchColor[0] || 0, c: lchColor[1] || 0, h: lchColor[2] || 0 };
}

/**
 * Конвертирует строку в HEX
 * @param str Строка
 * @returns HEX цвет
 */
function stringToHex(str: string) {
  // Получаем цвет и его настройки яркости
  const colorStr = str.split(" ")[0] || "";
  const lightness = str.split(" ")[1] || "";

  // Если цвет не найден, возвращаем зеленый цвет
  if (!chroma.valid(colorStr)) return "#669933";

  // Получаем цвет
  const color = chroma(colorStr);
  // Если надо, то затемняем цвет
  if (lightness.startsWith("darken-"))
    color.darken(parseInt(lightness.split("-")[1]));
  // Если надо, то осветляем цвет
  if (lightness.startsWith("brighten-"))
    color.brighten(parseInt(lightness.split("-")[1]));

  return color.hex();
}

/**
 * Вычисляет разницу между двумя цветами по формуле CIE94
 * @param color1 Первый цвет
 * @param color2 Второй цвет
 * @returns Разница между цветами
 */
function cie94(color1: LCH, color2: LCH) {
  // Вычисляем разницу по яркости (Lightness)
  let deltaL = color1.l - color2.l;

  // Вычисляем разницу по насыщенности (Chroma)
  let deltaC =
    Math.sqrt(color1.c * color1.c + color1.h * color1.h) -
    Math.sqrt(color2.c * color2.c + color2.h * color2.h);

  // Вычисляем разницу по оттенку (Hue)
  let deltaH = Math.sqrt(
    (color1.c - color2.c) * (color1.c - color2.c) +
      (color1.h - color2.h) * (color1.h - color2.h) -
      deltaC * deltaC
  );

  // Вычисляем общую формулу CIE94
  let deltaE = Math.sqrt(
    (deltaL / (kL * k1)) * (deltaL / (kL * k1)) +
      (deltaC / (kC * k2)) * (deltaC / (kC * k2)) +
      (deltaH / (kH * k2)) * (deltaH / (kH * k2))
  );

  return deltaE;
}

/**
 * Находит ближайший цвет из массива EVENT_COLORS к исходному цвету
 * @param color Исходный цвет (в формате HEX и словами)
 * @returns ID ближайшего цвета
 */
export default function nearestColor(color: string) {
  // Если цвет не начинается с #, конвертируем его в HEX
  if (!color.startsWith("#")) color = stringToHex(color);

  // Конвертируем исходный цвет в HSL объект
  let sourceLab = hexToLch(color);

  // Инициализируем переменные для хранения наименьшей разницы и соответствующего цвета
  let minDifference = Infinity;
  let closestColorId = 0;

  // Проходим по всем цветам в массиве и сравниваем их с исходным цветом по оттенку
  for (let i = 0; i < EVENT_COLORS.length; i++) {
    // Конвертируем текущий цвет из массива в HSL объект
    let currentLab = hexToLch(EVENT_COLORS[i].hex);

    // Вычисляем разницу между оттенками
    let difference = cie94(sourceLab, currentLab);

    // Если текущая разница меньше минимальной, обновляем минимальную разницу и цвет
    if (difference < minDifference) {
      minDifference = difference;
      closestColorId = EVENT_COLORS[i].colorId;
    }
  }

  return closestColorId;
}
