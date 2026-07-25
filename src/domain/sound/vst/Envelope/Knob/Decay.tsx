import { Knob } from "~/components/foundation/ui/Knob";
import { useEnvelopeContext } from "../createEnvelope";

export const Decay = () => {
  const context = useEnvelopeContext();

  return (
    <Knob
      min={0.001}
      max={3}
      step={0.001}
      value={context.state().decay}
      onPreview={(value) => context.state.set("decay", value)}
    >
      <span>Decay</span>
      <span>{`(${context.state().decay.toFixed(3)}s)`}</span>
    </Knob>
  );
};
