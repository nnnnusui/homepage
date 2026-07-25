import { Knob } from "~/components/foundation/ui/Knob";
import { EnvelopeBezier, useEnvelopeContext } from "./createEnvelope";

export const Editor = () => {
  const context = useEnvelopeContext();
  const state = () => context.state();

  return (
    <section class="flex flex-col gap-4 w-full rounded-lg border border-slate-700/70 p-4">
      <header>
        <h2 class="text-base font-semibold text-slate-100">Envelope Editor</h2>
        <p class="text-sm text-slate-300">Adjust delay, attack, hold, decay, sustain, and release.</p>
      </header>

      <div class="flex flex-row gap-3">
        <Knob
          min={0}
          max={2}
          step={0.001}
          value={context.state().delay}
          onPreview={(value) => context.state.set("delay", value)}
        >
          <span>Delay</span>
          <span>{`(${state().delay.toFixed(3)}s)`}</span>
        </Knob>
        <Knob
          min={0.001}
          max={2}
          step={0.001}
          value={context.state().attack}
          onPreview={(value) => context.state.set("attack", value)}
        >
          <span>Attack</span>
          <span>{`(${state().attack.toFixed(3)}s)`}</span>
        </Knob>
        <Knob
          min={0}
          max={2}
          step={0.001}
          value={context.state().hold}
          onPreview={(value) => context.state.set("hold", value)}
        >
          <span>Hold</span>
          <span>{`(${state().hold.toFixed(3)}s)`}</span>
        </Knob>
        <Knob
          min={0.001}
          max={3}
          step={0.001}
          value={context.state().decay}
          onPreview={(value) => context.state.set("decay", value)}
        >
          <span>Decay</span>
          <span>{`(${state().decay.toFixed(3)}s)`}</span>
        </Knob>
        <Knob
          min={0}
          max={1}
          step={0.001}
          value={context.state().sustain}
          onPreview={(value) => context.state.set("sustain", value)}
        >
          <span>Sustain</span>
          <span>{`(${state().sustain.toFixed(3)}s)`}</span>
        </Knob>
        <Knob
          min={0.001}
          max={4}
          step={0.001}
          value={context.state().release}
          onPreview={(value) => context.state.set("release", value)}
        >
          <span>Release</span>
          <span>{`(${state().release.toFixed(3)}s)`}</span>
        </Knob>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-3 gap-3">
        <BezierEditor
          title="Attack Curve"
          curve={state().attackCurve}
          onPreview={(next) => context.state.set("attackCurve", next)}
        />
        <BezierEditor
          title="Decay Curve"
          curve={state().decayCurve}
          onPreview={(next) => context.state.set("decayCurve", next)}
        />
        <BezierEditor
          title="Release Curve"
          curve={state().releaseCurve}
          onPreview={(next) => context.state.set("releaseCurve", next)}
        />
      </div>
    </section>
  );
};

const BezierEditor = (p: {
  title: string;
  curve: EnvelopeBezier;
  onPreview: (next: EnvelopeBezier) => void;
}) => {
  const set = (key: keyof EnvelopeBezier, value: number) => {
    p.onPreview({
      ...p.curve,
      [key]: clamp(value, 0, 1),
    });
  };

  return (
    <fieldset class="flex flex-col gap-2 rounded-md border border-slate-700/70 p-3">
      <legend class="px-1 text-sm text-slate-200">{p.title}</legend>
      <Slider
        label={`x1 (${p.curve.x1.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={p.curve.x1}
        onPreview={(value) => set("x1", value)}
      />
      <Slider
        label={`y1 (${p.curve.y1.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={p.curve.y1}
        onPreview={(value) => set("y1", value)}
      />
      <Slider
        label={`x2 (${p.curve.x2.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={p.curve.x2}
        onPreview={(value) => set("x2", value)}
      />
      <Slider
        label={`y2 (${p.curve.y2.toFixed(2)})`}
        min={0}
        max={1}
        step={0.01}
        value={p.curve.y2}
        onPreview={(value) => set("y2", value)}
      />
    </fieldset>
  );
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const Slider = (p: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onPreview: (value: number) => void;
}) => {
  return (
    <label class="flex flex-col gap-1">
      <span class="text-sm text-slate-300">{p.label}</span>
      <input
        type="range"
        min={p.min}
        max={p.max}
        step={p.step}
        value={p.value}
        onInput={(e) => p.onPreview(Number(e.currentTarget.value))}
      />
    </label>
  );
};
