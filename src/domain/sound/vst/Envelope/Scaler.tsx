import { Slider } from "~/components/foundation/ui/headless/Slider";
import { useEnvelopeContext } from "./createEnvelope";

export const Scaler = (p: { class?: string }) => {
  const context = useEnvelopeContext();
  const pixelsPerSecond = context.state.partial("scale");

  return (
    <Slider class={p.class}
      min={24}
      max={1200}
      step={1}
      value={pixelsPerSecond()}
      onPreview={pixelsPerSecond.set}
    >
      <Slider.Thumb class="select-none">⇔</Slider.Thumb>
    </Slider>
  );
};
