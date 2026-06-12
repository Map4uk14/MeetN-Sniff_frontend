<script setup>
import { ref, watch } from 'vue'
import { Parks } from '../api'

const props = defineProps({
  parkId: { type: String, required: true }
})

const parkData = ref(null)
const weatherData = ref(null)
const reviews = ref([])
const loading = ref(false)

watch(() => props.parkId, async (newId) => {
  if (!newId) return
  loading.value = true
  parkData.value = null
  weatherData.value = null
  reviews.value = []

  const [detailsResult, weatherResult, reviewsResult] = await Promise.allSettled([
    Parks.getOne(newId),
    Parks.getWeather(newId),
    Parks.getReviews(newId)
  ])

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
      <h3>{{ parkData.name }}</h3>
      <p class="description">{{ parkData.description }}</p>

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
          </div>
          <p v-if="review.title" class="review-title">{{ review.title }}</p>
          <p v-if="review.body" class="review-body">{{ review.body }}</p>
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
</style>
