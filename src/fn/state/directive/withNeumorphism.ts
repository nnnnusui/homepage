import { createEffect, onCleanup , Accessor , onMount } from "solid-js";

import { UseRef } from "~/fn/chainUseDirective";
import { Override } from "~/type/Override";
import { Pos } from "~/type/struct/Pos";
import { createNeumorphism } from "../createNeumorphism";
import { useInStorybook } from "../root/useInStorybook";
import { useTheme } from "../root/useTheme";

/** @public */
export const withNeumorphism = (
  p: Accessor<UseDirectiveNeumorphismProps>,
): UseRef<HTMLElement> => (ref) => {
  const theme = useTheme();
  const inStorybook = useInStorybook();
  const baseColor = () => {
    if (!inStorybook()) return theme.base;
    return ref.closest(".light, .dark")?.classList.contains("light")
      ? theme.lightBase
      : theme.darkBase;
  };
  const style = createNeumorphism({
    get baseColor() { return baseColor(); },
    get shape() { return p().shape; },
    get depth() { return p().depth; },
    get clarity() { return p().clarity; },
    get light() {
      const light = p().light;
      return light && "x" in light
        ? getLightParams(ref, light)
        : light;
    },
  });

  onMount(() => {
    ref.style.setProperty("background", "var(--neumorphism-background)");
    ref.style.setProperty("box-shadow", "var(--neumorphism-box-shadow)");
  });

  createEffect(() => {
    const value = style.background;
    if (!value) {
      ref.style.removeProperty("--neumorphism-background");
      return;
    }

    ref.style.setProperty("--neumorphism-background", value);
  });

  createEffect(() => {
    const value = style.boxShadow;
    if (!value) {
      ref.style.removeProperty("--neumorphism-box-shadow");
      return;
    }

    ref.style.setProperty("--neumorphism-box-shadow", value);
  });

  onCleanup(() => {
    ref.style.removeProperty("--neumorphism-background");
    ref.style.removeProperty("--neumorphism-box-shadow");
  });
};

type BaseProps = Parameters<typeof createNeumorphism>[0];
type UseDirectiveNeumorphismProps = Override<
  BaseProps,
  {
    baseColor?: BaseProps["baseColor"];
    light?: BaseProps["light"] | Pos;
  }
>;

// declare module "solid-js" {
//   // eslint-disable-next-line @typescript-eslint/no-namespace
//   namespace JSX {
//     interface Directives {
//       neumorphism: UseDirectiveNeumorphismProps;
//     }
//   }
// }

const getLightParams = (element: HTMLElement, lightSourcePos: Pos) => {
  const rect = element.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const dx = lightSourcePos.x - centerX;
  const dy = lightSourcePos.y - centerY;
  const angle = (
    Math.atan2(dy, dx)
      * 180
      / Math.PI
      + 360
  ) % 360;
  const distance = Math.hypot(dx, dy);
  const maxDistance = Math.hypot(rect.width / 2, rect.height / 2);
  const proximity = Math.max(0, Math.min(1, 1 - distance / maxDistance));
  const overElement = (
    lightSourcePos.x >= rect.left
      && lightSourcePos.x <= rect.right
      && lightSourcePos.y >= rect.top
      && lightSourcePos.y <= rect.bottom
  );
  const elevation = overElement
    ? 0.2 + (1 - proximity) * 0.6
    : 0.8;

  return {
    angle,
    proximity,
    overElement,
    elevation,
  };
};
