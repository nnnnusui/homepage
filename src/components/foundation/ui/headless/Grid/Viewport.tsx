import { batch, onMount, ParentProps, splitProps, ValidComponent } from "solid-js";

import { Polymorphic, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { playBounceBack } from "~/fn/animate/playBounceBack";
import { rubberBand } from "~/fn/animate/rubberBand";
import { chainUseRef } from "~/fn/chainUseRef";
import { cn } from "~/fn/cn";
import { Calc } from "~/fn/objCalc";
import { createElementSize } from "~/fn/state/createElementSize";
import { withRef } from "~/fn/state/directive/withRef";
import { Pos } from "~/type/struct/Pos";
import { Wve } from "~/type/struct/Wve";
import { useGridContext } from "./Context";

import styles from "./Viewport.module.css";

export const Viewport = <As extends ValidComponent = typeof defaultAs>(_p: PolymorphicProps<As, ParentProps>) => {
  const [, wrappedProps] = splitProps(_p, []);
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
    <Polymorphic {...wrappedProps}
      as={wrappedProps.as ?? defaultAs}
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
      style={{
        translate: `${state().overscroll.x}px ${state().overscroll.y}px`,
      }}
    >
      <div class="absolute"
        style={{
          ...(virtualWidth() ? { width: `${virtualWidth()}px` } : {}),
          ...(virtualHeight() ? { height: `${virtualHeight()}px` } : {}),
        }}
      >
        {wrappedProps.children}
      </div>
    </Polymorphic>
  );
};

const defaultAs = "div" as const;
const createDragMove = (p: {
  viewportRef: HTMLElement;
}) => {
  const context = useGridContext();
  const state = Wve.from(() => context.state);
  const localState = Wve.create({
    drag: { isDragging: false, startPos: Pos.init(), startScroll: Pos.init() },
  });
  const viewportSize = createElementSize(() => p.viewportRef);

  const onPointerDown = (e: PointerEvent) => {
    localState.set("drag", {
      isDragging: true,
      startPos: Pos.from({ x: e.clientX, y: e.clientY }),
      startScroll: {
        x: state().scroll.x,
        y: state().scroll.y,
      },
    });
  };
  const onPointerMove = (e: PointerEvent) => {
    const dragState = localState().drag;
    if (!dragState.isDragging || !p.viewportRef) return;
    const pointerPos = Pos.from({ x: e.clientX, y: e.clientY });
    const delta = Calc["-"](dragState.startPos, pointerPos);
    const nextVirtualScrollRaw = Calc["+"](dragState.startScroll, delta);
    const nextPhysicalScrollRaw = context.getPhysicalScrollFromVirtualScroll(nextVirtualScrollRaw);
    const nextVirtualScroll = context.getVirtualScrollPosClamped(nextVirtualScrollRaw);
    const nextPhysicalScroll = context.getPhysicalScrollFromVirtualScroll(nextVirtualScroll);
    p.viewportRef.scrollLeft = nextPhysicalScroll.x;
    p.viewportRef.scrollTop = nextPhysicalScroll.y;
    console.log(p.viewportRef.scrollLeft, p.viewportRef.scrollTop, nextPhysicalScroll);
    batch(() => {
      state.set("scroll", nextVirtualScroll);
      const overscrollLeft = Math.min(rubberBand({ delta: nextPhysicalScrollRaw.x }), 0) * -1;
      const overscrollRight = Math.min(rubberBand({ delta: context.virtualSize.width - viewportSize().width - nextPhysicalScrollRaw.x }), 0);
      const overscrollTop = Math.min(rubberBand({ delta: nextPhysicalScrollRaw.y }), 0) * -1;
      const overscrollBottom = Math.min(rubberBand({ delta: context.virtualSize.height - viewportSize().height - nextPhysicalScrollRaw.y }), 0);
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
