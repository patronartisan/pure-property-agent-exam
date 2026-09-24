<template>
  <div class="shell">
    <aside>
      <RouterLink to="/" class="brand">PURE</RouterLink>
      <p class="aside-label">Property desk</p>
      <nav>
        <RouterLink to="/" active-class="" exact-active-class="active">Dashboard</RouterLink>
        <RouterLink to="/properties" active-class="" exact-active-class="active">Properties</RouterLink>
        <RouterLink to="/agents/new" active-class="" exact-active-class="active">Add Agent</RouterLink>
        <RouterLink to="/settings" active-class="" exact-active-class="active">Settings</RouterLink>
      </nav>
    </aside>
    <div class="content">
      <RouterView />
    </div>
  </div>
</template>

<style scoped>
.shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
}

aside {
  background: #0754a5;
  color: #f4efe6;
  padding: 28px 20px;
}

.brand {
  display: block;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-size: 13px;
  color: inherit;
  text-decoration: none;
  font-weight: 700;
}

.aside-label {
  margin: 8px 0 28px;
  color: #c9c0b2;
  font-size: 13px;
}

nav {
  display: grid;
  gap: 6px;
}

nav a {
  color: #e8e0d4;
  text-decoration: none;
  padding: 9px 12px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
}

nav a.active,
nav a:hover {
  background: rgba(255, 253, 248, 0.12);
  color: #fffdf8;
}

.content {
  padding: 36px 40px 80px;
  max-width: 1080px;
}

:deep(h1) {
  margin: 0 0 12px;
  font-family: Fraunces, Georgia, serif;
  font-size: 42px;
  font-weight: 500;
  letter-spacing: -0.03em;
}

:deep(.lede) {
  margin: 0 0 28px;
  color: var(--muted);
  max-width: 38rem;
  font-size: 17px;
}

@media (max-width: 800px) {
  .shell {
    display: block;
  }

  aside {
    padding: 18px 16px;
  }

  .content {
    padding: 24px 16px 64px;
  }
}
</style>
