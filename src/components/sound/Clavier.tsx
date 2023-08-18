import clsx from "clsx";
import { Component, For, createEffect, createSignal, onCleanup } from "solid-js";

import { AudioVisualizer } from "./AudioVisualizer";
import styles from "./Clavier.module.styl";

import { useKeys } from "@/fn/state/root/keys";

export const Clavier: Component = () => {
  const context = new AudioContext();
  const analyser = new AnalyserNode(context, {
    fftSize: 4096,
  });
  const gainNode = new GainNode(context, {
    gain: 0.1,
  });
  gainNode
    .connect(analyser)
    .connect(context.destination);

  onCleanup(() => context.suspend());

  const toneLayout = {
    rowDiff: -5,
    columnDiff: 2,
    center: {
      row: 2,
      column: 4,
    },
  };
  const getPitch = (row: number, column: number) => {
    const { rowDiff, columnDiff, center } = toneLayout;
    const shift = center.row * rowDiff + center.column * columnDiff;
    const pitch = -shift + row * rowDiff + column * columnDiff;
    return pitch;
  };
  const [waveType, setWaveType] = createSignal<OscillatorType>("triangle");

  const [keys, setKeys] = useKeys;
  return (
    <div
      class={styles.Clavier}
    >
      <div
        class={styles.Control}
      >
        <select
          value={waveType()}
          onInput={(e) => setWaveType(e.currentTarget.value as OscillatorType)}
        >
          <For each={oscillatorTypeList}>{(fftSize) =>
            <option>{fftSize}</option>
          }</For>
        </select>
        <select
          value={analyser.fftSize}
          onInput={(e) => analyser.fftSize = Number(e.currentTarget.value)}
        >
          <For each={fftSizeList}>{(fftSize) =>
            <option>{fftSize}</option>
          }</For>
        </select>
        <AudioVisualizer analyser={analyser} />
      </div>
      <div
        class={styles.KeyBoard}
      >
        <For each={keyMap}>{(keyLine, row) =>
          <div>
            <For each={keyLine}>{(key, column) =>
              <Key
                pitch={getPitch(row(), column())}
                waveType={waveType()}
                onPress={!!keys.onPresses[key]}
                setOnPress={(state) => setKeys.set("onPresses", key, state)}
                audioContext={context}
                oscillatorConnectTarget={gainNode}
              />
            }</For>
          </div>
        }</For>
      </div>
    </div>
  );
};

const keyMap = [
  "1234567890-=\\",
  "qwertyuiop[]",
  "asdfghjkl;'",
  "zxcvbnm,./",
].map((it) => it.split(""));
const tones = [
  "A","A#","B","C","C#","D","D#","E","F","F#","G","G#",
];
const getHertz = (pitch: number) => {
  const reference = 440.0;
  return reference * Math.pow(2, pitch / 12.0);
};
const fftSizeList = [
  32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768,
] as const;
const oscillatorTypeList = [
  "sine", "square", "triangle", "sawtooth", //"custom",
] as const;

type Key = {
  pitch: number
  waveType: OscillatorType
  onPress: boolean
  setOnPress: (state: boolean) => void
  audioContext: AudioContext
  oscillatorConnectTarget: AudioNode
}
const Key: Component<Key> = (props) => {
  const [getOscillator, setOscillator] = createSignal<OscillatorNode>();

  const onPress = () => props.onPress;
  const pitch = () => props.pitch;
  const waveType = () => props.waveType;
  const display = () => tones.at(pitch() % tones.length) ?? "";
  const audioContext = () => props.audioContext;
  const oscillatorConnectTarget = () => props.oscillatorConnectTarget;
  const hertz = () => getHertz(pitch());

  createEffect(() => {
    if(onPress()) {
      const oscillator = new OscillatorNode(audioContext(), {
        type: waveType(),
        frequency: hertz(),
      });
      oscillator.connect(oscillatorConnectTarget());
      setOscillator(oscillator);
      oscillator.start();
    } else {
      const oscillator = getOscillator();
      if (!oscillator) return;
      oscillator.stop();
    }
  });

  return (
    <button
      class={clsx(
        styles.Key,
        onPress() && styles.OnPress,
      )}
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId);
        props.setOnPress(true);
      }}
      onPointerUp={() => props.setOnPress(false)}
      onPointerCancel={() => props.setOnPress(false)}
    >
      {display()}
    </button>
  );
};
