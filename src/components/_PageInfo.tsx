import { Component, Show } from "solid-js";
import { Meta, Title, useLocation } from "solid-start";

type UseDomain = ((domain: string) => string) | string | undefined
export const getFromFunctionable
  = (from: UseDomain): ((domain: string) => string | undefined) =>
    typeof from === "function" ? from : () => from;

const domain = import.meta.env.VITE_DOMAIN as string;
type Props = {
  title?: UseDomain
  description?: UseDomain
  thumbnail?: UseDomain
}
/**
 * setting [title, OGPs]
 */
export const PageInfo: Component<Props> = (props) => {
  const location = useLocation();
  const url = `https://${domain}${location}`;
  const title = () => getFromFunctionable(props.title)(domain);
  const description = () => getFromFunctionable(props.description)(domain);
  const thumbnail = () => getFromFunctionable(props.thumbnail)(domain);

  return (
    <>
      <Meta property="og:url" content={url} />
      <Show when={title()}>{(title) =>
        <>
          <Title>{title()}</Title>
          <Meta property="og:title" content={title()} />
        </>
      }</Show>
      <Show when={description()}>{(description) =>
        <Meta property="og:description" content={description()} />
      }</Show>
      <Show when={thumbnail()}>{(thumbnail) =>
        <Meta property="og:image" content={thumbnail()} />
      }</Show>
    </>
  );
};
