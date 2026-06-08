<script setup>
import { ref, watch } from 'vue';
import { Parks } from '../api';

const props = defineProps({
  parkId: { type: String, required: true }
});

const parkData = ref(null);
const weatherData = ref(null);
const loading = ref(false);

// Fired automatically when a user selects a park pin or list card
watch(() => props.parkId, async (newId) => {
  if (!newId) return;
  loading.value = true;
  parkData.value = null;
  weatherData.value = null;

  try {
    // Hits both endpoints asynchronously
    const [details, weather] = await Promise.all([
      Parks.getOne(newId),
      Parks.getWeather(newId)
    ]);
    
    parkData.value = details.data;
    weatherData.value = weather.data;
  } catch (err) {
    console.error('S2 component fetch error:', err);
  } finally {
    loading.value = false;
  }
}, { immediate: true });
</script>

<template>
  <div class="details-widget">
    <div v-if="loading" class="muted">Inspecting park parameters...</div>
    
    <div v-else-if="parkData">
      <h3> {{ parkData.name }}</h3>
      <p class="description">{{ parkData.description }}</p>

      <div v-if="weatherData" class="weather-strip">
        <p> <strong>Live Climate:</strong> {{ Math.round(weatherData.temperature) }}°C — {{ weatherData.condition }}</p>
      </div>

      <div class="tags">
        <span v-for="tag in parkData.tags" :key="tag" class="tag">#{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.details-widget { background: #f9fafb; border: 1px solid #e5e7eb; padding: 1.25rem; border-radius: 8px; margin-top: 1rem; }
.description { font-size: 0.9rem; color: #4b5563; line-height: 1.4; }
.weather-strip { background: #eff6ff; padding: 0.6rem; border-radius: 6px; color: #1e40af; font-size: 0.85rem; margin: 0.75rem 0; font-weight: 500; }
.tags { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
.tag { font-size: 0.75rem; background: #e5e7eb; padding: 0.2rem 0.5rem; border-radius: 4px; color: #374151; }
.muted { color: #6b7280; font-style: italic; }
</style>