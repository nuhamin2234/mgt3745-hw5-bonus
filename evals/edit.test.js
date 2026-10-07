// evals/edit.test.js
// Code eval for "Edit a note". Run with:   API=https://... npm test
// E4 (server unreachable) is a page behavior, checked by hand; see JUDGMENT.md.
import { test } from "node:test";
import assert from "node:assert/strict";

const API = process.env.API;
if (!API) throw new Error("Set API to your deployed Worker URL: API=https://... npm test");

const json = { "content-type": "application/json" };

async function createEntry(text) {
  await fetch(API + "/entries", { method: "POST", headers: json, body: JSON.stringify({ text }) });
  const list = await (await fetch(API + "/entries")).json();
  return list.findLast(e => e.text === text);
}

test("E1: WHEN the user saves an edited note, THE SYSTEM SHALL update the stored text (PUT then GET shows it)", async () => {
  const original = "edit-before-" + Date.now();
  const entry = await createEntry(original);
  const edited = "edit-after-" + Date.now();
  const res = await fetch(API + "/entries/" + entry.id, { method: "PUT", headers: json, body: JSON.stringify({ text: edited }) });
  assert.ok(res.status === 200 || res.status === 204);
  const list = await (await fetch(API + "/entries")).json();
  assert.equal(list.find(e => e.id === entry.id).text, edited);
});

test("E2: IF the edited text is empty, THEN THE SYSTEM SHALL reject it with a reason and keep the old text", async () => {
  const original = "edit-keep-" + Date.now();
  const entry = await createEntry(original);
  const res = await fetch(API + "/entries/" + entry.id, { method: "PUT", headers: json, body: JSON.stringify({ text: "   " }) });
  assert.equal(res.status, 400);
  assert.ok((await res.text()).length > 0, "400 carries a reason");
  const list = await (await fetch(API + "/entries")).json();
  assert.equal(list.find(e => e.id === entry.id).text, original);
});

test("E3: IF the note does not exist, THEN THE SYSTEM SHALL respond 404 with a reason", async () => {
  const res = await fetch(API + "/entries/999999999", { method: "PUT", headers: json, body: JSON.stringify({ text: "x" }) });
  assert.equal(res.status, 404);
  assert.ok((await res.text()).length > 0, "404 carries a reason");
});

test("E5: THE SYSTEM SHALL return the edited text from GET /entries on any device (fresh GET, no cache)", async () => {
  const entry = await createEntry("edit-e5-" + Date.now());
  const edited = "edit-e5-after-" + Date.now();
  await fetch(API + "/entries/" + entry.id, { method: "PUT", headers: json, body: JSON.stringify({ text: edited }) });
  const res = await fetch(API + "/entries", { headers: { "cache-control": "no-cache" } });
  assert.ok((await res.json()).some(e => e.id === entry.id && e.text === edited));
});
