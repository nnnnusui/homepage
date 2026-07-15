import { ParentProps, untrack } from "solid-js";

import { createEnvelope, EnvelopeContext } from "./createEnvelope";
import { Editor } from "./Editor";
import { View } from "./View";

const Root = (p: ParentProps<Parameters<typeof createEnvelope>[0] | { api: ReturnType<typeof createEnvelope> }>) => {
  const api = "api" in p ? untrack(() => p.api) : createEnvelope(p);

  return (
    <EnvelopeContext.Provider value={api}>
      {p.children}
    </EnvelopeContext.Provider>
  );
};

/** @public */
export const Envelope = Object.assign(Root, {
  Editor,
  View,
});

/** @public */
export { createEnvelope, useEnvelopeContext } from "./createEnvelope";
