export type InteractionInputKind = "keydown" | "keyup" | "pointerdown" | "pointerup" | "pointermove";
export type InteractionModifier = "Ctrl" | "Shift" | "Alt" | "Meta";

export type InteractionNormalizedInput = {
  kind: InteractionInputKind;
  key?: string;
  modifiers?: readonly InteractionModifier[];
  pointerId?: number;
  distance?: number;
};

export type InteractionDecorateMeta = {
  label?: string;
  description?: string;
  priority?: number;
  platform?: "Win32" | "Darwin" | "Linux";
  deviceType?: string;
};

export type InteractionKeybindAstLeaf = {
  type: "leaf";
  input: InteractionNormalizedInput;
};

export type InteractionKeybindAstNode = {
  type: "or" | "and" | "serial" | "then";
  children: InteractionKeybindAst[];
};

export type InteractionKeybindAstDecorate = {
  type: "decorate";
  child: InteractionKeybindAst;
  metadata: InteractionDecorateMeta;
};

export type InteractionKeybindAst
  = | InteractionKeybindAstLeaf
  | InteractionKeybindAstNode
  | InteractionKeybindAstDecorate;

export type InteractionConflictResult
  = | { kind: "Disjoint" }
  | { kind: "Equal" }
  | { kind: "Superset" }
  | { kind: "Subset" }
  | { kind: "Ambiguous"; reason: string }
  | { kind: "Unreachable"; reason: string };

export type InteractionCompareOptions = {
  useDecorateSemanticFields?: boolean;
};

const MODIFIER_ORDER: readonly InteractionModifier[] = ["Ctrl", "Shift", "Alt", "Meta"];

const normalizeModifiers = (modifiers: readonly InteractionModifier[] | undefined) => {
  if (!modifiers || modifiers.length === 0) return undefined;
  const unique = new Set<InteractionModifier>(modifiers);
  return MODIFIER_ORDER.filter((modifier) => unique.has(modifier));
};

export const normalizeInput = (input: InteractionNormalizedInput): InteractionNormalizedInput => {
  const normalizedKey = input.key ? input.key.trim() : undefined;
  return {
    kind: input.kind,
    key: normalizedKey && normalizedKey.length > 0 ? normalizedKey : undefined,
    modifiers: normalizeModifiers(input.modifiers),
    pointerId: input.pointerId,
    distance: input.distance,
  };
};

const normalizeMetadata = (metadata: InteractionDecorateMeta): InteractionDecorateMeta => ({
  label: metadata.label,
  description: metadata.description,
  priority: metadata.priority,
  platform: metadata.platform,
  deviceType: metadata.deviceType,
});

const hashAst = (ast: InteractionKeybindAst): string => {
  switch (ast.type) {
    case "leaf":
      return JSON.stringify({ type: "leaf", input: ast.input });
    case "decorate":
      return JSON.stringify({ type: "decorate", metadata: normalizeMetadata(ast.metadata), child: hashAst(ast.child) });
    case "or":
    case "and":
    case "serial":
    case "then":
      return JSON.stringify({ type: ast.type, children: ast.children.map(hashAst) });
  }
};

export const canonicalizeKeybindAst = (
  ast: InteractionKeybindAst,
  options?: InteractionCompareOptions,
): InteractionKeybindAst => {
  switch (ast.type) {
    case "leaf":
      return {
        type: "leaf",
        input: normalizeInput(ast.input),
      };
    case "decorate": {
      const canonicalChild = canonicalizeKeybindAst(ast.child, options);
      if (!options?.useDecorateSemanticFields) {
        return canonicalChild;
      }
      return {
        type: "decorate",
        child: canonicalChild,
        metadata: normalizeMetadata(ast.metadata),
      };
    }
    case "or":
    case "and": {
      const children = ast.children
        .map((child) => canonicalizeKeybindAst(child, options))
        .sort((a, b) => hashAst(a).localeCompare(hashAst(b)));
      return {
        type: ast.type,
        children,
      };
    }
    case "serial":
    case "then": {
      const children = ast.children
        .map((child) => canonicalizeKeybindAst(child, options));
      return {
        type: ast.type,
        children,
      };
    }
  }
};

const flattenOr = (ast: InteractionKeybindAst): InteractionKeybindAst[] => {
  if (ast.type !== "or") return [ast];
  return ast.children.flatMap(flattenOr);
};

const getPriority = (ast: InteractionKeybindAst): number => {
  if (ast.type === "decorate") {
    return ast.metadata.priority ?? getPriority(ast.child);
  }
  return 0;
};

export const compareKeybindAst = (
  lhs: InteractionKeybindAst,
  rhs: InteractionKeybindAst,
  options?: InteractionCompareOptions,
): InteractionConflictResult => {
  const normalizedLhs = canonicalizeKeybindAst(lhs, options);
  const normalizedRhs = canonicalizeKeybindAst(rhs, options);
  const lhsHash = hashAst(normalizedLhs);
  const rhsHash = hashAst(normalizedRhs);

  if (lhsHash === rhsHash) return { kind: "Equal" };

  const lhsAlts = new Set(flattenOr(normalizedLhs).map(hashAst));
  const rhsAlts = new Set(flattenOr(normalizedRhs).map(hashAst));

  const lhsContainsAllRhs = [...rhsAlts].every((value) => lhsAlts.has(value));
  const rhsContainsAllLhs = [...lhsAlts].every((value) => rhsAlts.has(value));

  if (lhsContainsAllRhs && !rhsContainsAllLhs) {
    const lhsPriority = getPriority(lhs);
    const rhsPriority = getPriority(rhs);
    if (rhsPriority > lhsPriority) {
      return { kind: "Unreachable", reason: "rhs has higher priority while lhs structurally covers rhs" };
    }
    return { kind: "Superset" };
  }

  if (rhsContainsAllLhs && !lhsContainsAllRhs) {
    const lhsPriority = getPriority(lhs);
    const rhsPriority = getPriority(rhs);
    if (rhsPriority >= lhsPriority) {
      return { kind: "Unreachable", reason: "lhs is shadowed by rhs in declaration set" };
    }
    return { kind: "Subset" };
  }

  const hasIntersection = [...lhsAlts].some((value) => rhsAlts.has(value));
  if (!hasIntersection) {
    return { kind: "Disjoint" };
  }

  return {
    kind: "Ambiguous",
    reason: "definitions overlap partially but neither contains the other",
  };
};

export type InteractionLegacyBinding = string[];

const parseLegacyToken = (token: string): InteractionNormalizedInput => {
  const normalized = token.trim().toLowerCase();
  if (normalized === "pointer.down") return { kind: "pointerdown" };
  if (normalized === "pointer.up") return { kind: "pointerup" };
  if (normalized === "pointer.move") return { kind: "pointermove" };

  if (normalized.startsWith("keyboard.") && normalized.endsWith(".down")) {
    const key = normalized.replace(/^keyboard\./, "").replace(/\.down$/, "");
    return { kind: "keydown", key };
  }

  if (normalized.startsWith("keyboard.") && normalized.endsWith(".up")) {
    const key = normalized.replace(/^keyboard\./, "").replace(/\.up$/, "");
    return { kind: "keyup", key };
  }

  return { kind: "keydown", key: normalized };
};

export const fromLegacyBinding = (binding: InteractionLegacyBinding): InteractionKeybindAst => ({
  type: "then",
  children: binding.map((token) => ({
    type: "leaf",
    input: parseLegacyToken(token),
  })),
});
