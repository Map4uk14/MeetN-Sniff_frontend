<script setup>
import { ref, computed, watch } from 'vue'
import { Parks, Reviews, User } from '../api'

const props = defineProps({
  parkId: { type: String, required: true }
})

const parkData = ref(null)
const weatherData = ref(null)
const reviews = ref([])
const loading = ref(false)
const favorites = ref([])

const currentUser = computed(() => {
  const raw = localStorage.getItem('user')
  return raw ? JSON.parse(raw) : null
})

const isCreator = computed(() =>
  parkData.value?.createdBy?.id === currentUser.value?.id
)

const isFavorited = computed(() =>
  favorites.value.some(f => f.id === props.parkId)
)

// Park edit state
const editMode = ref(false)
const editForm = ref({ name: '', description: '' })
const editError = ref(null)
const editLoading = ref(false)

function startEdit() {
  editForm.value = { name: parkData.value.name, description: parkData.value.description }
  editMode.value = true
}

async function saveEdit() {
  editError.value = null
  editLoading.value = true
  try {
    const result = await Parks.updatePark(props.parkId, editForm.value)
    parkData.value = result.park
    editMode.value = false
  } catch (err) {
    editError.value = err.message
  } finally {
    editLoading.value = false
  }
}

//Checking if the current user has already reviewed the park
const hasReviewed = computed(() =>
  reviews.value.some(r => r.user?.id === currentUser.value?.id) 
)

// Review form state
const form = ref({ rating: 5, title: '', body: '' })
const formError = ref(null)
const formLoading = ref(false)

async function submitReview() {
  formError.value = null
  formLoading.value = true
  try {
    const result = await Parks.createReview(props.parkId, form.value)
    reviews.value.unshift(result.review)
    form.value = { rating: 5, title: '', body: '' }
  } catch (err) {
    formError.value = err.message
  } finally {
    formLoading.value = false
  }
}

async function deleteReview(reviewId) {
  if (!confirm('Delete your review?')) return
  try {
    await Reviews.delete(reviewId)
    reviews.value = reviews.value.filter(r => r.id !== reviewId)
  } catch (err) {
    console.error('Failed to delete review:', err.message)
  }
}

async function toggleFavorite() {
  if (isFavorited.value) {
    await User.removeFavorite(props.parkId)
    favorites.value = [...favorites.value.filter(f => f.id !== props.parkId)]
  } else {
    const res = await User.addFavorite(props.parkId)
    favorites.value = [...favorites.value, res.park]
  }
}

watch(() => props.parkId, async (newId) => {
  if (!newId) return
  loading.value = true
  parkData.value = null
  weatherData.value = null
  reviews.value = []

  const requests = [
    Parks.getOne(newId),
    Parks.getWeather(newId),
    Parks.getReviews(newId),
  ]

  // Load favorites alongside park details if user is logged in
  if (currentUser.value) requests.push(User.getFavorites())

  const [detailsResult, weatherResult, reviewsResult, favoritesResult] = await Promise.allSettled(requests)

  if (detailsResult.status === 'fulfilled') {
    parkData.value = detailsResult.value.park
  } else {
    console.error('Failed to load park details:', detailsResult.reason)
  }

  if (weatherResult.status === 'fulfilled') {
    weatherData.value = weatherResult.value.weather
  }

  if (reviewsResult.status === 'fulfilled') {
    reviews.value = reviewsResult.value.data
  }

  if (favoritesResult?.status === 'fulfilled') {
    favorites.value = favoritesResult.value.data
  }

  loading.value = false
}, { immediate: true })

function stars(rating) {
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}
</script>

