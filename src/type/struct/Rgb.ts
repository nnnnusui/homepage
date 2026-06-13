import { merge } from "~/fn/merge";
import { DeepPartial } from "~/type/DeepPartial";

/** @public */
export type Rgb = {
  red: number;
  green: number;
  blue: number;
};

/** @public */
export const Rgb = (() => {

  const init = (): Rgb => ({
    red: 0,
    green: 0,
    blue: 0,
  });

  const max = (): Rgb => ({
    red: 255,
    green: 255,
    blue: 255,
  });

  return {
    init,
    min: init,
    max,
    from: (partialOrVal: DeepPartial<Rgb> | number): Rgb => {
      return typeof partialOrVal === "object"
        ? merge(init(), partialOrVal)
        : {
          red: partialOrVal,
          green: partialOrVal,
          blue: partialOrVal,
        };
    },
    fromRgb: (red: number, green: number, blue: number): Rgb => {
      return {
        red,
        green,
        blue,
      };
    },
    ...(() => { // Hex strings compatibility
      const clampByte = (value: number): number => {
        return Math.min(255, Math.max(0, Math.round(value)));
      };

      const byteToHex = (value: number): string => {
        return clampByte(value)
          .toString(16)
          .padStart(2, "0");
      };

      return {
        fromRgbHexStr: (hex: string): Rgb => {
          const normalized = hex.trim().replace(/^#/, "");
          if (!/^[0-9a-fA-F]{3}$|^[0-9a-fA-F]{6}$/.test(normalized)) {
            return init();
          }

          const expanded = normalized.length === 3
            ? normalized
              .split("")
              .map((char) => `${char}${char}`)
              .join("")
            : normalized;

          return {
            red: parseInt(expanded.slice(0, 2), 16),
            green: parseInt(expanded.slice(2, 4), 16),
            blue: parseInt(expanded.slice(4, 6), 16),
          };
        },
        toRgbHexStr: (rgb: Rgb): string => {
          return `#${byteToHex(rgb.red)}${byteToHex(rgb.green)}${byteToHex(rgb.blue)}`;
        },
      };
    })(),
  };
})();
