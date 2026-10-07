// app.js
// Behavior and data. Three functions: load, save, render. Same shape as HW3.
// What changed in HW4 is where load and save go: two lines, plus what
// happens when they fail. Everything else that changes is a consequence of
// those two lines, and that is what HW4 asks you to write down.

// Paste your deployed Worker URL here after `npx wrangler deploy`.
const API = "https://mgt3745-hw4.nuhamin2234.workers.dev";

// ---- HW3, for the record (superseded by ADR-002) ------------------------
// function load()      { return JSON.parse(localStorage.getItem("entries") || "[]"); }
// function save(list)  { localStorage.setItem("entries", JSON.stringify(list)); }
// -------------------------------------------------------------------------

const form = document.getElementById("entry-form");
const input = document.getElementById("entry-text");
const list = document.getElementById("entry-list");
const status = document.getElementById("status");

function showError(message) {
  // The user sees it on the page. Nothing is thrown in the console.
  status.textContent = message;
}

function clearError() {
  status.textContent = "";
}

async function load() {
  const res = await fetch(API + "/entries");
  if (!res.ok) { showError("could not load entries"); return []; }
  return res.json();
}

async function save(entry) {
  const res = await fetch(API + "/entries", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(entry),
  });
  if (!res.ok) {
    // The Worker's 400 path sends a short reason in the body. Show it.
    const reason = await res.text();
    showError("could not save: " + (reason || res.status));
    return false;
  }
  return true;
}

// E1/E2/E3: PUT the edited text. Returns true on success; on failure the
// reason is shown on the page and the caller keeps the original text (E4).
async function saveEdit(id, text) {
  const res = await fetch(API + "/entries/" + id, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  if (!res.ok) {
    const reason = await res.text();
    showError("could not save edit: " + (reason || res.status));
    return false;
  }
  return true;
}

function startEdit(li, entry) {
  const field = document.createElement("input");
  field.value = entry.text;
  field.setAttribute("aria-label", "Edit entry");
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.textContent = "Save";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.textContent = "Cancel";
  li.replaceChildren(field, saveBtn, cancelBtn);
  field.focus();

  cancelBtn.addEventListener("click", () => { clearError(); refresh(); });
  saveBtn.addEventListener("click", async () => {
    clearError();
    try {
      // E4: on any failure the page re-renders from the server, so the
      // original text stays visible and the error stays on screen.
      const ok = await saveEdit(entry.id, field.value.trim());
      if (ok) await refresh();
    } catch {
      showError("could not reach the server");
    }
  });
}

function render(entries) {
  // Unchanged from HW3. textContent, never innerHTML.
  // The server does not get to write HTML into your page either.
  list.replaceChildren();
  for (const entry of entries) {
    const li = document.createElement("li");
    const text = document.createElement("span");
    text.textContent = entry.text;
    const when = document.createElement("time");
    when.textContent = entry.created_at || "";
    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(li, entry));
    li.append(text, when, editBtn);
    list.append(li);
  }
}

async function refresh() {
  clearError();
  try {
    render(await load());
  } catch {
    // The network itself failed (offline, DNS, CORS). fetch throws here.
    showError("could not reach the server");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearError();
  const entry = { text: input.value.trim() };
  try {
    const ok = await save(entry);
    if (ok) {
      input.value = "";
      await refresh();
    }
  } catch {
    showError("could not reach the server");
  }
});

refresh();
