---
applyTo: "**/*.module.css"
---

## CSS-Modules Class Naming

All class names in CSS-Modules files must use **PascalCase** naming convention.

### Guidelines

- **PascalCase** for all classes: `.Container`, `.GridOverlay`, `.NoteResizeHandle`
- **PascalCase for component root classes**: `.PianoRoll`, `.Keyboard`, `.ThemeColorPalette`
- **PascalCase with prefix for state classes**: `.IsHovered`, `.IsActive`, `.IsBlackKey`
- **Nest selector/state styles with `&:selector`** inside the owning class when applying selector-based or conditional variants

### Examples

✅ **Correct:**
```css
.PianoRoll { }
.GridContainer { }
.NoteRect { }
.IsBlackKey { }
.NoteResizeHandle { }
```

❌ **Incorrect:**
```css
.pianoRoll { }
.gridContainer { }
.noteRect { }
.isBlackKey { }
.piano-roll { }
.grid-container { }
```

### Selector and Conditional Class Nesting

For selector-based styles and conditionally applied class variants, nest rules under the component class using `&:selector` syntax.

✅ **Correct:**
```css
.Button {
	&:hover { }
	&:focus-visible { }
	&:where(.IsActive) { }
}
```

❌ **Incorrect:**
```css
.Button:hover { }
.Button:focus-visible { }
.Button.IsActive { }
```

### Rationale

- Provides clear visual distinction for CSS-Modules class names
- Aligns with the TypeScript/React component naming conventions (PascalCase for components)
- Improves readability and prevents naming conflicts with global CSS
- Consistent with the project's existing CSS-Modules files
