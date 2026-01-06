import { Meta, Title } from "@solidjs/meta";
import { useLocation } from "@solidjs/router";
import { Show } from "solid-js";

/**
 * setting [title, OGPs]
 */
export const PageInfo = (p: {
  title?: UseDomain;
  description?: UseDomain;
  thumbnail?: UseDomain;
}) => {
  const domain = import.meta.env.VITE_DOMAIN as string;
  const location = useLocation();
  const url = `https://${domain}${location}`;
  const title = () => getFromFunctionable(p.title)(domain);
  const description = () => getFromFunctionable(p.description)(domain);
  const thumbnail = () => getFromFunctionable(p.thumbnail)(domain);

  return (
    <>
      <Meta property="og:url" content={url} />
      <Show when={title()}>{(title) => (
        <>
          <Title>{title()}</Title>
          <Meta property="og:title" content={title()} />
        </>
      )}</Show>
      <Show when={description()}>{(description) =>
        <Meta property="og:description" content={description()} />
      }</Show>
      <Show when={thumbnail()}>{(thumbnail) =>
        <Meta property="og:image" content={thumbnail()} />
      }</Show>
    </>
  );
};

type UseDomain = ((domain: string) => string) | string | undefined;
const getFromFunctionable
  = (from: UseDomain): ((domain: string) => string | undefined) =>
    typeof from === "function" ? from : () => from;
