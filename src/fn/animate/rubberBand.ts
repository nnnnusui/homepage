/** @public */
export const rubberBand = (p: { delta: number; constant?: number; dimension?: number }): number => {
  const constant = () => p.constant ?? 0.5;
  const dimension = () => p.dimension ?? 300;
  const x = Math.abs(p.delta);

  return (
    Math.sign(p.delta)
    * ((constant() * x * dimension())
      / (dimension() + constant() * x))
  );
};
