import { Knob } from "~/components/foundation/ui/Knob";
import { useEnvelopeContext } from "../createEnvelope";

export const Release = () => {
  const context = useEnvelopeContext();

  return (
    <Knob
      min={0.001}
      max={4}
      step={0.001}
      value={context.state().release}
      onPreview={(value) => context.state.set("release", value)}
    >
      <span>Release</span>
      <span>{`(${context.state().release.toFixed(3)}s)`}</span>
    </Knob>
  );
};
