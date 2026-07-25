import { Knob } from "~/components/foundation/ui/Knob";
import { useEnvelopeContext } from "../createEnvelope";

export const Delay = () => {
  const context = useEnvelopeContext();

  return (
    <Knob
      min={0}
      max={2}
      step={0.001}
      value={context.state().delay}
      onPreview={(value) => context.state.set("delay", value)}
    >
      <span>Delay</span>
      <span>{`(${context.state().delay.toFixed(3)}s)`}</span>
    </Knob>
  );
};
