/** @public */
export const playBounceBack = (p: {
  from: number;
  to: number;
  setter: (value: number) => void;
  cancelBy?: () => boolean;
}) => {
  const startTime = performance.now();
  const duration = 300; // ms
  const startScrollLeft = p.from;
  const toPositive = p.from < p.to;
  const diff = Math.abs(p.to - p.from);

  const animate = (currentTime: number) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easeProgress = 1 - (1 - progress) ** 3; // ease-out cubic
    const newScrollLeft = startScrollLeft + diff * easeProgress * (toPositive ? 1 : -1);

    p.setter(newScrollLeft);

    if (progress < 1 && !(p.cancelBy && p.cancelBy())) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};
