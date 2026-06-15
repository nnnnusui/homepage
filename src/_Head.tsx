import { Link, Meta, Style, Title } from "@solidjs/meta";

import { PageInfo } from "./components/route/PageInfo";
import { useFonts } from "./fn/state/root/useFonts";
import { useTheme } from "./fn/state/root/useTheme";

export const _Head = () => {
  const domain = import.meta.env.VITE_DOMAIN as string;
  const theme = useTheme();
  const [fonts] = useFonts();
  const fontsImports = () => fonts.map((it) => `@import url(${it.url})`).join("\n");

  return (
    <>
      <Title>{domain}</Title>
      <Meta charset="utf-8" />
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta name="charset" content="utf-8" />
      <Meta name="theme-color" content={theme.base} />
      <Link rel="icon" type="image/ico" href="/src/assets/favicon.ico" />
      <Meta name="twitter:card" content="summary" />
      <Meta name="twitter:site" content="@nnnnusui" />
      <Meta name="twitter:creator" content="@nnnnusui" />
      <Meta property="fb:app_id" content="198922981704616" />
      <Meta property="og:type" content="website" />
      <Meta property="og:site_name" content={domain} />
      <PageInfo
        title={(domain) => domain}
        description="in progress..."
        thumbnail={(domain) => `https://${domain}/thumbnail.png`}
      />

      <Style>{fontsImports()}</Style>
      <Style>{theme.style}</Style>
    </>
  );
};
