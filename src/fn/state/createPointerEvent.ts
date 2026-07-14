/** @public */
export const createPointerEvent = (p: {
  on: {
    down?: ((e: PointerEvent) => void) | PointerEventKind;
    move?: ((e: PointerEvent) => void) | PointerEventKind;
    up?: ((e: PointerEvent) => void) | PointerEventKind;
    cancel?: ((e: PointerEvent) => void) | PointerEventKind;
    leave?: ((e: PointerEvent) => void) | PointerEventKind;
  };
  merge?: {
    onPointerDown?: (e: PointerEvent) => void;
    onPointerMove?: (e: PointerEvent) => void;
    onPointerUp?: (e: PointerEvent) => void;
    onPointerCancel?: (e: PointerEvent) => void;
    onPointerLeave?: (e: PointerEvent) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } | any;
}) => {
  const getHandler = (target: PointerEventKind | ((e: PointerEvent) => void) | undefined, referenceStack: PointerEventKind[] = []): ((e: PointerEvent) => void) | undefined => {
    if (!target) return;
    if (typeof target === "function") return target;
    if (referenceStack.includes(target)) throw new Error(`Circular reference detected in pointer event handlers: ${[...referenceStack, target].join(" -> ")}`);
    return getHandler(p.on[target], [...referenceStack, target]);
  };
  const onDown = (e: PointerEvent) => getHandler(p.on.down)?.(e);
  const onMove = (e: PointerEvent) => getHandler(p.on.move)?.(e);
  const onUp = (e: PointerEvent) => getHandler(p.on.up)?.(e);
  const onCancel = (e: PointerEvent) => getHandler(p.on.cancel)?.(e);
  const onLeave = (e: PointerEvent) => getHandler(p.on.leave)?.(e);

  const onPointerDown = (e: PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    p.merge?.onPointerDown?.(e);
    if (e.defaultPrevented) return;
    onDown(e);
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    p.merge?.onPointerMove?.(e);
    if (e.defaultPrevented) return;
    onMove(e);
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    p.merge?.onPointerUp?.(e);
    if (e.defaultPrevented) return;
    onUp(e);
  };

  const onPointerCancel = (e: PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    p.merge?.onPointerCancel?.(e);
    if (e.defaultPrevented) return;
    onCancel(e);
  };

  const onPointerLeave = (e: PointerEvent) => {
    if (!(e.currentTarget as HTMLElement).hasPointerCapture(e.pointerId)) return;
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    p.merge?.onPointerLeave?.(e);
    if (e.defaultPrevented) return;
    onLeave(e);
  };

  return {
    handlerMap: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onPointerLeave,
    },
  };
};

type PointerEventKind = "down" | "move" | "up" | "cancel" | "leave";
