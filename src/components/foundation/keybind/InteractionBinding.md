# Keybind AST の設計検討

## 特徴

- 生レイヤでは BinaryTree として情報を持つ
- 定義内に手続きは持たず、すべて静的
- (ので、実際に実行することなく) 定義同士の比較で競合チェックできる
- Node に 子の評価条件の種別 などの付加情報を持つ
- Leaf に Input を持つ
- keydown,keyup,pointermove,pointerdown,pointerup などあらゆる Input を規定する

## 語の定義

| 語 | Description |
|---|---|
| Keybind | 特定の操作や、その組み合わせ |
| KeybindAst | Keybind の要求する操作を定義した Tree の全体、或いは一部分。 Node と Leaf から成る |
| InputEvent | Ctrlキー の keydown、 マウス右クリックを放す などの最小単位の Input |
| InputState | InputEvent の Stream から構築できる 現在の入力状態 |
| BindableInput | キー押下1つ、クリック1回 などの最小単位の Keybind |
| Action | Keybind によって飛び出される何らかの挙動。或いはその Keybind 具体 |

## 仕様

### Node の種別

- 真 は 「関連するActionが実行される」 の言い換え。
- 入力中 は 「対象BindableInputが実行中」の言い換え。キーを押下中、クリックボタン押下中、起点から指定量カーソルが移動済みなまま など。
- 完了 は 「対象KeybindAstが解決済み」の言い換え。Ctrl+Sを押下して放された後 など。

| Name | Description |
|---|---|---|
| Or | いずれかの Keybind が1つでも完了していれば 真 |
| And | 全ての Keybind が入力中なら 真 |
| Serial | 全ての Keybind が順番に入力中に移行すると 真 |
| Then | 全ての Keybind が順番に完了すると 真 |
| Decorate | Ast としては機能を持たない。描画時等に付加情報を提供する |

### 競合の種別

KeybindAst 同士を比較した際の結果として、下記のような種別が想定される。

- Disjoint: 競合なし
- Equal: 完全一致
- Superset: rhsがlhsを含む
- Subset: rhsはlhsに含まれる

## Implementation Spec (Static Conflict Analysis)

This section defines additional constraints required to implement static conflict checks deterministically.

### 1. Scope and Non-Scope

In scope:

- Normalization of bind definitions.
- Static comparison between two KeybindAst values.
- Conflict classification and tie-breaking policy.

Out of scope:

- Runtime stream processing of InputState.
- Gesture recognition based on probabilistic or learned models.
- UI rendering concerns.

### 2. Normalized Input Model

Define a canonical representation before comparing two definitions.

- `key` is based on logical key values (`KeyboardEvent.key`).
- Modifier set is normalized as an unordered set (`Ctrl|Shift|Alt|Meta`).
- Key repeat is ignored for conflict classification (treated as continued `inputing`).
- Pointer events include `pointerId` to avoid mixing concurrent touches.

Recommended normalized shape:

```ts
type InputKind = 'keydown' | 'keyup' | 'pointerdown' | 'pointerup' | 'pointermove'
type Modifier = 'Ctrl' | 'Shift' | 'Alt' | 'Meta'

type NormalizedInput = {
	kind: InputKind
	key?: string
	modifiers?: readonly Modifier[] // sorted unique
	pointerId?: number
	distance?: number
}
```

### 3. Temporal Semantics

Static判定を成立させるため、時間条件を定義に含める。

- `And`: all children are simultaneously `inputing`.
- `Serial`: children transition to `inputing` in order.
- `Then`: children transition to `done` in order.
- `Or`: any child reaches `done`.

Recommended constraints:

- `maxDelayMs`: max allowed delay between adjacent steps in `Serial`/`Then`.
- `simultaneousThresholdMs`: allowed timestamp gap for `And`.

Without explicit temporal constraints, many `Serial`/`Then` comparisons become ambiguous.

### 4. Canonicalization Rules

Comparison must use canonicalized trees.

1. Normalize each Leaf input (key names, modifier order, pointer fields).
2. Canonicalize commutative nodes (`Or`, `And`) by sorting children by stable hash.
3. Preserve child order for non-commutative nodes (`Serial`, `Then`).
4. Strip `Decorate` for pure conflict checks unless metadata is declared as conflict-relevant.

### 5. Conflict Classification Extension

Current categories are useful but insufficient for all static cases.
Add the following optional categories:

- Ambiguous: relation cannot be decided under current constraints.
- Unreachable: a bind is shadowed by stronger or earlier-resolved bind and cannot practically fire.

Suggested interpretation:

- Prefer `LeftCovers/RightCovers` naming in implementation for direction clarity.
- Keep `Superset/Subset` in docs if preferred terminology is fixed.

### 6. Resolution Policy (When Multiple Binds Match)

Define deterministic priority to avoid runtime surprises.

1. More specific bind wins.
2. If specificity is equal, higher explicit `priority` wins.
3. If still equal, earlier declaration order wins (or emit compile-time error).

Specificity examples:

- More modifiers > fewer modifiers.
- Longer `Then`/`Serial` chain > shorter chain.
- Device-constrained bind > device-agnostic bind.

### 7. Decorate Contract

`Decorate` should be split into two classes of metadata:

- Non-semantic metadata (label, description): ignored in conflict checks.
- Semantic metadata (priority, platform/device constraints): considered in conflict checks.

This distinction must be explicit to keep comparisons reproducible.

### 8. Validation Rules (Authoring Time)

Add static diagnostics when authoring KeybindAst:

- Empty `And`/`Or`/`Serial`/`Then` children.
- Duplicate children after canonicalization.
- Impossible sequences (for example, `keyup(X)` before any `keydown(X)`).
- Potentially unreachable binds caused by existing supersets with higher priority.

### 9. Test Matrix

Minimum recommended tests:

- Canonicalization equivalence (`Ctrl+Shift+A` order permutations).
- `And` vs `Serial` distinction under time thresholds.
- `Superset/Subset` direction correctness.
- `Ambiguous` outcomes when constraints are missing.
- `Unreachable` detection with priority and declaration-order ties.
- Multi-pointer isolation via `pointerId`.

### 10. Minimal Compare API Draft

```ts
type ConflictResult =
	| { kind: 'Disjoint' }
	| { kind: 'Equal' }
	| { kind: 'Superset' }
	| { kind: 'Subset' }
	| { kind: 'Ambiguous'; reason: string }
	| { kind: 'Unreachable'; reason: string }

type CompareOptions = {
	maxDelayMs?: number
	simultaneousThresholdMs?: number
	useDecorateSemanticFields?: boolean
}

declare function compareKeybindAst(
	lhs: KeybindAst,
	rhs: KeybindAst,
	options?: CompareOptions,
): ConflictResult
```

## Open Questions (To Freeze Before Coding)

- Should left/right modifier keys be distinguishable in core AST or only via `Decorate`?
- Should `Superset/Subset` be kept as-is, or renamed to directional terms in code?
- Is declaration order an allowed tie-breaker, or should equal-priority conflicts be hard errors?
- Are platform constraints part of semantic comparison by default?
