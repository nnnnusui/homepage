import { Attack } from "./Attack";
import { AttackBezier } from "./AttackBezier";
import { Decay } from "./Decay";
import { DecayBezier } from "./DecayBezier";
import { Delay } from "./Delay";
import { Hold } from "./Hold";
import { Release } from "./Release";
import { ReleaseBezier } from "./ReleaseBezier";

const All = () => {
  return (
    <>
      <Delay />
      <Attack />
      <Hold />
      <Decay />
      <Release />
      <AttackBezier />
      <DecayBezier />
      <ReleaseBezier />
    </>
  );
};

export const Anchor = {
  All,
  Attack,
  AttackBezier,
  Decay,
  DecayBezier,
  Delay,
  Hold,
  Release,
  ReleaseBezier,
};
