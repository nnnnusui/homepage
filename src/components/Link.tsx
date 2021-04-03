import React from "react";
import style from "../styles/components/Link.module.scss";

type Props = {
  service: string;
  url: string;
};
const Link: React.FC<Props> = ({ service, url }) => {
  return (
    <a href={url} className={`${style.link} ${style[service]}`} title={url}>
      <div className={style[service]}></div>
    </a>
  );
};
export default Link;
