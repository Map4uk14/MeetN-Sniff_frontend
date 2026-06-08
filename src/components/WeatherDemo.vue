<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'

const weather = ref(null)
const error = ref(null)

onMounted(async () => {
  const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY
  const city = 'Vienna'

  if (!apiKey) {
    error.value = 'Missing VITE_OPENWEATHERMAP_API_KEY environment configuration variable.'
    return
  }

  try {
    const response = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
      params: {
        q: city,
        appid: apiKey,
        units: 'metric',
      },
    })
    weather.value = response.data
  } catch (e) {
    error.value = e.response?.data?.message || e.message
  }
})
</script>

<template>
  <div class="weather-wrapper">
    <h2>Local Climate Metrics</h2>

    <div v-if="error" class="alerts">
      <div class="alert error">{{ error }}</div>
    </div>

    <div v-else-if="weather" class="weather-card card">
      <p class="temp">{{ Math.round(weather.main.temp) }}°C</p>
      <p class="desc">{{ weather.weather[0].description }}</p>
      <p class="details muted">
        Feels like {{ Math.round(weather.main.feels_like) }}°C &middot;
        Humidity {{ weather.main.humidity }}%
      </p>
    </div>

    <div v-else class="muted">
      <p>Collecting active meteorological parameters...</p>
    </div>
  </div>
</template>

<style scoped>
.weather-wrapper {
  padding: 1rem;
  font-family: sans-serif;
}

.weather-card {
  display: inline-block;
  padding: 1.5rem 2rem;
  border: 1px solid var(--border, #ddd);
  border-radius: 8px;
  text-align: center;
}

.temp {
  font-size: 3rem;
  font-weight: bold;
  margin: 0;
}

.desc {
  text-transform: capitalize;
  margin: 0.25rem 0;
}

.details {
  font-size: 0.875rem;
}
</style>