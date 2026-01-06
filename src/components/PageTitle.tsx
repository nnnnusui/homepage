import { batch, createSignal, JSX, onMount } from "solid-js";

import { getRandomFont } from "~/fn/getRandomFont";
import { useFonts } from "~/fn/state/root/useFonts";

export const PageTitle = (p: {
  children: JSX.Element;
}) => {
  const [, setFonts] = useFonts();
  const font = getRandomFont();

  let ref!: HTMLHeadingElement;
  const [fontLoaded, setFontLoaded] = createSignal(false);
  const [scale, setScale] = createSignal(1);
  onMount(() => {
    if (!ref) return;
    const text = [...new Set(ref.textContent)].join("");
    if (!text) return;
    const importUrl = `${font.url}&text=${encodeURI(text)}`;

    setFonts.add({
      ...font,
      url: importUrl,
    });
    setTimeout(() => {
      const parentWidth = ref.parentElement?.getBoundingClientRect().width;
      if (!parentWidth) return;
      document.fonts.ready.then(() => {
        batch(() => {
          setFontLoaded(true);
          if (!document.fonts.check(`1px ${font.family}`)) return;
          const currentWidth = ref.getBoundingClientRect().width;
          const widthScaling = parentWidth / currentWidth * 0.7;
          setScale(widthScaling);
        });
      });
    }, 100);
  });

  return (
    <h1
      ref={ref}
      class="font-[inherit] w-fit text-[calc(1vmin*var(--scale))] leading-[1em]"
      classList={{
        invisible: !fontLoaded(),
      }}
      style={{
        "font-family": font.family,
        "--scale": scale(),
      }}
    >
      {p.children}
    </h1>
  );
};
