import { ParentProps, splitProps, untrack, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { cn } from "~/fn/cn";
import { Pos } from "~/type/struct/Pos";
import { Size } from "~/type/struct/Size";
import { GridContext } from "./Context";
import { useGrid } from "./useGrid";

import styles from "./Root.module.css";

export const Root = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps<{
  origin?: ((viewportSize: Size) => Pos) | OriginTemplate;
  virtualPadding?: { top: number; right: number; bottom: number; left: number };
  initGridSize?: Size;
} | {
  api: ReturnType<typeof useGrid>;
}>>) => {
  const getProps = () => {
    if (_p.api) {
      const [p, wrappedProps] = splitProps(_p,
        // @ts-expect-error: api may be existing.
        ["api"],
      );
      return { p, wrappedProps, api: untrack(() => p.api) };
    }
    const [p, wrappedProps] = splitProps(_p,
    // @ts-expect-error: may be existing all.
      ["origin", "virtualPadding", "initGridSize"],
    );
    const api = useGrid(p);
    return { wrappedProps, api };
  };
  const props = getProps();

  return (
    <RootImpl {...props.wrappedProps}
      api={props.api}
    />
  );
};

const RootImpl = <Component extends ValidComponent>(_p: PolymorphicProps<Component, ParentProps<{
  api: ReturnType<typeof useGrid>;
}>>) => {
  const [p, wrappedProps] = splitProps(_p, ["api"]);

  return (
    <GridContext.Provider value={untrack(() => p.api)}>
      <Polymorphic {...wrappedProps}
        as={wrappedProps.as ?? defaultAs}
        class={cn(styles.GridRoot, wrappedProps.class)}
      >
        {wrappedProps.children}
      </Polymorphic>
    </GridContext.Provider>
  );
};

const defaultAs = "div" as const;
type OriginTemplate
  = "top-left" | "top-center" | "top-right"
  | "center-left" | "center" | "center-right"
  | "bottom-left" | "bottom-center" | "bottom-right";
