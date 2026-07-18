import { Hsl } from "~/type/struct/Hsl";
import { Rgb } from "~/type/struct/Rgb";

/** @public */
export const createNeumorphism = (p: {
  shadowColor: string;
  baseColor?: string;
  shape?: "flat" | "concave" | "convex" | "pressed";
  depth?: number;
  clarity?: number;
  light?: {
    angle?: number;
    elevation?: number;
    proximity?: number;
    overElement?: boolean;
  };
}) => {
  const clamp = (v: number, min = 0, max = 1) =>
    Math.min(max, Math.max(min, v));
  const toRgba = (rgb: Rgb, alpha: number) =>
    `rgba(${rgb.red}, ${rgb.green}, ${rgb.blue}, ${clamp(alpha, 0, 1).toFixed(3)})`;

  const lightElevation = () => p.light?.elevation ?? 0.8;
  const lightAngle = () => p.light?.angle ?? 225;
  const proximity = () => clamp(p.light?.proximity ?? 0, 0, 1);
  const overElement = () => p.light?.overElement ?? false;
  const centerLight = () => (overElement() ? proximity() : 0);
  const size = () => 100;
  const shadow = () => Rgb.fromRgbHexStr(p.shadowColor);
  const background = () => Rgb.fromRgbHexStr(p.baseColor ?? p.shadowColor);
  const shape = () => p.shape || "flat";
  const depth = () => p.depth ?? 0.4;
  const clarity = () => p.clarity ?? 0.6;

  // ---- geometry ------------------------------------------------------------
  const baseOffset = () => size() * (0.02 + depth() * 0.06);
  const offsetBase = () => baseOffset() * (0.5 + lightElevation());
  const offset = () => offsetBase() * (1 - centerLight() * 0.85);
  const blur = () => offset() * (4 - clarity() * 2.5) * (1 - centerLight() * 0.55);

  // ---- light direction -----------------------------------------------------
  const shadowAngle = () => (lightAngle() + 180) * Math.PI / 180;
  const dx = () => Math.cos(shadowAngle()) * offset();
  const dy = () => Math.sin(shadowAngle()) * offset();

  // ---- shadow colors -------------------------------------------------------
  const shadowHsl = () => Hsl.fromRgb(shadow());
  const lightnessDelta = () => 8 + depth() * 12;

  const lightColor = () => Hsl.toRgb(
    Hsl.fromHsl(
      shadowHsl().hue,
      shadowHsl().saturation,
      clamp(shadowHsl().lightness + lightnessDelta(), 0, Hsl.max().lightness),
    ),
  );
  const darkColor = () => Hsl.toRgb(
    Hsl.fromHsl(
      shadowHsl().hue,
      shadowHsl().saturation,
      clamp(shadowHsl().lightness - lightnessDelta(), 0, Hsl.max().lightness),
    ),
  );

  const darkShadow = () => `${dx().toFixed(1)}px ${dy().toFixed(1)}px ${blur().toFixed(1)}px ${Rgb.toRgbHexStr(darkColor())}`;
  const lightShadow = () => `${(-dx()).toFixed(1)}px ${(-dy()).toFixed(1)}px ${blur().toFixed(1)}px ${Rgb.toRgbHexStr(lightColor())}`;

  // Delay rim onset near edges to avoid sudden full-ring appearance on enter.
  const rimPresence = () => {
    if (!overElement()) return 0;
    const t = clamp((proximity() - 0.08) / 0.72, 0, 1);
    return t * t * (3 - 2 * t);
  };

  const insetRim = () => {
    const rim = rimPresence();
    if (rim <= 0.01) return "";

    const shapeNow = shape();
    const rimWidth = 0.25 + rim * 0.9;
    const rimBlur = 1 + rim * 6;
    const directionalGlow = `inset ${(-dx() * 0.18).toFixed(1)}px ${(-dy() * 0.18).toFixed(1)}px ${rimBlur.toFixed(1)}px ${toRgba(lightColor(), 0.16 + rim * 0.34)}`;
    const rimStroke = `inset 0 0 0 ${rimWidth.toFixed(1)}px ${toRgba(lightColor(), 0.08 + rim * 0.22)}`;
    const softInnerShadow = `inset ${(dx() * 0.08).toFixed(1)}px ${(dy() * 0.08).toFixed(1)}px ${(1 + rim * 2).toFixed(1)}px ${toRgba(darkColor(), 0.18 + rim * 0.2)}`;

    if (shapeNow === "pressed") return `, ${directionalGlow}, ${rimStroke}`;
    if (shapeNow === "concave") return `, ${directionalGlow}, ${softInnerShadow}`;
    if (shapeNow === "convex") return `, ${directionalGlow}`;
    return `, ${rimStroke}`;
  };

  const concaveOuterDark = () => {
    if (shape() !== "concave") return "";
    const strength = 0.22 + centerLight() * 0.28;
    return `, ${(dx() * 1.1).toFixed(1)}px ${(dy() * 1.1).toFixed(1)}px ${(blur() * 0.75).toFixed(1)}px ${toRgba(darkColor(), strength)}`;
  };

  // ---- gradient colors ----------------------------------------------------
  const backgroundCss = () => {
    if (["flat", "pressed"].includes(shape())) return Rgb.toRgbHexStr(background());
    const bgHsl = () => Hsl.fromRgb(background());
    const surfaceHsl = bgHsl();
    const contrast
      = (3 + depth() * 5)
    * (0.5 + lightElevation() * 0.5)
    * (1 - centerLight() * 0.5);
    const highlightColor = Hsl.toRgb(Hsl.from({
      hue: surfaceHsl.hue,
      saturation: surfaceHsl.saturation,
      lightness: clamp(surfaceHsl.lightness + contrast, 0, Hsl.max().lightness),
    }));
    const shadowColor = Hsl.toRgb(Hsl.from({
      hue: surfaceHsl.hue,
      saturation: surfaceHsl.saturation,
      lightness: clamp(surfaceHsl.lightness - contrast, 0, Hsl.max().lightness),
    }));
    const degree = (lightAngle() - 90 + (shape() === "concave" ? 180 : 0)) % 360;
    return `linear-gradient(${degree}deg, ${Rgb.toRgbHexStr(highlightColor)}, ${Rgb.toRgbHexStr(shadowColor)})`;
  };

  return {
    get background() { return backgroundCss(); },
    get boxShadow() {
      return shape() === "pressed"
        ? `inset ${darkShadow()}, inset ${lightShadow()}${insetRim()}`
        : `${darkShadow()}, ${lightShadow()}${concaveOuterDark()}${insetRim()}`;
    },
  };
};
