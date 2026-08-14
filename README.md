# Starhomes
## Chatbot

### File structure

```
js/
  chat-engine.js      — conversation engine; exposes window.StarChat (no DOM, no fetch)
  chatbot.js          — widget UI; wires DOM to window.StarChat
assets/
  conversation-map.json   — source of truth for all content and routing (reference copy)
  star-homes-logo.png
css/
  styles.css
  chatbot.css
index.html
```

---

### conversation-map.json

All content and routing — no logic. Sections:

- `text` / `options` — reusable strings and buttons
- `outputs` — what to say: text keys to join + option keys to show
- `inputs` — keyword arrays → output id (ordered specific→general, do not reorder)
- `globalInputs` — always checked first so "never mind" exits mid-flow correctly
- `flows` — ordered steps, each saving an answer to a named slot
- `prefill` — fills slots from the user's opening message, skipping redundant steps
- `fallback` — ordered array; escalates on consecutive misses, resets on any match

**Parse types:** `choice`, `number` ($, commas, "2k"), `text`, `bedrooms` ("studio" → 0).

> The JSON is inlined into `js/chatbot.js` as a JS object so no server or fetch is needed — the page works from the filesystem (`file://`). When you edit `conversation-map.json`, copy the changes into `chatbot.js` as well.

---

### chat-engine.js — `window.StarChat`

Plain script, no imports, no dependencies. Must be loaded before `chatbot.js`.

**Usage**

```js
const chat = window.StarChat.createChat(map, {
  searchListings(answers) { return [/* { type, price, area } */]; }
});
```

The `handlers` argument is optional — if `searchListings` is missing or throws, the engine routes to the `onEmpty` output instead of crashing.

**API**

| Method | Returns | Notes |
|--------|---------|-------|
| `.start()` | Response | First output from `settings.firstOutput` |
| `.send(text)` | Response | Resolves free-text input |
| `.choose(key)` | Response | Resolves a clicked option; throws on unknown/stale key |
| `.reset()` | Response | Clears answers + flow state, then calls `.start()` |

**Response shape**

```js
{
  message:  string,           // text keys joined by settings.joinWith
  listings: array | null,     // populated when handler returns results
  followUp: string | null,    // resolved from output.then
  options:  [{ key, label }], // key is opaque — pass back to .choose()
  event:    string | null
}
```

**Input resolution order** (load-bearing — do not change)

1. `globalInputs` — always first, even mid-flow
2. If inside a flow — parsed against the current step
3. `inputs` — substring match, array order, first hit wins
4. No match → `fallback`

**Flow behaviour**

- `startFlow` on an output begins the flow at `firstStep`
- `prefillFromInput: true` runs `map.prefill` against the triggering message and skips already-filled steps
- Required steps re-ask on parse failure without incrementing the fallback counter
- `next: null` triggers `onComplete`, which calls the handler and routes to `onResults` or `onEmpty`

---

### chatbot.js — widget UI

Self-contained IIFE. Builds and appends the full widget DOM on load — nothing in `index.html` for the chat UI. Initialises via `window.StarChat.createChat(map)`.

**Key behaviours**

- **First visit** — auto-opens after 1 s and calls `chat.start()`
- **Page refresh** — restores message history and quick-reply buttons from `sessionStorage`; quick-reply keys that were mid-flow and are now stale fall back to `chat.send(label)` automatically
- **Returning user** (tracked via `localStorage`) — personalised greeting on re-open
- **Listings** — rendered as one chat bubble per result (`type · area · $price`)
- **followUp** — displayed as a second bot message 600 ms after the first

---

### Editing content

Copy edits: `text` keys in `assets/conversation-map.json`, then sync into `chatbot.js`.
Bot name: `settings.botName` and the `greeting` text key.
`searchListings` receives `{ mode, budget, bedrooms, area, relaxed }` — `relaxed: true` signals a loosened budget search.
