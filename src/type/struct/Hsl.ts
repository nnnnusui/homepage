import { merge } from "~/fn/merge";
import { DeepPartial } from "~/type/DeepPartial";
import { Rgb } from "./Rgb";

/** @public */
export type Hsl = {
  hue: number;
  saturation: number;
  lightness: number;
};

/** @public */
export const Hsl = (() => {
  const init = (): Hsl => ({
    hue: 0,
    saturation: 0,
    lightness: 0,
  });
  const max = (): Hsl => ({
    hue: 360,
    saturation: 100,
    lightness: 100,
  });
  return {
    init,
    min: init,
    max,
    from: (
      partialOrVal: DeepPartial<Hsl> | number,
    ): Hsl => {
      return typeof partialOrVal === "object"
        ? merge(init(), partialOrVal)
        : {
          hue: partialOrVal,
          saturation: partialOrVal,
          lightness: partialOrVal,
        };
    },
    fromHsl: (
      hue: number,
      saturation: number,
      lightness: number,
    ): Hsl => {
      return {
        hue,
        saturation,
        lightness,
      };
    },
    getInversed: (hsl: Hsl, axis: (keyof Hsl)[]): Hsl => {
      return {
        hue: axis.includes("hue") ? max().hue - hsl.hue : hsl.hue,
        saturation: axis.includes("saturation") ? max().saturation - hsl.saturation : hsl.saturation,
        lightness: axis.includes("lightness") ? max().lightness - hsl.lightness : hsl.lightness,
      };
    },
    ...(() => { // Rgb compatibility
      const clamp = (value: number, min: number, max: number): number => {
        return Math.min(max, Math.max(min, value));
      };

      const normalizeHue = (hue: number): number => {
        return ((hue % 360) + 360) % 360;
      };

      return {
        fromRgb: (rgb: Rgb): Hsl => {
          const red = clamp(rgb.red, 0, 255) / 255;
          const green = clamp(rgb.green, 0, 255) / 255;
          const blue = clamp(rgb.blue, 0, 255) / 255;

          const maxVal = Math.max(red, green, blue);
          const minVal = Math.min(red, green, blue);
          const delta = maxVal - minVal;

          const lightness = (maxVal + minVal) / 2;
          if (delta === 0) {
            return {
              hue: 0,
              saturation: 0,
              lightness: lightness * 100,
            };
          }

          let hue = 0;
          if (maxVal === red) {
            hue = 60 * (((green - blue) / delta) % 6);
          } else if (maxVal === green) {
            hue = 60 * ((blue - red) / delta + 2);
          } else {
            hue = 60 * ((red - green) / delta + 4);
          }

          const saturation = delta / (1 - Math.abs(2 * lightness - 1));
          return {
            hue: normalizeHue(hue),
            saturation: saturation * 100,
            lightness: lightness * 100,
          };
        },
        toRgb: (hsl: Hsl): Rgb => {
          const hue = normalizeHue(hsl.hue);
          const saturation = clamp(hsl.saturation, 0, 100) / 100;
          const lightness = clamp(hsl.lightness, 0, 100) / 100;

          const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
          const huePrime = hue / 60;
          const x = chroma * (1 - Math.abs(huePrime % 2 - 1));

          let redPrime = 0;
          let greenPrime = 0;
          let bluePrime = 0;

          if (0 <= huePrime && huePrime < 1) {
            redPrime = chroma;
            greenPrime = x;
          } else if (1 <= huePrime && huePrime < 2) {
            redPrime = x;
            greenPrime = chroma;
          } else if (2 <= huePrime && huePrime < 3) {
            greenPrime = chroma;
            bluePrime = x;
          } else if (3 <= huePrime && huePrime < 4) {
            greenPrime = x;
            bluePrime = chroma;
          } else if (4 <= huePrime && huePrime < 5) {
            redPrime = x;
            bluePrime = chroma;
          } else {
            redPrime = chroma;
            bluePrime = x;
          }

          const match = lightness - chroma / 2;
          return {
            red: Math.round(clamp((redPrime + match) * 255, 0, 255)),
            green: Math.round(clamp((greenPrime + match) * 255, 0, 255)),
            blue: Math.round(clamp((bluePrime + match) * 255, 0, 255)),
          };
        },
      };
    })(),
  };
})();
