<script setup>
import { ref, watch } from 'vue'
import { Parks } from '../api'

const props = defineProps({
  parkId: { type: String, required: true }
})

const parkData = ref(null)
const weatherData = ref(null)
const loading = ref(false)

watch(() => props.parkId, async (newId) => {
  if (!newId) return
  loading.value = true
  parkData.value = null
  weatherData.value = null

  const [detailsResult, weatherResult] = await Promise.allSettled([
    Parks.getOne(newId),
    Parks.getWeather(newId)
  ])

  if (detailsResult.status === 'fulfilled') {
    parkData.value = detailsResult.value.park
  } else {
    console.error('Failed to load park details:', detailsResult.reason)
  }

  if (weatherResult.status === 'fulfilled') {
    weatherData.value = weatherResult.value.weather
  }

  loading.value = false
}, { immediate: true })
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
</style>
