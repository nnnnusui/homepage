import { describe, it, expect } from "vitest";

import { Hsl } from "./Hsl";
import { Rgb } from "./Rgb";

describe("Hsl", async () => {
  it("rgb compat", async () => {
    const rgb = Rgb.from({ red: 24, green: 24, blue: 24 });
    const hsl = Hsl.fromRgb(rgb);
    const afterRgb = Hsl.toRgb(hsl);
    expect(afterRgb).toStrictEqual(rgb);
  });
  it("modifiable", async () => {
    const beforeHsl = Hsl.fromHsl(0, 10, 0);
    const afterHsl1 = Hsl.from({ ...beforeHsl, saturation: beforeHsl.saturation + 15 });
    expect(afterHsl1).toStrictEqual({ hue: 0, saturation: 25, lightness: 0 });
  });
});
