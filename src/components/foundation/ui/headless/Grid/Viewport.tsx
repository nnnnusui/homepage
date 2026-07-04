import { batch , onMount, ParentProps } from "solid-js";

import { playBounceBack } from "~/fn/animate/playBounceBack";
import { rubberBand } from "~/fn/animate/rubberBand";
import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { Calc } from "~/fn/objCalc";
import { withRef } from "~/fn/state/directive/withRef";
import { Pos } from "~/type/struct/Pos";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

import styles from "./Viewport.module.css";

export const Viewport = (p: ParentProps) => {
  const context = useGridContext();
  const state = Wve.from(() => context.state);
  let viewportRef!: HTMLElement;
  const dragMove = createDragMove({ get viewportRef() { return viewportRef; } });

  onMount(() => {
    requestAnimationFrame(() => {
      viewportRef.scrollLeft = context.physicalScroll.x;
      viewportRef.scrollTop = context.physicalScroll.y;
    });
  });
  const virtualWidth = () => context.virtualSize.width;
  const virtualHeight = () => context.virtualSize.height;

  const gridSize = () => state().gridSize;

  const onPointerDown = (e: PointerEvent) => {
    viewportRef.setPointerCapture(e.pointerId);
    dragMove.onPointerDown(e);
  };
  const onPointerMove = (e: PointerEvent) => {
    state.set("pointer", Pos.fromEvent(e, { relativeTo: viewportRef }));
    if (!viewportRef.hasPointerCapture(e.pointerId)) return;
    dragMove.onPointerMove(e);
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!viewportRef.hasPointerCapture(e.pointerId)) return;
    viewportRef.releasePointerCapture(e.pointerId);
    dragMove.onPointerUp(e);
  };

  return (
    <div
      class={cn(styles.GridViewport, {
        [styles.IsDragging]: dragMove.state().drag.isDragging,
      })}
      ref={chainUseRef([
        withRef((ref) => { viewportRef = ref; }),
        withRef((ref) => state.set("viewportRef", ref)),
      ])}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      <div class="absolute"
        style={{
          ...(virtualWidth() ? { width: `${virtualWidth()}px` } : {}),
          ...(virtualHeight() ? { height: `${virtualHeight()}px` } : {}),
          transform: `translateX(${state().overscroll.x}px) translateY(${state().overscroll.y}px)`,
        }}
      >
        {/* SVG Grid Lines */}
        <svg
          width={virtualWidth()}
          height={virtualHeight()}
        >
          <defs>
            <pattern
              id="GridH"
              x="0"
              y={gridSize().height}
              width="100%"
              height={gridSize().height}
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
              x={gridSize().width}
              y="0"
              width={gridSize().width}
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
        {p.children}
      </div>
    </div>
  );
};

const createDragMove = (p: {
  viewportRef: HTMLElement;
}) => {
  const context = useGridContext();
  const state = Wve.from(() => context.state);
  const localState = Wve.create({
    drag: { isDragging: false, startPos: Pos.init(), startScroll: Pos.init() },
  });

  const onPointerDown = (e: PointerEvent) => {
    localState.set("drag", {
      isDragging: true,
      startPos: Pos.from({ x: e.clientX, y: e.clientY }),
      startScroll: Pos.from({ x: p.viewportRef?.scrollLeft ?? 0, y: p.viewportRef?.scrollTop ?? 0 }),
    });
  };
  const onPointerMove = (e: PointerEvent) => {
    const dragState = localState().drag;
    if (!dragState.isDragging || !p.viewportRef) return;
    const pointerPos = Pos.from({ x: e.clientX, y: e.clientY });
    const delta = Calc["-"](dragState.startPos, pointerPos);
    const newPhysicalScroll = Calc["+"](dragState.startScroll, delta);
    p.viewportRef.scrollLeft = newPhysicalScroll.x;
    p.viewportRef.scrollTop = newPhysicalScroll.y;
    batch(() => {
      const newVirtualScroll = Calc["+"](context.getViewportVirtualPosFromViewportPhysicalPos(newPhysicalScroll), context.viewportOrigin);
      const newVirtualScrollClamped = context.getVirtualScrollPosClamped(newVirtualScroll);
      state.set("scroll", newVirtualScrollClamped);
      const overscrollLeft = Math.min(rubberBand({ delta: newVirtualScroll.x }), 0) * -1;
      const overscrollRight = Math.min(rubberBand({ delta: context.virtualSize.width - state().viewportSize.width - newPhysicalScroll.x }), 0);
      const overscrollTop = Math.min(rubberBand({ delta: newPhysicalScroll.y }), 0) * -1;
      const overscrollBottom = Math.min(rubberBand({ delta: context.virtualSize.height - state().viewportSize.height - newPhysicalScroll.y }), 0);
      state.set("overscroll", "x", overscrollLeft + overscrollRight);
      state.set("overscroll", "y", overscrollTop + overscrollBottom);
    });
  };
  const onPointerUp = (e: PointerEvent) => {
    localState.set("drag", "isDragging", false);

    const overscrollX = state().overscroll.x;
    if (overscrollX && p.viewportRef) {
      playBounceBack({
        from: overscrollX,
        to: 0,
        setter: (value) => {
          state.set("overscroll", "x", value);
        },
        cancelBy: () => localState().drag.isDragging,
      });
    }
    const overscrollY = state().overscroll.y;
    if (overscrollY && p.viewportRef) {
      playBounceBack({
        from: overscrollY,
        to: 0,
        setter: (value) => {
          state.set("overscroll", "y", value);
        },
        cancelBy: () => localState().drag.isDragging,
      });
    }
  };

  return {
    state: localState,
    onPointerDown,
    onPointerMove,
    onPointerUp,
  };
};
