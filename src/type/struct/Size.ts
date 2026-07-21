/** @public */
export type Size = {
  width: number;
  height: number;
};

/** @public */
export const Size = (() => {
  const init = (): Size => ({ width: 0, height: 0 });
  const from = (partial: Partial<Size> | number): Size => {
    const part = typeof partial === "object"
      ? { width: partial.width ?? 0, height: partial.height ?? 0 }
      : { width: partial, height: partial };
    return {
      ...init(),
      ...part,
    };
  };

  const fromElement = (element: HTMLElement): Size => {
    return {
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  };

  return {
    init,
    from,
    fromElement,
  };
})();
