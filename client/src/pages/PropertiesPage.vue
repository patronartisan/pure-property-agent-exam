<script>
import { createPropertyNote, createPropertyReminder, listProperties } from "../api.js";

const actionLabels = {
  maintenance: "Maintenance",
  pest_control: "Pest control",
  inspection: "Inspection",
  other: "Other",
};

const builtInActions = ["maintenance", "pest_control", "inspection", "other"];

export default {
  name: "PropertiesPage",
  data() {
    return {
      properties: [],
      loading: true,
      error: null,
      savingNote: false,
      savingReminder: false,
      noteError: null,
      reminderError: null,
      note: {
        propertyId: "",
        title: "",
        body: "",
      },
      reminder: {
        propertyId: "",
        title: "",
        actionType: "maintenance",
        customAction: "",
        dueAt: "",
      },
      expanded: {},
      openMenuId: null,
      activeModal: null,
    };
  },
  mounted() {
    document.addEventListener("click", this.closeMenu);
    document.addEventListener("keydown", this.onKeydown);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeMenu);
    document.removeEventListener("keydown", this.onKeydown);
  },
  computed: {
    tenantCount() {
      return this.properties.reduce((total, property) => total + property.tenants.length, 0);
    },
    selectedProperty() {
      const id = this.activeModal === "note" ? this.note.propertyId : this.reminder.propertyId;
      return this.properties.find((property) => property.id === id) || null;
    },
    usesCustomAction() {
      return this.reminder.actionType === "other";
    },
    savedActions() {
      const extras = new Set();
      for (const property of this.properties) {
        for (const reminder of property.reminders || []) {
          if (reminder.actionType && !builtInActions.includes(reminder.actionType)) {
            extras.add(reminder.actionType);
          }
        }
      }
      return Array.from(extras).sort((a, b) => a.localeCompare(b));
    },
  },
  async created() {
    await this.load();
  },
  methods: {
    async load({ silent = false } = {}) {
      if (!silent) {
        this.loading = true;
      }
      this.error = null;
      try {
        const response = await listProperties();
        this.properties = response.data;
      } catch (err) {
        this.error = err;
      } finally {
        this.loading = false;
      }
    },
    formatWhen(value) {
      return new Date(value).toLocaleString();
    },
    currentDateTimeLocal() {
      const now = new Date();
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
      return local.toISOString().slice(0, 16);
    },
    actionLabel(type) {
      return actionLabels[type] || type;
    },
    isExpanded(propertyId) {
      return Boolean(this.expanded[propertyId]);
    },
    toggleTenants(propertyId) {
      this.expanded = {
        ...this.expanded,
        [propertyId]: !this.expanded[propertyId],
      };
      this.closeMenu();
    },
    toggleMenu(propertyId, event) {
      event.stopPropagation();
      this.openMenuId = this.openMenuId === propertyId ? null : propertyId;
    },
    closeMenu() {
      this.openMenuId = null;
    },
    onKeydown(event) {
      if (event.key === "Escape") {
        this.closeModal();
        this.closeMenu();
      }
    },
    openNoteForm(propertyId) {
      this.note = { propertyId, title: "", body: "" };
      this.noteError = null;
      this.activeModal = "note";
      this.closeMenu();
    },
    openReminderForm(propertyId) {
      this.reminder = {
        propertyId,
        title: "",
        actionType: "maintenance",
        customAction: "",
        dueAt: this.currentDateTimeLocal(),
      };
      this.reminderError = null;
      this.activeModal = "reminder";
      this.closeMenu();
    },
    closeModal() {
      this.activeModal = null;
    },
    async submitNote() {
      this.noteError = null;
      this.savingNote = true;
      try {
        await createPropertyNote(this.note.propertyId, {
          title: this.note.title,
          body: this.note.body,
        });
        this.note.title = "";
        this.note.body = "";
        this.closeModal();
        await this.load({ silent: true });
      } catch (err) {
        this.noteError = err;
      } finally {
        this.savingNote = false;
      }
    },
    reminderActionType() {
      if (this.reminder.actionType !== "other") {
        return this.reminder.actionType;
      }
      return this.reminder.customAction.trim();
    },
    async submitReminder() {
      this.reminderError = null;
      const actionType = this.reminderActionType();
      if (!actionType) {
        this.reminderError = new Error("Enter a custom action");
        return;
      }
      this.savingReminder = true;
      try {
        await createPropertyReminder(this.reminder.propertyId, {
          title: this.reminder.title,
          actionType,
          dueAt: new Date(this.reminder.dueAt).toISOString(),
        });
        this.reminder.title = "";
        this.reminder.dueAt = "";
        this.closeModal();
        await this.load({ silent: true });
      } catch (err) {
        this.reminderError = err;
      } finally {
        this.savingReminder = false;
      }
    },
  },
};
</script>

