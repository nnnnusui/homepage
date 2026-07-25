import { Knob } from "~/components/foundation/ui/Knob";
import { useEnvelopeContext } from "../createEnvelope";

export const Attack = () => {
  const context = useEnvelopeContext();

  return (
    <Knob
      min={0.001}
      max={2}
      step={0.001}
      value={context.state().attack}
      onPreview={(value) => context.state.set("attack", value)}
    >
      <span>Attack</span>
      <span>{`(${context.state().attack.toFixed(3)}s)`}</span>
    </Knob>
  );
};
