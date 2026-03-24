<script setup>
import { computed, onMounted, ref, watch } from "vue";
import { useTheme } from "../composables/useTheme";
import { useNotionNotes } from "../composables/useNotionNotes";

const SAVE_KEY = "notes_workspace_save_v1";

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `note_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function createNote(overrides = {}) {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title: "Untitled note",
    content: "",
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function loadState() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) {
      return { notes: [], activeNoteId: "" };
    }

    const parsed = JSON.parse(raw);
    const notes = Array.isArray(parsed.notes)
      ? parsed.notes
          .filter((note) => note && typeof note === "object")
          .map((note) => ({
            id: String(note.id ?? createId()),
            title: String(note.title ?? "Untitled note"),
            content: String(note.content ?? ""),
            createdAt: String(note.createdAt ?? new Date().toISOString()),
            updatedAt: String(note.updatedAt ?? new Date().toISOString()),
          }))
      : [];

    return {
      notes,
      activeNoteId: typeof parsed.activeNoteId === "string" ? parsed.activeNoteId : "",
    };
  } catch {
    return { notes: [], activeNoteId: "" };
  }
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function wordCount(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }

  return trimmed.split(/\s+/).length;
}

const savedState = loadState();
const notes = ref(savedState.notes.length ? savedState.notes : []);
const activeNoteId = ref(savedState.activeNoteId || savedState.notes[0]?.id || "");
const searchQuery = ref("");
const { isDarkTheme, toggleTheme, initTheme } = useTheme();
const { isLoading: isSyncing, error: syncError, syncNotes } = useNotionNotes();

const activeNote = computed(() => notes.value.find((note) => note.id === activeNoteId.value) || null);

const filteredNotes = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();

  if (!query) {
    return notes.value;
  }

  return notes.value.filter((note) => {
    return [note.title, note.content]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });
});

const totalWords = computed(() => notes.value.reduce((total, note) => total + wordCount(note.content), 0));

function persistState() {
  localStorage.setItem(
    SAVE_KEY,
    JSON.stringify({ notes: notes.value, activeNoteId: activeNoteId.value }),
  );
}

function touchNote(note) {
  if (!note) {
    return;
  }

  note.updatedAt = new Date().toISOString();
}

function createNewNote() {
  const note = createNote();
  notes.value.unshift(note);
  activeNoteId.value = note.id;
}

function selectNote(noteId) {
  activeNoteId.value = noteId;
}

function duplicateNote(note) {
  const copy = createNote({
    title: `${note.title} copy`,
    content: note.content,
  });

  notes.value.unshift(copy);
  activeNoteId.value = copy.id;
}

function deleteNote(noteId) {
  const noteIndex = notes.value.findIndex((note) => note.id === noteId);
  if (noteIndex === -1) {
    return;
  }

  if (!confirm("Delete this note? This cannot be undone.")) {
    return;
  }

  notes.value.splice(noteIndex, 1);

  if (activeNoteId.value === noteId) {
    activeNoteId.value = notes.value[0]?.id || "";
  }
}

watch(
  [notes, activeNoteId],
  () => {
    persistState();
    syncNotes(notes.value);
  },
  { deep: true },
);

onMounted(() => {
  initTheme();

  if (!activeNoteId.value && notes.value[0]) {
    activeNoteId.value = notes.value[0].id;
  }
});
</script>

<template>
  <div class="notes-shell">
    <header class="notes-nav">
      <div class="notes-brand-wrap">
        <div class="notes-brand">Notes</div>
        <div class="notes-subtitle">Lightweight local notes, Notion-style</div>
      </div>

      <nav class="notes-links" aria-label="Page navigation">
        <a href="/" class="notes-link">Home</a>
        <a href="/sudoku.html" class="notes-link">Sudoku</a>
      </nav>

      <button class="theme-toggle notes-theme-toggle" @click="toggleTheme">
        {{ isDarkTheme ? "🌙 Dark" : "☀️ Light" }}
      </button>
    </header>

    <main class="notes-layout">
      <aside class="notes-sidebar">
        <div class="notes-sidebar-header">
          <div>
            <h1>Workspace</h1>
            <p>Organize, search, and open your notes.</p>
          </div>
          <button class="notes-primary-btn" @click="createNewNote">+ New note</button>
        </div>

        <label class="notes-search">
          <span>Search</span>
          <input v-model="searchQuery" type="search" placeholder="Search titles or content" />
        </label>

        <div class="notes-sidebar-stats">
          <div>
            <strong>{{ notes.length }}</strong>
            <span>notes</span>
          </div>
          <div>
            <strong>{{ totalWords }}</strong>
            <span>words</span>
          </div>
        </div>

        <div class="notes-list" v-if="filteredNotes.length">
          <button
            v-for="note in filteredNotes"
            :key="note.id"
            class="note-card"
            :class="{ active: note.id === activeNoteId }"
            @click="selectNote(note.id)"
          >
            <div class="note-card-header">
              <span class="note-title">{{ note.title }}</span>
              <span class="note-date">{{ formatDate(note.updatedAt) }}</span>
            </div>
            <p class="note-preview">
              {{ note.content.trim() ? note.content : "Start typing to capture your idea." }}
            </p>
          </button>
        </div>

        <div v-else class="notes-empty-list">
          <h2>No matches</h2>
          <p>Try a different search or create a new note.</p>
        </div>
      </aside>

      <section class="notes-editor-panel">
        <div v-if="activeNote" class="notes-editor">
          <div class="notes-editor-toolbar">
            <div class="notes-editor-meta">
              <span>Created {{ formatDate(activeNote.createdAt) }}</span>
              <span>Updated {{ formatDate(activeNote.updatedAt) }}</span>
            </div>

            <div class="notes-editor-actions">
              <button @click="duplicateNote(activeNote)">Duplicate</button>
              <button class="notes-danger-btn" @click="deleteNote(activeNote.id)">Delete</button>
            </div>
          </div>

          <label class="notes-title-field">
            <span>Title</span>
            <input
              v-model="activeNote.title"
              type="text"
              placeholder="Untitled note"
              @input="touchNote(activeNote)"
            />
          </label>

          <label class="notes-content-field">
            <span>Content</span>
            <textarea
              v-model="activeNote.content"
              placeholder="Write your note here..."
              @input="touchNote(activeNote)"
            />
          </label>

          <div class="notes-footer">
            <span>{{ wordCount(activeNote.content) }} words</span>
            <span v-if="isSyncing">Syncing to Notion...</span>
            <span v-else-if="syncError" style="color: var(--color-error)">Sync error: {{ syncError }}</span>
            <span v-else>Saved to Notion</span>
          </div>
        </div>

        <div v-else class="notes-empty-state">
          <div>
            <h2>Start a new note</h2>
            <p>Create a note to capture thoughts, plans, or quick drafts.</p>
          </div>
          <button class="notes-primary-btn" @click="createNewNote">Create your first note</button>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.notes-shell {
  min-height: 100vh;
  background: var(--color-bg);
  color: var(--color-text-primary);
}

.notes-nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.25rem;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-surface);
}

.notes-brand-wrap {
  min-width: 0;
}

.notes-brand {
  font-size: 1.05rem;
  font-weight: 700;
}

.notes-subtitle {
  color: var(--color-text-secondary);
  font-size: 0.82rem;
}

.notes-links {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}

.notes-link {
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 0.45rem 0.85rem;
  text-decoration: none;
  background: transparent;
}

.notes-link:hover {
  color: var(--color-text-primary);
  border-color: var(--color-accent);
}

.notes-theme-toggle {
  min-width: 110px;
}

.notes-layout {
  display: grid;
  grid-template-columns: minmax(280px, 360px) minmax(0, 1fr);
  gap: 1rem;
  padding: 1rem;
  min-height: calc(100vh - 68px);
}

.notes-sidebar,
.notes-editor-panel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
}

.notes-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  overflow: hidden;
}

.notes-sidebar-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: flex-start;
}

.notes-sidebar-header p {
  color: var(--color-text-secondary);
  margin-bottom: 0;
  font-size: 0.9rem;
}

.notes-primary-btn,
.notes-danger-btn {
  border-radius: 8px;
  padding: 0.55rem 0.9rem;
  font-weight: 600;
}

.notes-primary-btn {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: #fff;
}

.notes-primary-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.notes-danger-btn {
  background: var(--color-danger);
  border-color: var(--color-danger);
  color: #fff;
}

.notes-danger-btn:hover {
  background: var(--color-danger-hover);
  border-color: var(--color-danger-hover);
}

.notes-search {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.notes-search input,
.notes-title-field input,
.notes-content-field textarea {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  background: var(--color-surface-alt);
  color: var(--color-text-primary);
  padding: 0.75rem 0.85rem;
  font: inherit;
}

.notes-search input:focus-visible,
.notes-title-field input:focus-visible,
.notes-content-field textarea:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.notes-sidebar-stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.notes-sidebar-stats div {
  padding: 0.8rem;
  border-radius: 10px;
  border: 1px solid var(--color-border);
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
}

.notes-sidebar-stats strong {
  font-size: 1.2rem;
}

.notes-sidebar-stats span {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.notes-list {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  overflow: auto;
  padding-right: 0.2rem;
}

.note-card {
  text-align: left;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  padding: 0.85rem;
  background: var(--color-surface-alt);
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.note-card:hover {
  border-color: var(--color-accent);
}

.note-card.active {
  border-color: var(--color-accent);
  box-shadow: inset 0 0 0 1px var(--color-accent);
}

.note-card-header {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  align-items: baseline;
}

.note-title {
  font-weight: 700;
  color: var(--color-text-primary);
}

.note-date {
  color: var(--color-text-muted);
  font-size: 0.78rem;
  white-space: nowrap;
}

.note-preview {
  color: var(--color-text-secondary);
  font-size: 0.88rem;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notes-empty-list,
.notes-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 220px;
  border: 1px dashed var(--color-border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.02);
  padding: 1.5rem;
}

.notes-empty-list {
  flex-direction: column;
  gap: 0.25rem;
  color: var(--color-text-secondary);
}

.notes-empty-state {
  flex-direction: column;
  gap: 1rem;
  max-width: 480px;
  margin: auto;
}

.notes-editor-panel {
  padding: 1rem;
  display: flex;
  min-height: 0;
}

.notes-editor {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.notes-editor-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.notes-editor-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 1rem;
  color: var(--color-text-secondary);
  font-size: 0.85rem;
}

.notes-editor-actions {
  display: flex;
  gap: 0.5rem;
}

.notes-title-field,
.notes-content-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.notes-title-field span,
.notes-content-field span {
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}

.notes-title-field input {
  font-size: 1.5rem;
  font-weight: 700;
  padding: 0.9rem 1rem;
}

.notes-content-field {
  flex: 1;
  min-height: 0;
}

.notes-content-field textarea {
  flex: 1;
  resize: none;
  min-height: 320px;
  line-height: 1.7;
}

.notes-footer {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  color: var(--color-text-secondary);
  font-size: 0.82rem;
  border-top: 1px solid var(--color-border);
  padding-top: 0.8rem;
}

@media (max-width: 900px) {
  .notes-layout {
    grid-template-columns: 1fr;
  }

  .notes-sidebar {
    order: 2;
  }

  .notes-editor-panel {
    order: 1;
    min-height: 520px;
  }
}

@media (max-width: 640px) {
  .notes-nav {
    flex-wrap: wrap;
  }

  .notes-links {
    margin-left: 0;
    width: 100%;
    order: 3;
  }

  .notes-theme-toggle {
    margin-left: auto;
  }

  .notes-sidebar-header,
  .notes-editor-toolbar,
  .notes-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .notes-editor-actions {
    flex-wrap: wrap;
  }
}
</style>