<template>
  <header>
    <p class="eyebrow">Portfolio</p>
    <h1>Properties</h1>
    <p class="lede">Each property is occupied by one family.</p>
  </header>

  <p v-if="loading" class="status">Loading properties…</p>
  <p v-else-if="error" class="status error">{{ error.message }}</p>
  <p v-else-if="!properties.length" class="status">No properties yet.</p>

  <template v-else>
    <p class="summary">{{ properties.length }} properties · {{ tenantCount }} tenants</p>

    <div class="table-wrap">
      <table>
        <caption>Properties</caption>
        <thead>
          <tr>
            <th>Property</th>
            <th>Family</th>
            <th>Tenants</th>
            <th>Notes</th>
            <th>Reminders</th>
            <th class="narrow"></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="property in properties" :key="property.id">
            <tr class="property-row" :class="{ 'property-end': !isExpanded(property.id) }">
              <td>
                <strong>{{ property.streetAddress }}</strong>
                <span>{{ property.city }}, {{ property.state }} {{ property.postalCode }}</span>
              </td>
              <td>{{ property.family?.name }}</td>
              <td>{{ property.tenants.length }}</td>
              <td>
                <ul>
                  <li v-for="note in property.notes" :key="note.id">{{ note.title }}</li>
                </ul>
              </td>
              <td>
                <ul>
                  <li v-for="reminder in property.reminders" :key="reminder.id">
                    {{ reminder.title }}
                    <span>{{ actionLabel(reminder.actionType) }} · {{ formatWhen(reminder.dueAt) }}</span>
                  </li>
                </ul>
              </td>
              <td class="narrow">
                <div class="menu" @click.stop>
                  <button
                    type="button"
                    class="ellipsis"
                    :class="{ open: openMenuId === property.id }"
                    aria-label="Property actions"
                    @click="toggleMenu(property.id, $event)"
                  >
                    ⋮
                  </button>
                  <div v-if="openMenuId === property.id" class="menu-list">
                    <button type="button" @click="toggleTenants(property.id)">
                      {{ isExpanded(property.id) ? "Hide tenants" : "Show tenants" }}
                    </button>
                    <button type="button" @click="openNoteForm(property.id)">Add note</button>
                    <button type="button" @click="openReminderForm(property.id)">Add reminder</button>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="isExpanded(property.id)" class="detail property-end">
              <td colspan="6">
                <table class="nested">
                  <caption>Tenants · {{ property.family?.name }} family</caption>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Mobile</th>
                      <th>Role</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="tenant in property.tenants" :key="tenant.id">
                      <td>{{ tenant.firstName }} {{ tenant.lastName }}</td>
                      <td>{{ tenant.email }}</td>
                      <td>{{ tenant.mobileNumber }}</td>
                      <td>{{ tenant.isPrimary ? "Primary" : "Tenant" }}</td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="activeModal" class="modal-backdrop" @click.self="closeModal">
      <div class="modal" role="dialog" aria-modal="true">
        <template v-if="activeModal === 'note'">
          <h2>Add a note</h2>
          <p class="hint">
            For {{ selectedProperty?.streetAddress }}, {{ selectedProperty?.city }}
          </p>
          <form @submit.prevent="submitNote">
            <label class="field">
              <span>Title</span>
              <input v-model="note.title" type="text" maxlength="200" required placeholder="Kitchen tap, rear fence…" />
            </label>
            <label class="field">
              <span>Note</span>
              <textarea v-model="note.body" rows="4" required placeholder="What you need to remember or follow up." />
            </label>
            <div class="modal-actions">
              <button type="button" class="ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="primary" :disabled="savingNote">
                {{ savingNote ? "Saving…" : "Save note" }}
              </button>
            </div>
            <p v-if="noteError" class="status error">{{ noteError.message }}</p>
          </form>
        </template>

        <template v-else>
          <h2>Add a reminder</h2>
          <p class="hint">
            For {{ selectedProperty?.streetAddress }}, {{ selectedProperty?.city }}
          </p>
          <form @submit.prevent="submitReminder">
            <label class="field">
              <span>Title</span>
              <input v-model="reminder.title" type="text" maxlength="200" required placeholder="Quarterly pest control" />
            </label>
            <label class="field">
              <span>Action</span>
              <select v-model="reminder.actionType" required>
                <option value="maintenance">Maintenance</option>
                <option value="pest_control">Pest control</option>
                <option value="inspection">Inspection</option>
                <option v-for="action in savedActions" :key="action" :value="action">
                  {{ action }}
                </option>
                <option value="other">Other</option>
              </select>
            </label>
            <label v-if="usesCustomAction" class="field">
              <span>Custom action</span>
              <input
                v-model="reminder.customAction"
                type="text"
                maxlength="50"
                required
                placeholder="e.g. lock change, garden clean"
              />
            </label>
            <label class="field">
              <span>Due</span>
              <input v-model="reminder.dueAt" type="datetime-local" required />
            </label>
            <div class="modal-actions">
              <button type="button" class="ghost" @click="closeModal">Cancel</button>
              <button type="submit" class="primary" :disabled="savingReminder">
                {{ savingReminder ? "Saving…" : "Save reminder" }}
              </button>
            </div>
            <p v-if="reminderError" class="status error">{{ reminderError.message }}</p>
          </form>
        </template>
      </div>
    </div>
  </template>
