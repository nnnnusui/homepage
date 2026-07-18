import { onCleanup } from "solid-js";

export const createThrottleParAnimationFrame = <Args extends unknown[]>(
  callback: (...args: Args) => (timeMs: number) => void,
) => {
  let rafId: number | undefined;
  let latestArgs: Args | undefined;

  const run = (...args: Args) => {
    latestArgs = args;
    if (rafId != null) return;

    rafId = requestAnimationFrame((timeMs) => {
      rafId = undefined;
      const nextArgs = latestArgs;
      latestArgs = undefined;
      if (!nextArgs) return;
      callback(...nextArgs)(timeMs);
    });
  };

  const cancel = () => {
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = undefined;
    }
    latestArgs = undefined;
  };

  const flush = () => {
    const nextArgs = latestArgs;
    cancel();
    if (!nextArgs) return;
    rafId = requestAnimationFrame(callback(...nextArgs));
  };

  onCleanup(() => {
    flush();
  });

  return ({
    run,
    cancel,
    flush,
  });
};
