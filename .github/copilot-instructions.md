# Project Rules

## Documentation

All documentation must be written in English unless explicitly specified otherwise.

## Git

### When Committing

#### Message Format

```text
(?:[emoji-prefix]) [overview-message]

Created with AI ([Model Name]) in [Platform Name]

[detailed-messages]
```

#### Message Examples

```text
:hammer_and_wrench: Fix type errors in `/script/plopfile.ts`

Created with AI (Claude 3.5 Sonnet) in Cursor
```

```text
Ensure `Wve#partial()` infers undefineable type when the target is a record

Created with AI (GPT-4.1) in GitHub Copilot
```

```text
Add note kind editing feature

Created with AI (Claude 3.5 Sonnet) in Cursor

- Add `<EditNote/>` component for note editing functionality
- Implement note kind selection with visual feedback
- Add lane selection for note placement
```

#### Message Rules

- Write commit messages in English.
- If a valid emoji-prefix is defined in `.gitmessage`, add it at the beginning of the first line.
- Use only one emoji-prefix.
- Use the emoji-prefix as a placeholder in the `:emoji:` format.
- Keep the first line concise whenever possible.
- Insert an empty line as the second line.
- Write the third line in the exact format: `Created with AI ([Model Name]) in [Platform Name]`.
- From the fourth line onward, add details or notes only when needed.
- Omit lines from the fourth line onward when the change is self-explanatory.
- Use technically accurate wording.
- Show Japanese translations of commit messages only in prompts, never in the commit message body itself.
- Do not include Japanese text in the commit message body.
