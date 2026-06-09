<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const user = computed(() => {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
})

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<template>
  <nav class="navbar">
    <span class="brand">MeetN'Sniff</span>
    <div class="nav-right">
      <span v-if="user" class="username">{{ user.displayName || user.username }}</span>
      <button class="logout-btn" @click="logout">Sign out</button>
    </div>
  </nav>
</template>

<style scoped>
.navbar {
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.25rem;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
  flex-shrink: 0;
}

.brand {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--accent);
  letter-spacing: -0.3px;
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.username {
  font-size: 0.875rem;
  color: var(--text);
}

.logout-btn {
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.logout-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}
</style>
