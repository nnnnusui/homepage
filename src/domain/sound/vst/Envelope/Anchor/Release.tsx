import { DragDetector } from "~/components/foundation/detect/DragDetector";
import { useEnvelopeContext } from "../createEnvelope";

export const Release = () => {
  const context = useEnvelopeContext();
  const pixelsPerSecond = context.state.partial("scale");
  const anchorMap = () => context.anchorMap;
  const anchor = () => anchorMap().release;
  const time = () => anchor().time;
  const gain = () => anchor().gain;
  const offset = () => anchorMap().delay.time + anchorMap().attack.time + anchorMap().hold.time + anchorMap().decay.time;

  return (
    <DragDetector class="absolute -translate-1/2 bg-slate-600 rounded-full h-[6%] aspect-square"
      style={{
        left: `${(time() + offset()) * pixelsPerSecond()}px`,
        top: `${100 - gain() * 100}%`,
      }}
      startState={anchor}
      onDrag={context.getEnvelopeSetter("release")}
      dragContainer={document.body}
    />
  );
};
