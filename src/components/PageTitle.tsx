import {
  createSignal,
  createEffect,
  ParentComponent,
} from "solid-js";

import styles from "./PageTitle.module.styl";

import { getRandomFont } from "@/fn/getRandomFont";
import { useFonts } from "@/fn/state/root/fonts";

export const PageTitle: ParentComponent = (props) => {
  const [, setFonts] = useFonts;
  const font = getRandomFont();

  const [getRef, setRef] = createSignal<HTMLElement>();
  const [scale, setScale] = createSignal(1);
  createEffect(() => {
    const ref = getRef();
    if (!ref) return;
    const text = [...new Set(ref.textContent)].join("");
    if (!text) return;
    const importUrl = `${font.url}&text=${encodeURI(text)}`;

    setFonts.add({
      ...font,
      url: importUrl,
    });
    const parentWidth = ref.parentElement?.getBoundingClientRect().width;
    if (!parentWidth) return;
    document.fonts.ready.then(() => {
      if (!document.fonts.check(`1px ${font.family}`)) return;
      const currentWidth = ref.getBoundingClientRect().width;
      const widthScaling = parentWidth / currentWidth * 0.7;
      setScale(widthScaling);
    });
  });

  return (
    <h1
      class={ styles.PageTitle }
      style={{
        "font-family": font.family,
        "--scale": scale(),
      }}
      ref={setRef}
    >
      {props.children}
    </h1>
  );
};
