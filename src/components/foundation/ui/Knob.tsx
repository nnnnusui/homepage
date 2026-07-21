import { ParentProps } from "solid-js";

import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { Calc } from "~/fn/objCalc";
import { withNeumorphism } from "~/fn/state/directive/withNeumorphism";
import { useTheme } from "~/fn/state/root/useTheme";
import { Pos } from "~/type/struct/Pos";
import { createSlider, Slider } from "./headless/Slider";

import styles from "./Knob.module.css";

export const Knob = (p: ParentProps<{
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  onPreview?: (value: number) => void;
  onApply?: (value: number) => void;
  startDegree?: number;
  endDegree?: number;
  rotation?: "clockwise" | "counter-clockwise";
}>) => {
  const startDegree = () => p.startDegree ?? 235; //?? 225;
  const endDegree = () => p.endDegree ?? 125; //?? 135;
  const sweepDegree = () => (360 - startDegree() + endDegree()) % 360;
  const theme = useTheme();

  const slider = createSlider({
    get min() { return p.min; },
    get max() { return p.max; },
    get step() { return p.step; },
    get defaultValue() { return p.defaultValue; },
    get onPreview() { return p.onPreview; },
    get onApply() { return p.onApply; },
    getProgress: (ratio2D) => {
      const d = Calc["-"](ratio2D, Pos.from(0.5));
      const angle = Math.atan2(d.x, -d.y);
      const angleDegree = ((angle * 180) / Math.PI + 360) % 360;
      const progressRaw = (angleDegree - startDegree() + 360) % 360 / sweepDegree();

      const getDegreeDistance = (lhs: number, rhs: number) => {
        const diff = Math.abs(lhs - rhs);
        return Math.min(diff, 360 - diff);
      };

      const insideSweep = progressRaw <= 1;
      const progress = insideSweep
        ? progressRaw
        : getDegreeDistance(angleDegree, startDegree()) < getDegreeDistance(angleDegree, endDegree())
          ? 0
          : 1;

      return p.rotation === "counter-clockwise" ? 1 - progress : progress;
    },
  });

  return (
    <Slider class="relative grid place-items-center rounded-full select-none outline-none touch-none"
      api={slider}
      style={{
        "--start-deg": `${startDegree()}deg`,
        "--end-deg": `${sweepDegree()}deg`,
        "--arc-width-base": "20%",
      }}
    >
      <Slider.Track class={cn("relative size-full min-w-15 aspect-square")}>
        <div class={cn(styles.Arc, "absolute inset-0 rounded-full")}
          ref={chainUseRef([
            withNeumorphism(() => ({ shape: "pressed" })),
          ])}
        />
        <div
          class="absolute inset-[16%] rounded-full"
          ref={chainUseRef([
            withNeumorphism(() => ({ shape: "concave" })),
          ])}
        >
          <div class="size-full p-[20%] pointer-events-none"
            style={{
              transform: `rotate(${(45 + sweepDegree() * slider.valueRatio) + startDegree()}deg)`,
            }}
          >
            <div class="w-[20%] h-3/8 rounded-full origin-top -rotate-45 -translate-x-1/2"
              style={{ "background-color": theme.accent }}
            />
          </div>
        </div>
        <Slider.Range class={cn(styles.Arc, styles.Indicate, "absolute inset-0.5")}
          ref={chainUseRef([
            withNeumorphism(() => ({ shadowColor: theme.accent, shape: "pressed" })),
          ])}
          style={{
            "--end-deg": `${sweepDegree() * slider.valueRatio}deg`,
          }}
        />
        <Slider.Thumb class="absolute inset-[16%] rounded-full" />
      </Slider.Track>
      <Slider.ValueText
        class="text-xs font-semibold"
        style={{
          color: "#b9c2d5",
          "letter-spacing": "0.02em",
        }}
      >
        {p.children}
        {/* {state().value.toFixed(digits())} */}
      </Slider.ValueText>
    </Slider>
  );
};
