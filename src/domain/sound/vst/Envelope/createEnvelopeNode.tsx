import type { EnvelopeBezier } from "./createEnvelope";
import { createEffect, onCleanup, onMount } from "solid-js";

import { useAudioEnvironment } from "~/fn/state/root/useAudioEnvironment";
import { Wve } from "~/type/struct/Wve";

export const createEnvelopeNode = (p: {
  envelope: EnvelopeNodeEnvelope;
}) => {
  const audioEnv = useAudioEnvironment();

  let audioWorkletNode: AudioWorkletNode | undefined;
  let gainNode: GainNode | undefined;
  const envelopeNodeResolvers = Promise.withResolvers<GainNode>();
  onMount(() => {
    audioEnv.useContext(async (context) => {
      if (audioWorkletNode && gainNode) return gainNode;
      const moduleUrl = getEnvelopeModuleUrl();
      await context.audioWorklet.addModule(moduleUrl);

      gainNode = context.createGain();
      gainNode.gain.setValueAtTime(0, context.currentTime);

      audioWorkletNode = new AudioWorkletNode(context, ENVELOPE_PROCESSOR_NAME, {
        numberOfInputs: 0,
        numberOfOutputs: 1,
        outputChannelCount: [1],
        processorOptions: {
          envelope: normalizeEnvelope(p.envelope),
        },
      });

      audioWorkletNode.connect(gainNode.gain);
      envelopeNodeResolvers.resolve(gainNode);
    });
  });

  const updateEnvelope = (envelope: EnvelopeNodeEnvelope) => {
    audioWorkletNode?.port.postMessage({
      kind: "setEnvelope",
      value: normalizeEnvelope(envelope),
    });
  };
  createEffect(() => { void Wve.truck(p.envelope); updateEnvelope(p.envelope); });

  const noteOn = (atSec = audioEnv.context.currentTime) => {
    audioWorkletNode?.port.postMessage({ kind: "noteOn", atSec });
  };

  const noteOff = (atSec = audioEnv.context.currentTime) => {
    audioWorkletNode?.port.postMessage({ kind: "noteOff", atSec });
  };

  onCleanup(() => {
    try { audioWorkletNode?.disconnect(); } catch { /* no-op */ }
    audioWorkletNode?.port.close();
    try { gainNode?.disconnect(); } catch { /* no-op */ }
  });

  return Object.assign(() => gainNode!, {
    ready: envelopeNodeResolvers.promise,
    updateEnvelope,
    noteOn,
    noteOff,
  });
};

let cachedModuleUrl: string | undefined;

const getEnvelopeModuleUrl = () => {
  if (cachedModuleUrl) return cachedModuleUrl;
  const source = createEnvelopeProcessorSource();
  const blob = new Blob([source], { type: "application/javascript" });
  cachedModuleUrl = URL.createObjectURL(blob);
  return cachedModuleUrl;
};

const normalizeEnvelope = (envelope: EnvelopeNodeEnvelope): EnvelopeNodeEnvelope => {
  console.log("normalizeEnvelope", envelope);
  return {
    delay: Math.max(0, envelope.delay),
    attack: Math.max(0.001, envelope.attack),
    hold: Math.max(0, envelope.hold),
    decay: Math.max(0.001, envelope.decay),
    sustain: clamp(envelope.sustain, 0, 1),
    release: Math.max(0.001, envelope.release),
    attackCurve: normalizeCurve(envelope.attackCurve),
    decayCurve: normalizeCurve(envelope.decayCurve),
    sustainCurve: normalizeCurve(envelope.sustainCurve),
  };
};

