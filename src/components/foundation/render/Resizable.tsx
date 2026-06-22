import { ValidComponent, JSX, children, splitProps, Show, onMount } from "solid-js";
import { Dynamic } from "solid-js/web";

import { DragDetector, DragEvent } from "~/components/foundation/detect/DragDetector";
import { cn } from "~/fn/cn";
import { Wve } from "~/type/struct/Wve";
import { PolymorphicProps } from "./Polymorphic";

import styles from "./Resizable.module.css";

/** @public */
export const Resizable = <
  Parent extends ValidComponent = "div",
>(_p: PolymorphicProps<Parent, {
  children?: JSX.Element;
  resizable?: ("top" | "left" | "right" | "bottom")[];
  disabled?: boolean;
  onResize?: OnResize;
}>) => {
  const [p, wrappedParentProps] = splitProps(_p, ["children", "as", "resizable", "disabled", "onResize"]);
  const child = children(() => p.children);
  const onResize: OnResize = (e) => p.onResize?.(e);

  const size = Wve.create<Partial<Size>>({});
  let element!: HTMLElement;
  onMount(() => {
    size.set({
      width: element.offsetWidth,
      height: element.offsetHeight,
    });
  });

  const state = Wve.create({
    inAction: false,
  });
  const inAction = state.partial("inAction");

  const getStartSize = () => ({
    width: size().width ?? 0,
    height: size().height ?? 0,
  });
  const onDrag = (
    direction: "top" | "left" | "right" | "bottom",
    event: DragEvent<Size>,
  ) => {
    const getNextSize = (size: Size) => {
      switch (direction) {
        case "top": return { ...size, height: size.height + -event.delta.y * ((!p.resizable || p.resizable?.includes("bottom")) ? 2 : 1) };
        case "bottom": return { ...size, height: size.height + event.delta.y * ((!p.resizable || p.resizable?.includes("top")) ? 2 : 1) };
        case "left": return { ...size, width: size.width + -event.delta.x * ((!p.resizable || p.resizable?.includes("right")) ? 2 : 1) };
        case "right": return { ...size, width: size.width + event.delta.x * ((!p.resizable || p.resizable?.includes("left")) ? 2 : 1) };
      }
    };

    const prev = event.start;
    const next = getNextSize(prev);
    size.set(next);
    onResize({
      phase: event.phase,
      result: next,
      ratio: { width: next.width / prev.width, height: next.height / prev.height },
    });
    inAction.set(event.phase !== "confirmed");
  };

  const style = () => {
    const raw = size();
    const width = raw.width == null ? {} : { "--width": `${raw.width}px` };
    const height = raw.height == null ? {} : { "--height": `${raw.height}px` };
    return {
      // "--initWidth": `${p.initSize?.width ?? 100}px`,
      // "--initHeight": `${p.initSize?.height ?? 100}px`,
      ...width,
      ...height,
    };
  };

  return (
    <Dynamic {...wrappedParentProps}
      component={p.as ?? "div"}
      class={cn(styles.Resizable, wrappedParentProps.class)}
      style={{
        ...wrappedParentProps.style,
        ...style(),
      }}
      ref={(ref: unknown) => {
        element = ref as HTMLElement;
        wrappedParentProps.ref?.(ref);
      }}
    >
      <Show when={p.disabled !== true}>
        <div class={styles.Resizers}
          classList={{ [styles.InAction]: inAction() }}
        >
          <Show when={!p.resizable || p.resizable.includes("left")}>
            <DragDetector
              class={cn(styles.Resizer, styles.Left)}
              dragContainer={document.body}
              startState={getStartSize}
              onDrag={(event) => onDrag("left", event)}
            />
          </Show>
          <Show when={!p.resizable || p.resizable.includes("right")}>
            <DragDetector
              class={cn(styles.Resizer, styles.Right)}
              dragContainer={document.body}
              startState={getStartSize}
              onDrag={(event) => onDrag("right", event)}
            />
          </Show>
          <Show when={!p.resizable || p.resizable.includes("top")}>
            <DragDetector
              class={cn(styles.Resizer, styles.Top)}
              dragContainer={document.body}
              startState={getStartSize}
              onDrag={(event) => onDrag("top", event)}
            />
          </Show>
          <Show when={!p.resizable || p.resizable.includes("bottom")}>
            <DragDetector
              class={cn(styles.Resizer, styles.Bottom)}
              dragContainer={document.body}
              startState={getStartSize}
              onDrag={(event) => onDrag("bottom", event)}
            />
          </Show>
        </div>
      </Show>
      {child()}
    </Dynamic>
  );
};

/** @public */
export type OnResize = (event: ResizeEvent) => void;

type ResizeEvent = {
  phase: "start" | "confirmed" | "preview";
  result: Size;
  ratio: {
    width: number;
    height: number;
  };
};

type Size = {
  width: number;
  height: number;
};
