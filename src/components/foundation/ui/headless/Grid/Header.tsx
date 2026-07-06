import { createEffect, ParentProps, splitProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

import styles from "./Header.module.css";

export const Header = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps<{
  area: "top-left" | "top-center" | "top-right" | "left" | "right" | "bottom-left" | "bottom-center" | "bottom-right";
}>>) => {
  const [p, wrappedProps] = splitProps(_p, ["area"]);
  const context = useGridContext();
  const state = Wve.from(() => context.state);
  let headerRef!: HTMLElement;

  const directions = () => {
    if (p.area === "top-left") return { horizontal: false, vertical: false };
    if (p.area === "top-center") return { horizontal: true, vertical: false };
    if (p.area === "top-right") return { horizontal: false, vertical: false };
    if (p.area === "left") return { horizontal: false, vertical: true };
    if (p.area === "right") return { horizontal: false, vertical: true };
    if (p.area === "bottom-left") return { horizontal: false, vertical: false };
    if (p.area === "bottom-center") return { horizontal: true, vertical: false };
    if (p.area === "bottom-right") return { horizontal: false, vertical: false };
    return { horizontal: false, vertical: false };
  };

  createEffect(() => {
    if (!headerRef) return;
    if (directions().horizontal) headerRef.scrollLeft = context.physicalScroll.x;
    if (directions().vertical) headerRef.scrollTop = context.physicalScroll.y;
  });

  const size = () => ({
    ...(!directions().horizontal ? {} : { viewportWidth: state().viewportSize.width, innerWidth: context.virtualSize.width }),
    ...(!directions().vertical ? {} : { viewportHeight: state().viewportSize.height, innerHeight: context.virtualSize.height }),
  });

  const transform = () => [
    ...(!directions().horizontal ? [] : [`translateX(${state().overscroll.x}px)`]),
    ...(!directions().vertical ? [] : [`translateY(${state().overscroll.y}px)`]),
  ].join(" ");

  return (
    <Polymorphic {...wrappedProps}
      as={wrappedProps.as ?? defaultAs}
      class={cn(styles.GridHeader)}
      ref={chainUseRef([(ref) => headerRef = ref])}
      style={{
        "grid-area": p.area,
        width: `${size().viewportWidth ?? state().gridSize.width}px`,
        height: `${size().viewportHeight ?? state().gridSize.height}px`,
        transform: transform(),
      }}
    >
      <div class="absolute"
        style={{
          width: `${size().innerWidth ?? state().gridSize.width}px`,
          height: `${size().innerHeight ?? state().gridSize.height}px`,
        }}
      >
        {wrappedProps.children}
      </div>
    </Polymorphic>
  );
};

const defaultAs = "div" as const;
