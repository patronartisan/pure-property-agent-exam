<script>
import { listAgents } from "../api.js";

export default {
  name: "DashboardPage",
  data() {
    return {
      agent: null,
      loading: true,
      error: null,
    };
  },
  async created() {
    await this.load();
  },
  methods: {
    async load() {
      this.loading = true;
      this.error = null;
      this.agent = null;

      try {
        const agentsResponse = await listAgents();
        const current = agentsResponse.data[0];
        if (!current) {
          this.error = new Error("No agent is available");
          return;
        }

        this.agent = current;
      } catch (err) {
        this.error = err;
      } finally {
        this.loading = false;
      }
    },
    formatWhen(value) {
      return new Date(value).toLocaleString();
    },
  },
};
</script>

<template>
  <p v-if="loading" class="status">Loading agent…</p>
  <p v-else-if="error" class="status error">{{ error.message }}</p>

  <template v-else-if="agent">
    <header>
      <p class="eyebrow">Current agent</p>
      <h1>{{ agent.firstName }} {{ agent.lastName }}</h1>
    </header>

    <section class="panel">
      <h2>Details</h2>
      <dl>
        <div>
          <dt>First name</dt>
          <dd>{{ agent.firstName }}</dd>
        </div>
        <div>
          <dt>Last name</dt>
          <dd>{{ agent.lastName }}</dd>
        </div>
        <div>
          <dt>Email</dt>
          <dd>{{ agent.email }}</dd>
        </div>
        <div>
          <dt>Mobile</dt>
          <dd>{{ agent.mobileNumber }}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{{ formatWhen(agent.createdAt) }}</dd>
        </div>
        <div>
          <dt>Updated</dt>
          <dd>{{ formatWhen(agent.updatedAt) }}</dd>
        </div>
      </dl>
    </section>
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

.panel {
  background: var(--card);
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 22px;
}

h2 {
  margin: 0 0 16px;
  font-family: Fraunces, Georgia, serif;
  font-size: 24px;
  font-weight: 600;
}

dl {
  display: grid;
  gap: 12px;
  margin: 0;
}

dl div {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 12px;
}

dt {
  color: var(--muted);
  font-weight: 600;
}

dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.status {
  color: var(--muted);
}

.error {
  color: var(--warn);
}

@media (max-width: 640px) {
  dl div {
    display: block;
  }
}
</style>
