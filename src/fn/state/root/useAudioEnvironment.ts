import { createEffect, createRoot, onCleanup, onMount } from "solid-js";

import { Wve } from "~/type/struct/Wve";

const createAudioEnvironment = () => {
  const state = Wve.create({
    state: "uninitialized" as "uninitialized" | "initialized",
    gain: 0.1,
  });

  let audioContext: AudioContext | undefined;
  const audioContextResolvers = Promise.withResolvers<AudioContext>();
  let masterGainNode: GainNode | undefined;
  let audioContextInitializeQueue: { consume: (environment: { context: AudioContext; connectFrom: (node: AudioNode) => void }) => void }[] = [];

  const connectFrom = (node: AudioNode) => {
    node.connect(masterGainNode!);
  };
  const initAudioContext = (newContext: AudioContext) => {
    audioContext = newContext;
    audioContextResolvers.resolve(newContext);
    masterGainNode = newContext.createGain();
    masterGainNode.gain.value = Wve.unwrap(state()).gain;
    masterGainNode.connect(newContext.destination);
    for (const { consume } of audioContextInitializeQueue) {
      void consume({ context: newContext, connectFrom });
    }
    audioContextInitializeQueue = [];
    state.set("state", "initialized");
  };

  onMount(() => {
    try {
      const newContext = new AudioContext();
      initAudioContext(newContext);
    } catch {
      // no-op
    }
    window.addEventListener("pointerdown", () => {
      if (!audioContext) {
        const newContext = new AudioContext();
        initAudioContext(newContext);
      }
      if (audioContext?.state === "suspended") {
        console.log("[AudioEnvironment] AudioContext resumed.");
        void audioContext.resume();
      }
    }, { once: true, passive: true });
  });

  const cleanup = async () => {
    try { masterGainNode?.disconnect(); } catch { /* no-op */ }
    masterGainNode = undefined;
    try { await audioContext?.close(); } catch { /* no-op */ }
    audioContext = undefined;
  };
  onCleanup(() => { void cleanup(); });

  const useContext = <Return>(consume: (environment: { context: AudioContext; connectFrom: (node: AudioNode) => void }) => Return | undefined) => {
    if (audioContext) return consume({ context: audioContext, connectFrom });
    audioContextInitializeQueue.push({ consume });
  };

  createEffect(() => { void state().gain; masterGainNode?.gain.setValueAtTime(state().gain, audioContext?.currentTime ?? 0); });

  return () => Wve.assign(state, {
    ready: audioContextResolvers.promise,
    useContext,
    get context() { return audioContext!; },
  });
};

/** @public */
export const useAudioEnvironment = createRoot(createAudioEnvironment);
