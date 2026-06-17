export type KeybindAstLeaf = {
  type: "leaf";
  input: KeybindAstNormalizedInput;
};

export type KeybindAstNode = {
  type: "or" | "and" | "serial" | "then";
  children: KeybindAst[];
};

export type KeybindAstDecorate = {
  type: "decorate";
  child: KeybindAst;
  metadata: KeybindAstDecorateMeta;
};

export type KeybindAst
  = | KeybindAstLeaf
  | KeybindAstNode
  | KeybindAstDecorate;

export type KeybindAstNormalizedInput = {
  // kind: InteractionInputKind;
  key?: string;
  // modifiers?: readonly InteractionModifier[];
  // pointerId?: number;
  // distance?: number;
};

export type KeybindAstDecorateMeta = {
  label?: string;
  description?: string;
  priority?: number;
  // platform?: "Win32" | "Darwin" | "Linux";
  // deviceType?: string;
};

export const KeybindAst = (() => {
  return {
    leaf: (input: KeybindAstNormalizedInput) => ({ type: "leaf", input } as KeybindAstLeaf),
    or: (children: KeybindAst[]) => ({ type: "or", children } as KeybindAstNode),
    and: (children: KeybindAst[]) => ({ type: "and", children } as KeybindAstNode),
    serial: (children: KeybindAst[]) => ({ type: "serial", children } as KeybindAstNode),
    then: (children: KeybindAst[]) => ({ type: "then", children } as KeybindAstNode),
    decorate: (child: KeybindAst, metadata: KeybindAstDecorateMeta) => ({ type: "decorate", child, metadata } as KeybindAstDecorate),
    compare: (lhs: KeybindAst, rhs: KeybindAst) => compareKeybindAst(lhs, rhs),
  };
})();

// export const x = (
//   lhs: KeybindAst,
//   rhs: KeybindAst,
//   // options?: InteractionCompareOptions,
// ): KeybindAstRelation => {
//   if (false) {
//   } else if (lhs.type === "leaf" && rhs.type === "leaf") {
//     if (lhs.input.key === rhs.input.key) return { kind: "Equal" };
//     return { kind: "Disjoint" };
//   } else if (lhs.type === "or" && rhs.type === "or") {
//     if (lhs.children)
//   }
// };

export const compareKeybindAst = (
  lhs: KeybindAst,
  rhs: KeybindAst,
  // options?: InteractionCompareOptions,
): KeybindAstRelation => {
  const normalizedLhs = canonicalizeKeybindAst(lhs);
  const normalizedRhs = canonicalizeKeybindAst(rhs);
  const lhsHash = hashAst(normalizedLhs);
  const rhsHash = hashAst(normalizedRhs);

  if (lhsHash === rhsHash) return { kind: "Equal" };

  const lhsAlts = new Set(flattenOr(normalizedLhs).map(hashAst));
  const rhsAlts = new Set(flattenOr(normalizedRhs).map(hashAst));

  const lhsContainsAllRhs = [...rhsAlts].every((value) => lhsAlts.has(value));
  const rhsContainsAllLhs = [...lhsAlts].every((value) => rhsAlts.has(value));

  if (lhsContainsAllRhs && rhsContainsAllLhs) {
    return { kind: "Equal" };
  }

  if (lhsContainsAllRhs && !rhsContainsAllLhs) {
    const lhsPriority = getPriority(lhs);
    const rhsPriority = getPriority(rhs);
    if (rhsPriority > lhsPriority) {
      return { kind: "Unreachable", reason: "rhs has higher priority while lhs structurally covers rhs" };
    }
    return { kind: "Subset" };
  }

  if (rhsContainsAllLhs && !lhsContainsAllRhs) {
    const lhsPriority = getPriority(lhs);
    const rhsPriority = getPriority(rhs);
    if (rhsPriority >= lhsPriority) {
      return { kind: "Unreachable", reason: "lhs is shadowed by rhs in declaration set" };
    }
    return { kind: "Superset" };
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

const canonicalizeKeybindAst = (ast: KeybindAst): KeybindAst => {
  switch (ast.type) {
    case "leaf":
      return ast;
    case "decorate":
      return canonicalizeKeybindAst(ast.child);
    case "or":
    case "and": {
      const children = ast.children
        .map((child) => canonicalizeKeybindAst(child))
        .sort((a, b) => hashAst(a).localeCompare(hashAst(b)));
      return {
        type: ast.type,
        children,
      };
    }
    case "serial":
    case "then": {
      return {
        type: ast.type,
        children: ast.children.map((child) => canonicalizeKeybindAst(child)),
      };
    }
  }
};

export type KeybindAstRelation
  = { kind: "Disjoint" }
  | { kind: "Equal" }
  | { kind: "Subset" }
  | { kind: "Superset" }
  | { kind: "Overlap" }
  | { kind: "Ambiguous"; reason: string }
  | { kind: "Unreachable"; reason: string };

const hashAst = (ast: KeybindAst): string => {
  switch (ast.type) {
    case "leaf":
      return JSON.stringify({ type: "leaf", input: ast.input });
    case "decorate":
      return hashAst(ast.child);
    case "or":
    case "and":
    case "serial":
    case "then":
      return JSON.stringify({ type: ast.type, children: ast.children.map(hashAst) });
  }
};

const flattenOr = (ast: KeybindAst): KeybindAst[] => {
  if (ast.type === "or") {
    return ast.children.flatMap(flattenOr);
  }
  if (ast.type === "and") {
    // For and nodes, expand all or-alternatives within children and compute cartesian product
    const childAlternatives = ast.children.map(flattenOr);
    return cartesianProduct(childAlternatives);
  }
  return [ast];
};

const cartesianProduct = (alternatives: KeybindAst[][]): KeybindAst[] => {
  if (alternatives.length === 0) return [];
  if (alternatives.length === 1) return alternatives[0] ?? [];

  const [first, ...rest] = alternatives;
  const restProduct = cartesianProduct(rest);
  return first?.flatMap((f) =>
    restProduct.map((r) => ({
      type: "and",
      children: [f, r],
    } as KeybindAst)),
  ) ?? [];
};

const getPriority = (ast: KeybindAst): number => {
  if (ast.type === "decorate") {
    return ast.metadata.priority ?? getPriority(ast.child);
  }
  return 0;
};
