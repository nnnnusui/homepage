import { Link, Meta, Style, Title } from "@solidjs/meta";

import { PageInfo } from "./components/route/PageInfo";
import { useColors } from "./fn/state/root/useColors";
import { useFonts } from "./fn/state/root/useFonts";

export const _Head = () => {
  const domain = import.meta.env.VITE_DOMAIN as string;
  const [colors] = useColors();
  const [fonts] = useFonts();
  const fontsImports = () => fonts.map((it) => `@import url(${it.url})`).join("\n");

  return (
    <>
      <Title>{domain}</Title>
      <Meta charset="utf-8" />
      <Meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta name="charset" content="utf-8" />
      {/* <Meta name="theme-color" content={colors.base} /> */}
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
      <Style>{`
        :root {
          --base-color: ${colors.base};
          --main-color: ${colors.main};
          --accent-color: ${colors.accent}; 
        }
      `}</Style>
    </>
  );
};