<template>
  <div class="park-details">
    <div v-if="loading" class="loading-text">Loading park details…</div>

    <div v-else-if="parkData">

      <!-- View mode -->
      <div v-if="!editMode" class="park-header">
        <h3>{{ parkData.name }}</h3>
        <div class="park-header-actions">
          <button
            v-if="currentUser"
            class="favorite-btn"
            :class="{ favorited: isFavorited }"
            @click="toggleFavorite"
          >
            {{ isFavorited ? '♥ Saved' : '♡ Save' }}
          </button>
          <button v-if="isCreator" class="edit-park-btn" @click="startEdit">Edit</button>
        </div>
      </div>
      <p v-if="!editMode" class="description">{{ parkData.description }}</p>

      <!-- Inline edit form (creator only/admin) -->
      <div v-if="editMode" class="park-edit-form">
        <div v-if="editError" class="form-error">{{ editError }}</div>
        <div class="form-field">
          <label>Park name</label>
          <input v-model="editForm.name" type="text" />
        </div>
        <div class="form-field">
          <label>Description</label>
          <textarea v-model="editForm.description" rows="3" />
        </div>
        <div class="edit-actions">
          <button class="submit-review-btn" :disabled="editLoading" @click="saveEdit">
            {{ editLoading ? 'Saving…' : 'Save' }}
          </button>
          <button class="cancel-btn" @click="editMode = false">Cancel</button>
        </div>
      </div>

      <div v-if="weatherData" class="weather-strip">
        <strong>Weather:</strong> {{ Math.round(weatherData.temperature) }}°C — {{ weatherData.description }}
      </div>

      <div class="tags">
        <span v-for="tag in parkData.tags" :key="tag" class="tag">#{{ tag }}</span>
      </div>

      <!-- Reviews -->
      <div class="reviews-section">
        <h4 class="reviews-heading">
          Reviews
          <span class="review-count">{{ reviews.length }}</span>
        </h4>

        <div v-if="reviews.length === 0" class="no-reviews">No reviews yet.</div>

        <div v-for="review in reviews" :key="review.id" class="review-card">
          <div class="review-header">
            <span class="review-stars">{{ stars(review.rating) }}</span>
            <span class="review-author">
              {{ review.user.displayName || review.user.username }}
              <span v-if="review.user.dog?.name" class="review-dog">& {{ review.user.dog.name }}</span>
            </span>
            <button
              v-if="review.user?.id === currentUser?.id"
              class="delete-review-btn"
              @click="deleteReview(review.id)"
            >Delete</button>
          </div>
          <p v-if="review.title" class="review-title">{{ review.title }}</p>
          <p v-if="review.body" class="review-body">{{ review.body }}</p>
        </div>

        <!-- Write a review -->
        <div v-if="!hasReviewed" class="review-form">
          <h5 class="review-form-heading">Write a review</h5>
          <div v-if="formError" class="form-error">{{ formError }}</div>
          <div class="form-field">
            <label>Rating</label>
            <select v-model.number="form.rating">
              <option v-for="n in 5" :key="n" :value="n">{{ stars(n) }}</option>
            </select>
          </div>
          <div class="form-field">
            <label>Title</label>
            <input v-model="form.title" type="text" placeholder="One-line summary" />
          </div>
          <div class="form-field">
            <label>Review</label>
            <textarea v-model="form.body" rows="3" placeholder="Share your experience…" />
          </div>
          <button class="submit-review-btn" :disabled="formLoading" @click="submitReview">
            {{ formLoading ? 'Submitting…' : 'Submit review' }}
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.park-details {
  padding: 1.25rem;
  border-top: 1px solid var(--border);
}

.description {
  font-size: 0.9rem;
  color: var(--text);
  line-height: 1.4;
}

.weather-strip {
  background: var(--accent-bg);
  padding: 0.6rem;
  border-radius: 6px;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 500;
  margin: 0.75rem 0;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.tag {
  font-size: 0.75rem;
  background: var(--code-bg);
  border: 1px solid var(--border);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  color: var(--text);
}

.loading-text {
  color: var(--text);
  font-style: italic;
}

/* ── Park edit ──────────────────────────────── */

.park-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.park-header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.edit-park-btn {
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  border: 1px solid var(--border);
  border-radius: 5px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.edit-park-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.favorite-btn {
  padding: 0.25rem 0.65rem;
  font-size: 0.78rem;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--code-bg);
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s, color 0.15s;
}

.favorite-btn.favorited {
  border-color: var(--accent);
  background: var(--accent-bg);
  color: var(--accent);
}

.park-edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  margin-bottom: 0.75rem;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.cancel-btn {
  padding: 0.5rem 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--text);
  font-size: 0.875rem;
  cursor: pointer;
  transition: border-color 0.15s;
}

.cancel-btn:hover {
  border-color: var(--accent);
}

/* ── Reviews ────────────────────────────────── */

.reviews-section {
  margin-top: 1.25rem;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.reviews-heading {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-h);
  margin: 0 0 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.review-count {
  background: var(--code-bg);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.1rem 0.45rem;
  border-radius: 10px;
}

.no-reviews {
  font-size: 0.85rem;
  color: var(--text);
  font-style: italic;
}

.review-card {
  padding: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--code-bg);
  margin-bottom: 0.5rem;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.35rem;
}

.review-stars {
  font-size: 0.85rem;
  color: var(--accent);
  letter-spacing: 1px;
}

.review-author {
  font-size: 0.8rem;
  color: var(--text);
  font-weight: 600;
}

.review-dog {
  font-weight: 400;
  color: var(--text);
}

.review-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-h);
  margin-bottom: 0.25rem;
}

.review-body {
  font-size: 0.825rem;
  color: var(--text);
  line-height: 1.45;
}

.delete-review-btn {
  margin-left: auto;
  padding: 0.2rem 0.55rem;
  font-size: 0.75rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}

.delete-review-btn:hover {
  border-color: #f87171;
  color: #f87171;
}

/* ── Write a review form ────────────────────── */

.review-form {
  margin-top: 1rem;
  padding: 0.85rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--code-bg);
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.review-form-heading {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-h);
  margin: 0;
}

.form-error {
  font-size: 0.8rem;
  color: #f87171;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.form-field label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text);
}

.form-field input,
.form-field select,
.form-field textarea {
  padding: 0.4rem 0.6rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--bg);
  color: var(--text-h);
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--accent);
}

.submit-review-btn {
  padding: 0.5rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.submit-review-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}
</style>