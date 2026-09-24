<script>
import { listAgents, updateAgent } from "../api.js";

export default {
  name: "SettingsPage",
  data() {
    return {
      agent: null,
      form: {
        firstName: "",
        lastName: "",
        email: "",
        mobileNumber: "",
      },
      loading: true,
      saving: false,
      error: null,
      saved: false,
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = null;
      this.saved = false;
      this.agent = null;
      try {
        const current = (await listAgents()).data[0];
        if (!current) {
          this.error = new Error("No agent is available");
          return;
        }
        this.agent = current;
        this.form = {
          firstName: current.firstName,
          lastName: current.lastName,
          email: current.email,
          mobileNumber: current.mobileNumber,
        };
      } catch (err) {
        this.error = err;
      } finally {
        this.loading = false;
      }
    },
    formatWhen(value) {
      return new Date(value).toLocaleString();
    },
    async submit() {
      this.error = null;
      this.saved = false;
      this.saving = true;
      try {
        const response = await updateAgent(this.agent.id, this.form);
        this.agent = response.data;
        this.form = {
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          email: response.data.email,
          mobileNumber: response.data.mobileNumber,
        };
        this.saved = true;
      } catch (err) {
        this.error = err;
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<template>
  <header>
    <p class="eyebrow">Account</p>
    <h1>Settings</h1>
    <p class="lede">View and update the current property agent.</p>
  </header>

  <p v-if="loading" class="status">Loading agent…</p>

  <template v-else-if="agent">
    <section class="panel">
      <h2>Agent details</h2>
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

        <dl>
          <div>
            <dt>Created</dt>
            <dd>{{ formatWhen(agent.createdAt) }}</dd>
          </div>
          <div>
            <dt>Updated</dt>
            <dd>{{ formatWhen(agent.updatedAt) }}</dd>
          </div>
        </dl>

        <button type="submit" class="primary" :disabled="saving">
          {{ saving ? "Saving…" : "Save changes" }}
        </button>
        <p v-if="saved" class="status ok">Agent details updated.</p>
        <p v-if="error" class="status error">{{ error.message }}</p>
        <ul v-if="error?.details?.length" class="status error">
          <li v-for="detail in error.details" :key="detail">{{ detail }}</li>
        </ul>
      </form>
    </section>
  </template>

  <p v-else-if="error" class="status error">{{ error.message }}</p>
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

dl {
  display: grid;
  gap: 8px;
  margin: 4px 0 18px;
}

dl div {
  display: grid;
  grid-template-columns: 88px 1fr;
  gap: 8px;
}

dt {
  color: var(--muted);
  font-weight: 600;
}

dd {
  margin: 0;
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
  .row,
  dl div {
    display: block;
  }
}
</style>
