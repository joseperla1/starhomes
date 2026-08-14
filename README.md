# Starhomes
## Chatbot

Conversation content lives in `conversation-map.json`. Logic lives in `chat-engine.js`.

### Files

| File | Purpose |
|------|---------|
| `conversation-map.json` | All content and routing — no logic |
| `chat-engine.js` | Chat engine; exposes `window.StarChat` |
| `index.html` | Chat UI (no bundler, no npm) |

---

### conversation-map.json sections

- `text` / `options` — reusable strings and buttons
- `outputs` — what to say: text keys to join + option keys to show
- `inputs` — keyword arrays → output id (ordered specific→general, do not reorder)
- `globalInputs` — checked before everything else, so "never mind" exits mid-flow correctly
- `flows` — ordered steps, each saving an answer to a named slot
- `prefill` — fills slots from the user's opening message so redundant steps are skipped
- `handlers` — contract for JS functions the map can call (e.g. `searchListings`)
- `fallback` — ordered array; escalates on consecutive misses, resets on any match

**Parse types:** `choice`, `number` ($, commas, "2k"), `text`, `bedrooms` ("studio" → 0).

---

### chat-engine.js

Plain script, no imports, no dependencies. Attach it with a `<script>` tag before your UI script.

**Usage**

```js
const chat = window.StarChat.createChat(map, {
  searchListings(answers) { return [/* { type, price, area } */]; }
});
```

`handlers` is optional — omitting `searchListings` routes to the `onEmpty` output instead of crashing.

**API**

| Method | Returns | Notes |
|--------|---------|-------|
| `.start()` | Response | First output defined in `settings.firstOutput` |
| `.send(text)` | Response | Resolves free-text input |
| `.choose(key)` | Response | Resolves a clicked option; throws on unknown key |
| `.reset()` | Response | Clears answers + flow state, then calls `.start()` |

**Response shape**

```js
{
  message:  string,        // text keys joined by settings.joinWith
  listings: array | null,  // populated when output has renderListings and results exist
  followUp: string | null, // resolved from output.then
  options:  [{ key, label }], // key is opaque — pass back to .choose()
  event:    string | null
}
```

**Input resolution order** (load-bearing — do not change)

1. `globalInputs` — always checked first, even mid-flow
2. If inside a flow — parsed against the current step
3. `inputs` — substring match, array order, first hit wins
4. No match → `fallback`

**Flow behaviour**

- `startFlow` on an output begins that flow at `firstStep`.
- `prefillFromInput: true` runs `map.prefill` against the triggering message and skips already-filled steps.
- Steps with `optional: true` accept null and advance; required steps re-ask on parse failure without incrementing the fallback counter.
- `next: null` triggers `onComplete`, which calls the handler and routes to `onResults` or `onEmpty`.

---

### Editing content

Copy edits: `text` keys only.
Bot name: `settings.botName` and the `greeting` text key.
`searchListings` receives `{ mode, budget, bedrooms, area, relaxed }` — `relaxed: true` signals a loosened budget search.
