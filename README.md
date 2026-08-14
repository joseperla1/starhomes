# Starhomes
## Chatbot

Conversation content lives in `conversation-map.json`. No logic in the repo yet —
this is data only, pending widget integration.

**Structure**
- `inputs` — keyword arrays → output id. First match wins.
- `outputs` — text keys to join + option keys to show.
- `text` / `options` — reusable pieces.

Buttons and typed input both resolve to an output id, so both go through one handler.

**Gotchas**
- `inputs` is ordered specific→general. Don't reorder or prepend.
- `fallback` escalates on consecutive misses; reset the counter on any match.

Copy edits: `text` only. Bot name: `settings.botName` and the `greeting` string.