<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from '../composables/useTheme'

const router = useRouter()
const { isDark, toggle } = useTheme()

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
    <RouterLink to="/" class="brand">MeetN'Sniff</RouterLink>
    <div class="nav-right">
      <button class="theme-btn" @click="toggle" :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
        {{ isDark ? 'Light' : 'Dark' }}
      </button>
      <span v-if="user" class="username">{{ user.displayName || user.username }}</span>
      <RouterLink to="/profile" class="profile-btn">Profile</RouterLink>
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
  text-decoration: none;
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

.theme-btn {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 0.8rem;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.theme-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.profile-btn {
  padding: 0.35rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 0.875rem;
  cursor: pointer;
  text-decoration: none;
  transition: border-color 0.15s, color 0.15s;
}

.profile-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
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

@media (max-width: 480px) {
  .username {
    display: none;
  }
}
</style>