</template>

<style scoped>
.eyebrow {
  margin: 0 0 4px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 12px;
  color: var(--muted);
}

.summary {
  color: var(--muted);
  margin: 0 0 16px;
}

h2 {
  margin: 0 0 6px;
  font-family: Fraunces, Georgia, serif;
  font-size: 22px;
  font-weight: 600;
}

.hint {
  margin: 0 0 16px;
  color: var(--muted);
  font-size: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.field span {
  font-size: 13px;
  font-weight: 600;
}

input,
select,
textarea {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 10px;
  padding: 10px 12px;
  color: var(--ink);
}

textarea {
  resize: vertical;
}

.primary {
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
  background: var(--accent);
  color: #f8f4ec;
}

.primary:hover:not(:disabled) {
  background: var(--accent-strong);
}

.primary:disabled {
  opacity: 0.6;
  cursor: wait;
}

.ghost {
  border: 1px solid var(--line);
  background: transparent;
  color: var(--ink);
  border-radius: 999px;
  padding: 10px 16px;
  cursor: pointer;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(31, 26, 20, 0.45);
  display: grid;
  place-items: center;
  padding: 24px;
  z-index: 20;
}

.modal {
  width: min(480px, 100%);
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(31, 26, 20, 0.18);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 8px;
}

.table-wrap {
  overflow: visible;
  background: var(--card);
  border: 1px solid var(--line);
  border-bottom: 2px solid var(--ink);
  border-radius: 16px;
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

.narrow {
  width: 1%;
  white-space: nowrap;
  text-align: right;
}

.property-row:hover > td {
  background: #f3eee4;
}

.menu {
  position: relative;
  display: inline-block;
  padding-bottom: 8px;
  margin-bottom: -8px;
}

.ellipsis {
  width: 36px;
  height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ink);
  cursor: pointer;
  font-size: 22px;
  line-height: 1;
  font-weight: 700;
}

.ellipsis.open,
.ellipsis:hover {
  background: transparent;
  color: var(--accent);
}

.menu-list {
  position: absolute;
  right: 0;
  top: calc(100% + 6px);
  z-index: 5;
  min-width: 170px;
  background: #fffdf8;
  border: 1px solid var(--line);
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(31, 26, 20, 0.12);
  padding: 6px;
  display: grid;
}

.menu-list button {
  border: 0;
  background: transparent;
  text-align: left;
  padding: 9px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: var(--ink);
}

.menu-list button:hover {
  background: #efe6d4;
}

.property-end > td {
  border-bottom: 2px solid var(--ink);
}

.detail > td {
  background: #f7f2ea;
  padding: 0;
  border-bottom: 2px solid var(--ink);
}

.nested {
  min-width: 0;
  background: transparent;
}

.nested th,
.nested td {
  border-bottom: 0;
}

.nested caption {
  font-size: 16px;
  padding: 14px 20px 4px;
}

caption {
  text-align: left;
  font-family: Fraunces, Georgia, serif;
  font-size: 22px;
  font-weight: 600;
  padding: 18px 20px 8px;
}

th,
td {
  text-align: left;
  vertical-align: top;
  padding: 12px 20px;
  border-top: 1px solid var(--line);
}

th {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
  border-top: 0;
}

td {
  font-size: 14px;
}

td strong {
  display: block;
}

td span {
  display: block;
  color: var(--muted);
  font-size: 13px;
  margin-top: 2px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li + li {
  margin-top: 8px;
}

em {
  font-style: normal;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
  margin-left: 6px;
}

.status {
  color: var(--muted);
}

.error {
  color: var(--warn);
}
</style>
