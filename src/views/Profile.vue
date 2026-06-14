<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Auth, User } from '../api'

const router = useRouter()

const userData = ref(null)
const favorites = ref([])
const loading = ref(true)

const form = ref({ displayName: '', bio: '', dog: { name: '', breed: '', size: '', birthYear: '' } })
const saveError = ref(null)
const saveSuccess = ref(false)
const saving = ref(false)

onMounted(async () => {
  const [profileResult, favoritesResult] = await Promise.allSettled([
    User.getProfile(),
    User.getFavorites(),
  ])

  if (profileResult.status === 'fulfilled') {
    userData.value = profileResult.value.user
    form.value = {
      displayName: userData.value.displayName || '',
      bio: userData.value.bio || '',
      dog: {
        name: userData.value.dog?.name || '',
        breed: userData.value.dog?.breed || '',
        size: userData.value.dog?.size || '',
        birthYear: userData.value.dog?.birthYear || '',
      },
    }
  }

  if (favoritesResult.status === 'fulfilled') {
    favorites.value = favoritesResult.value.data
  }

  loading.value = false
})

async function saveProfile() {
  saveError.value = null
  saveSuccess.value = false
  saving.value = true
  try {
    const payload = {
      displayName: form.value.displayName,
      bio: form.value.bio,
      dog: {
        name: form.value.dog.name,
        breed: form.value.dog.breed,
        size: form.value.dog.size || undefined,
        birthYear: form.value.dog.birthYear ? Number(form.value.dog.birthYear) : undefined,
      },
    }
    const result = await Auth.updateProfile(payload)
    userData.value = result.user
    // Keep localStorage user in sync
    localStorage.setItem('user', JSON.stringify(result.user))
    saveSuccess.value = true
  } catch (err) {
    saveError.value = err.message
  } finally {
    saving.value = false
  }
}

async function removeFavorite(parkId) {
  await User.removeFavorite(parkId)
  favorites.value = favorites.value.filter(p => p.id !== parkId)
}

const deleteError = ref(null)
const deleting = ref(false)

async function deleteAccount() {
  if (!confirm('Delete your account? This will permanently remove your parks, reviews, and profile. This cannot be undone.')) return
  deleteError.value = null
  deleting.value = true
  try {
    await Auth.deleteAccount()
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  } catch (err) {
    deleteError.value = err.message
    deleting.value = false
  }
}
</script>

<template>
  <div class="profile-page">
    <RouterLink to="/" class="back-btn">← Back to parks</RouterLink>
    <div v-if="loading" class="loading-text">Loading profile…</div>

    <div v-else class="profile-content">

      <!-- Profile & Dog -->
      <section class="profile-card">
        <h2 class="section-title">Profile</h2>

        <div v-if="saveError" class="alerts"><div class="alert error">{{ saveError }}</div></div>
        <div v-if="saveSuccess" class="save-success">Saved successfully.</div>

        <div class="form-grid">
          <div class="field">
            <label for="displayName">Display name</label>
            <input id="displayName" v-model="form.displayName" type="text" placeholder="Your name" />
          </div>

          <div class="field full-width">
            <label for="bio">Bio</label>
            <textarea id="bio" v-model="form.bio" rows="3" placeholder="Tell us about yourself…" />
          </div>
        </div>

        <h3 class="subsection-title">Your dog</h3>
        <div class="form-grid">
          <div class="field">
            <label for="dogName">Name</label>
            <input id="dogName" v-model="form.dog.name" type="text" placeholder="Dog's name" />
          </div>

          <div class="field">
            <label for="dogBreed">Breed</label>
            <input id="dogBreed" v-model="form.dog.breed" type="text" placeholder="e.g. Labrador" />
          </div>

          <div class="field">
            <label for="dogSize">Size</label>
            <select id="dogSize" v-model="form.dog.size">
              <option value="">— select —</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
              <option value="giant">Giant</option>
            </select>
          </div>

          <div class="field">
            <label for="dogYear">Birth year</label>
            <input id="dogYear" v-model="form.dog.birthYear" type="number" placeholder="e.g. 2019" min="1980" :max="new Date().getFullYear()" />
          </div>
        </div>

        <button class="save-btn" :disabled="saving" @click="saveProfile">
          {{ saving ? 'Saving…' : 'Save changes' }}
        </button>
      </section>

      <!-- Favorite parks -->
      <section class="profile-card">
        <h2 class="section-title">Favorite parks</h2>

        <div v-if="favorites.length === 0" class="empty-state">No favorite parks yet.</div>

        <ul v-else class="favorites-list">
          <li v-for="park in favorites" :key="park.id" class="favorite-item">
            <span class="favorite-name">{{ park.name }}</span>
            <button class="remove-btn" @click="removeFavorite(park.id)">Remove</button>
          </li>
        </ul>
      </section>

      <!-- Danger zone -->
      <section class="profile-card danger-card">
        <h2 class="section-title danger-title">Danger zone</h2>
        <p class="danger-description">Permanently deletes your account, all parks you created, and all your reviews. This cannot be undone.</p>
        <div v-if="deleteError" class="delete-error">{{ deleteError }}</div>
        <button class="delete-btn" :disabled="deleting" @click="deleteAccount">
          {{ deleting ? 'Deleting…' : 'Delete account' }}
        </button>
      </section>

    </div>
  </div>
</template>

<style scoped>
.profile-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.back-btn {
  display: inline-block;
  margin-bottom: 1.25rem;
  font-size: 0.875rem;
  color: var(--text);
  text-decoration: none;
  transition: color 0.15s;
}

.back-btn:hover {
  color: var(--accent);
}

.loading-text {
  padding: 2rem;
  color: var(--text);
  font-style: italic;
}

.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.profile-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.5rem;
  background: var(--bg);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-h);
  margin: 0 0 1.25rem;
}

.subsection-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-h);
  margin: 1.25rem 0 0.75rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.field.full-width {
  grid-column: 1 / -1;
}

.field label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text);
}

.field input,
.field select,
.field textarea {
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--code-bg);
  color: var(--text-h);
  font-size: 0.875rem;
  font-family: inherit;
  resize: vertical;
}

.field input:focus,
.field select:focus,
.field textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.save-btn {
  margin-top: 1.25rem;
  padding: 0.6rem 1.25rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.save-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.save-success {
  font-size: 0.85rem;
  color: var(--accent);
  margin-bottom: 0.75rem;
}

/* ── Favorites ───────────────────────────────── */

.empty-state {
  font-size: 0.875rem;
  color: var(--text);
  font-style: italic;
}

.favorites-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.favorite-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--code-bg);
}

.favorite-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-h);
}

.remove-btn {
  padding: 0.2rem 0.6rem;
  font-size: 0.78rem;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.remove-btn:hover {
  border-color: #f87171;
  color: #f87171;
}

/* ── Danger zone ─────────────────────────────── */

.danger-card {
  border-color: rgba(248, 113, 113, 0.4);
}

.danger-title {
  color: #f87171;
}

.danger-description {
  font-size: 0.875rem;
  color: var(--text);
  margin: 0 0 1rem;
  line-height: 1.5;
}

.delete-error {
  font-size: 0.8rem;
  color: #f87171;
  margin-bottom: 0.75rem;
}

.delete-btn {
  padding: 0.6rem 1.25rem;
  background: transparent;
  color: #f87171;
  border: 1px solid #f87171;
  border-radius: 7px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}

.delete-btn:hover {
  background: #f87171;
  color: #fff;
}

.delete-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>
