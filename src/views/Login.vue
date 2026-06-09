<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Auth } from '../api'

const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)

async function handleSubmit() {
  error.value = null
  loading.value = true
  try {
    const data = await Auth.login(email.value, password.value)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    router.push('/')
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-shell">
    <div class="auth-card">

      <div class="auth-header">
        <h2>Sign in</h2>
      </div>

      <div v-if="error" class="alerts">
        <div class="alert error">{{ error }}</div>
      </div>

      <form class="form" @submit.prevent="handleSubmit" novalidate>

        <div class="field">
          <label for="email">Email</label>
          <input id="email" v-model="email" type="email" placeholder="you@example.com" required />
        </div>

        <div class="field">
          <label for="password">Password</label>
          <input id="password" v-model="password" type="password" placeholder="••••••••" required />
        </div>

        <button class="btn primary" type="submit" :disabled="loading">
          {{ loading ? 'Signing in…' : 'Log in' }}
        </button>

      </form>

      <p class="auth-footer">No account? <RouterLink to="/register">Create one</RouterLink></p>

    </div>
  </div>
</template>

<style scoped>
.auth-shell {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-footer {
  margin-top: 1rem;
  text-align: center;
  font-size: .875rem;
  color: var(--text);
}

.auth-footer a {
  color: var(--accent);
  text-decoration: none;
}

.btn.primary {
  width: 100%;
  padding: .75rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .15s;
}

.btn.primary:hover:not(:disabled) {
  opacity: .88;
}

.btn.primary:disabled {
  opacity: .55;
  cursor: not-allowed;
}
</style>
