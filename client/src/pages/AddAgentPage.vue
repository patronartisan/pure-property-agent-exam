<script lang="ts">
import { defineComponent } from "vue";
import { toPageError, upsertAgent } from "../api";
import type { PageError } from "../types";

export default defineComponent({
  name: "AddAgentPage",
  data() {
    return {
      form: {
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
      },
      saving: false,
      error: null as PageError | null,
      saved: false,
      created: false,
    };
  },
  methods: {
    async submit() {
      this.error = null;
      this.saved = false;
      this.saving = true;
      try {
        const response = await upsertAgent(this.form);
        this.form = {
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          mobileNumber: response.data.mobileNumber,
        };
        this.created = Boolean(response.created);
        this.saved = true;
      } catch (err) {
        this.error = toPageError(err);
      } finally {
        this.saving = false;
      }
    },
  },
});
</script>

<template>
  <header>
    <p class="eyebrow">Agents</p>
    <h1>Add Agent</h1>
    <p class="lede">Save a property agent. A new email creates a record; an existing email updates it.</p>
  </header>

  <section class="panel">
    <h2>Agent</h2>
    <form @submit.prevent="submit">
      <div class="row">
        <label class="field">
          <span>First name</span>
          <input v-model="form.firstName" type="text" required maxlength="100" autocomplete="given-name" />
        </label>
        <label class="field">
          <span>Last name</span>
          <input v-model="form.lastName" type="text" required maxlength="100" autocomplete="family-name" />
        </label>
      </div>
      <label class="field">
        <span>Email</span>
        <input v-model="form.email" type="email" required maxlength="255" autocomplete="email" />
      </label>
      <label class="field">
        <span>Mobile number</span>
        <input v-model="form.mobileNumber" type="tel" required maxlength="20" autocomplete="tel" />
      </label>

      <button type="submit" class="primary" :disabled="saving">
        {{ saving ? "Saving…" : "Save agent" }}
      </button>
      <p v-if="saved" class="status ok">
        {{ created ? "Agent created." : "Agent updated." }}
      </p>
      <p v-if="error" class="status error">{{ error.message }}</p>
      <ul v-if="error?.details?.length" class="status error">
        <li v-for="detail in error.details" :key="detail">{{ detail }}</li>
      </ul>
    </form>
  </section>
</template>

<style scoped>
.eyebrow {
  margin: 0 0 4px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-size: 12px;
  color: var(--muted);
}

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 22px;
  max-width: 560px;
}

h2 {
  margin: 0 0 16px;
  font-family: Fraunces, Georgia, serif;
  font-size: 24px;
  font-weight: 600;
}

.row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 14px;
}

.field span {
  font-size: 13px;
  font-weight: 600;
}

input {
  border: 1px solid var(--line);
  background: #fff;
  border-radius: 10px;
  padding: 11px 12px;
  color: var(--ink);
}

.primary {
  border: 0;
  border-radius: 999px;
  padding: 11px 18px;
  cursor: pointer;
  background: var(--accent);
  color: #f8f4ec;
  font-weight: 600;
}

.primary:hover:not(:disabled) {
  background: var(--accent-strong);
}

.primary:disabled {
  opacity: 0.6;
  cursor: wait;
}

.status {
  color: var(--muted);
}

.ok {
  color: var(--ok);
}

.error {
  color: var(--warn);
}

@media (max-width: 640px) {
  .row {
    display: block;
  }
}
</style>
