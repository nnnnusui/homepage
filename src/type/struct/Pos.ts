import { Override } from "~/type/Override";

/** @public */
export type Pos = {
  x: number;
  y: number;
};

/** @public */
export const Pos = (() => {
  const init = (): Pos => ({ x: 0, y: 0 });
  const fromPartial = (partial: Partial<Pos> | number) => {
    const part = typeof partial === "object"
      ? { x: partial.x, y: partial.y }
      : { x: partial, y: partial };
    return {
      ...init(),
      ...part,
    };
  };
  const fromEvent = <
    Event extends Override<MouseEvent, { currentTarget?: Element | EventTarget | null }>,
    XField extends keyof { [Key in keyof Event]: Event[Key] extends number ? Key : never },
    YField extends keyof { [Key in keyof Event]: Event[Key] extends number ? Key : never },
  >(event: Event, options?: {
    field?: { x: XField; y: YField };
    relativeTo?: HTMLElement;
  }): Pos => {
    const fieldX = options?.field?.x ?? "clientX";
    const fieldY = options?.field?.y ?? "clientY";
    const eventPos: Pos = {
      x: event[fieldX] as number,
      y: event[fieldY] as number,
    };
    const relativeTo = options?.relativeTo ?? event.currentTarget;
    if (!relativeTo) return eventPos;
    if (!(relativeTo instanceof Element)) return eventPos;
    const rect = relativeTo.getBoundingClientRect();
    return {
      x: eventPos.x - rect.left + relativeTo.scrollLeft,
      y: eventPos.y - rect.top + relativeTo.scrollTop,
    };
  };

  return {
    init,
    fromEvent,
    fromPartial,
  };
})();
