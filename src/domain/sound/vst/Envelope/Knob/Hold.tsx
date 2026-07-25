import { Knob } from "~/components/foundation/ui/Knob";
import { useEnvelopeContext } from "../createEnvelope";

export const Hold = () => {
  const context = useEnvelopeContext();

  return (
    <Knob
      min={0}
      max={2}
      step={0.001}
      value={context.state().hold}
      onPreview={(value) => context.state.set("hold", value)}
    >
      <span>Hold</span>
      <span>{`(${context.state().hold.toFixed(3)}s)`}</span>
    </Knob>
  );
};
