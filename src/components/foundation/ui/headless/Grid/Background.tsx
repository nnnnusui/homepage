import { ParentProps, splitProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { Calc } from "~/fn/objCalc";
import { Pos } from "~/type/struct/Pos";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

export const Background = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [, wrappedProps] = splitProps(_p, []);
  const context = useGridContext();
  const state = Wve.from(() => context.state);

  const gridShift = () => Calc["*"](Pos.fromSize(Calc["%"](state().viewportSize, state().gridSize)), context.viewportOriginRatio);

  return (
    <Polymorphic {...wrappedProps}
      as={wrappedProps.as ?? defaultAs}
    >
      <svg
        width={context.virtualSize.width}
        height={context.virtualSize.height}
      >
        <defs>
          <pattern
            id="GridH"
            x="0"
            y={gridShift().y}
            width="100%"
            height={state().gridSize.height}
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="100%"
              y2="0"
              stroke="currentColor"
              stroke-width="1"
              opacity="0.1"
            />
          </pattern>
          <pattern
            id="GridV"
            x={gridShift().x}
            y="0"
            width={state().gridSize.width}
            height="100%"
            patternUnits="userSpaceOnUse"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="100%"
              stroke="currentColor"
              stroke-width="1"
              opacity="0.1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#GridH)" />
        <rect width="100%" height="100%" fill="url(#GridV)" />
      </svg>
      {wrappedProps.children}
    </Polymorphic>
  );
};

const defaultAs = "div" as const;