const normalizeCurve = (curve: EnvelopeBezier): EnvelopeBezier => {
  return {
    x1: clamp(curve.x1, 0, 1),
    y1: clamp(curve.y1, 0, 1),
    x2: clamp(curve.x2, 0, 1),
    y2: clamp(curve.y2, 0, 1),
  };
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ENVELOPE_PROCESSOR_NAME = "envelope-node-processor";

const createEnvelopeProcessorSource = () => {
  return `
class EnvelopeNodeProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    const p = options?.processorOptions ?? {};
    this.envelope = this.normalizeEnvelope(p.envelope ?? {});

    this.noteOnAtSec = Number.NEGATIVE_INFINITY;
    this.noteOffAtSec = Number.POSITIVE_INFINITY;
    this.releaseStartLevel = 0;

    this.port.onmessage = (event) => {
      const data = event.data;
      if (!data) return;
      if (data.kind === "setEnvelope") {
        this.envelope = this.normalizeEnvelope(data.value ?? {});
      }
      if (data.kind === "noteOn") {
        const atSec = Number.isFinite(data.atSec) ? data.atSec : currentTime;
        this.noteOnAtSec = atSec;
        this.noteOffAtSec = Number.POSITIVE_INFINITY;
      }
      if (data.kind === "noteOff") {
        const atSec = Number.isFinite(data.atSec) ? data.atSec : currentTime;
        this.releaseStartLevel = this.valueAt(atSec);
        this.noteOffAtSec = atSec;
      }
    };
  }

  normalizeEnvelope(raw) {
    return {
      delay: Math.max(0, raw.delay ?? 0),
      attack: Math.max(0.001, raw.attack ?? 0.01),
      hold: Math.max(0, raw.hold ?? 0),
      decay: Math.max(0.001, raw.decay ?? 0.1),
      sustain: this.clamp(raw.sustain ?? 0.5, 0, 1),
      release: Math.max(0.001, raw.release ?? 0.2),
      attackCurve: this.normalizeCurve(raw.attackCurve ?? { x1: 0.25, y1: 0.1, x2: 0.4, y2: 1 }),
      decayCurve: this.normalizeCurve(raw.decayCurve ?? { x1: 0.15, y1: 0, x2: 0.45, y2: 1 }),
      sustainCurve: this.normalizeCurve(raw.sustainCurve ?? { x1: 0.25, y1: 0.25, x2: 0.75, y2: 0.75 }),
    };
  }

  normalizeCurve(curve) {
    return {
      x1: this.clamp(curve.x1 ?? 0, 0, 1),
      y1: this.clamp(curve.y1 ?? 0, 0, 1),
      x2: this.clamp(curve.x2 ?? 1, 0, 1),
      y2: this.clamp(curve.y2 ?? 1, 0, 1),
    };
  }

  clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  lerp(a, b, t) {
    return a + (b - a) * t;
  }

  cubicBezier(p0, p1, p2, p3, t) {
    const mt = 1 - t;
    return (mt ** 3) * p0 + 3 * (mt ** 2) * t * p1 + 3 * mt * (t ** 2) * p2 + (t ** 3) * p3;
  }

  cubicBezierProgress(curve, x) {
    const xTarget = this.clamp(x, 0, 1);
    const x1 = this.clamp(curve.x1, 0, 1);
    const y1 = this.clamp(curve.y1, 0, 1);
    const x2 = this.clamp(curve.x2, 0, 1);
    const y2 = this.clamp(curve.y2, 0, 1);

    let low = 0;
    let high = 1;
    let t = xTarget;

    for (let i = 0; i < 8; i += 1) {
      const xEstimate = this.cubicBezier(0, x1, x2, 1, t);
      if (Math.abs(xEstimate - xTarget) < 0.0005) break;
      if (xEstimate < xTarget) low = t;
      else high = t;
      t = (low + high) * 0.5;
    }

    return this.cubicBezier(0, y1, y2, 1, t);
  }

  valueWithoutRelease(atSec) {
    if (!Number.isFinite(this.noteOnAtSec) || atSec < this.noteOnAtSec) return 0;

    const env = this.envelope;
    const elapsed = atSec - this.noteOnAtSec;
    const delayEnd = env.delay;
    const attackEnd = delayEnd + env.attack;
    const holdEnd = attackEnd + env.hold;
    const decayEnd = holdEnd + env.decay;
    const settleDuration = Math.max(0.04, env.release * 0.5);
    const settleEnd = decayEnd + settleDuration;
    const sustainSettle = this.lerp(1, env.sustain, 0.65);

    if (elapsed <= delayEnd) return 0;

    if (elapsed <= attackEnd) {
      const t = (elapsed - delayEnd) / Math.max(env.attack, 0.001);
      const eased = this.cubicBezierProgress(env.attackCurve, t);
      return this.lerp(0, 1, eased);
    }

    if (elapsed <= holdEnd) return 1;

    if (elapsed <= decayEnd) {
      const t = (elapsed - holdEnd) / Math.max(env.decay, 0.001);
      const eased = this.cubicBezierProgress(env.decayCurve, t);
      return this.lerp(1, sustainSettle, eased);
    }

    if (elapsed <= settleEnd) {
      const t = (elapsed - decayEnd) / Math.max(settleDuration, 0.001);
      const eased = this.cubicBezierProgress(env.sustainCurve, t);
      return this.lerp(sustainSettle, env.sustain, eased);
    }

    return env.sustain;
  }

  valueAt(atSec) {
    if (!Number.isFinite(this.noteOnAtSec) || atSec < this.noteOnAtSec) return 0;

    if (atSec < this.noteOffAtSec) {
      return this.valueWithoutRelease(atSec);
    }

    const releaseElapsed = atSec - this.noteOffAtSec;
    const t = this.clamp(releaseElapsed / Math.max(this.envelope.release, 0.001), 0, 1);
    return this.lerp(this.releaseStartLevel, 0, t);
  }

  process(_inputs, outputs) {
    const output = outputs[0]?.[0];
    if (!output) return true;

    const frameStartSec = currentFrame / sampleRate;
    for (let i = 0; i < output.length; i += 1) {
      const sec = frameStartSec + i / sampleRate;
      output[i] = this.valueAt(sec);
    }

    return true;
  }
}

registerProcessor("${ENVELOPE_PROCESSOR_NAME}", EnvelopeNodeProcessor);
`;
};

export type EnvelopeNodeEnvelope = {
  delay: number;
  attack: number;
  hold: number;
  decay: number;
  sustain: number;
  release: number;
  attackCurve: EnvelopeBezier;
  decayCurve: EnvelopeBezier;
  sustainCurve: EnvelopeBezier;
};
