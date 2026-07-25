import { ParentProps, splitProps, untrack } from "solid-js";

import { Polymorphic, PolymorphicAs, PolymorphicProps } from "~/components/foundation/render/Polymorphic";
import { createEnvelope, EnvelopeContext } from "./createEnvelope";
import { Editor } from "./Editor";
import { Scaler } from "./Scaler";
import { View } from "./View";

const Root = <As extends PolymorphicAs>(_p: PolymorphicProps<As, ParentProps<Parameters<typeof createEnvelope>[0] | { api: ReturnType<typeof createEnvelope> }>>) => {
  const [p, wrappedProps] = splitProps(_p, ["as"]);
  const api = "api" in _p ? untrack(() => _p.api) : createEnvelope(_p);

  return (
    <EnvelopeContext.Provider value={api}>
      <Polymorphic {...wrappedProps}
        as={p.as ?? ("class" in wrappedProps ? "div" : undefined)}
      >
        {wrappedProps.children}
      </Polymorphic>
    </EnvelopeContext.Provider>
  );
};

/** @public */
export const Envelope = Object.assign(Root, {
  Editor,
  Scaler,
  View,
});

/** @public */
export { createEnvelope, useEnvelopeContext } from "./createEnvelope";
