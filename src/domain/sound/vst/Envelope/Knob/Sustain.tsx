import { Knob } from "~/components/foundation/ui/Knob";
import { useEnvelopeContext } from "../createEnvelope";

export const Sustain = () => {
  const context = useEnvelopeContext();

  return (
    <Knob
      min={0}
      max={1}
      step={0.001}
      value={context.state().sustain}
      onPreview={(value) => context.state.set("sustain", value)}
    >
      <span>Sustain</span>
      <span>{`(${context.state().sustain.toFixed(3)}s)`}</span>
    </Knob>
  );
};
