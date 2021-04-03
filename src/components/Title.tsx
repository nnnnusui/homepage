import React, { useEffect, useState } from "react";
import style from "../styles/components/Title.module.scss";

const Title: React.FC = () => {
  const [random, setRandom] = useState<number>();
  const max = Number(style.fontsCount);
  useEffect(() => {
    setRandom(Math.floor(Math.random() * max) + 1);
  });
  const text = random ? style.text : "...";

  return (
    <h1 className={`${style.title} ${style[`font-${random}`]}`}>{text}</h1>
  );
};
export default Title;
