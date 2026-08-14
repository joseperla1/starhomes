# Starhomes
## Chatbot

Conversation content lives in `conversation-map.json`. Data only — no logic in
the repo yet.

**Sections**
- `text` / `options` — reusable strings and buttons
- `outputs` — what to say: text keys to join + option keys to show
- `inputs` — keyword arrays → output id
- `globalInputs` — checked before everything else, so exits work mid-flow
- `flows` — ordered steps, each saving an answer to a named slot
- `prefill` — fills slots from the opening message
- `handlers` — contract for JS functions the map calls

Buttons and typed input both resolve to an output id — one handler path.

**Gotchas**
- `inputs` is ordered specific→general. Don't reorder or prepend.
- `globalInputs` must be tested before step parsing, or "never mind" gets read
  as a bedroom count.
- `fallback` escalates on consecutive misses; reset on any match.

**Parse types:** `choice`, `number` ($, commas, "2k"), `text`, `bedrooms`
("studio" → 0).

**Open:** `searchListings` signature is provisional — confirm against the
implementation. `relaxed: true` assumes it can loosen budget constraints.

Copy edits: `text` only. Bot name: `settings.botName` + the `greeting` string.