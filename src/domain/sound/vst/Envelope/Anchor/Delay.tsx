import { DragDetector } from "~/components/foundation/detect/DragDetector";
import { useEnvelopeContext } from "../createEnvelope";

export const Delay = () => {
  const context = useEnvelopeContext();
  const anchorMap = () => context.anchorMap;
  const anchor = () => anchorMap().delay;
  const time = () => anchor().time;
  const gain = () => anchor().gain;
  const offset = () => 0;
  const pixelsPerSecond = context.state.partial("scale");

  return (
    <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
      style={{
        left: `${(time() + offset()) * pixelsPerSecond()}px`,
        top: `${100 - gain() * 100}%`,
      }}
      startState={anchor}
      onDrag={context.getEnvelopeSetter("delay")}
      dragContainer={document.body}
    />
  );
};
