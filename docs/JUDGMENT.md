# Judgment Eval: Edit a note

The seven checklist questions, extended to at least ten, specific to this
feature and this STYLE.md. Two grader columns. If the second grader is a
model, paste the prompt you gave it at the bottom and mark every disagreement.
Agreement under 80 percent is a finding about the rubric, logged in EVALS.md.

| # | Question (yes/no) | You | Grader 2 | Agree? |
|---|---|---|---|---|
| 1 | Only index.html, styles.css, app.js changed? | | No (worker.js, package.json, README, tests also changed) | |
| 2 | No innerHTML with user input anywhere in the diff? | | Yes | |
| 3 | No string-concatenated SQL in worker.js? | | Yes | |
| 4 | Every text color is a STYLE.md token? | | Yes (no new colors) | |
| 5 | Every font is a STYLE.md token? | | Yes (no new fonts) | |
| 6 | No new dependency in package.json? | | Yes | |
| 7 | Data goes through the Worker, not local state alone? | | Yes | |
| 8 | When the Worker returns 400, the reason is shown on the page? | | Yes by code reading (not run in a browser) | |
| 9 | Does Cancel restore the original text without a request? | | Yes by code reading (calls refresh, a GET) | |
| 10 | When a save fails, does the original text stay visible? | | Yes by code reading (re-renders from server only on success; on failure the input stays open) | |

Agreement: __ of __ (__%)

## Grader 2 prompt (if a model)
```
TODO: only if you use a model as grader 2. Note: the Grader 2 column above was filled by Claude, which also wrote the code, so it is not independent.
```
