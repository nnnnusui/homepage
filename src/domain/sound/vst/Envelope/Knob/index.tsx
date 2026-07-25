import { Attack } from "./Attack";
import { Decay } from "./Decay";
import { Delay } from "./Delay";
import { Hold } from "./Hold";
import { Release } from "./Release";
import { Sustain } from "./Sustain";

const All = () => {
  return (
    <div class="flex gap-4">
      <Delay />
      <Attack />
      <Hold />
      <Decay />
      <Sustain />
      <Release />
    </div>
  );
};

export const Knob = {
  All,
  Attack,
  Decay,
  Delay,
  Hold,
  Release,
  Sustain,
};
