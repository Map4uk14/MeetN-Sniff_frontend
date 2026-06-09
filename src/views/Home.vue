<script setup>
import { ref, onMounted } from 'vue'
import { Parks } from '../api'
import ParkMap from '../components/ParkMap.vue'
import ParkDetails from '../components/ParkDetails.vue'

const parks = ref([])
const selectedParkId = ref(null)
const loading = ref(false)
const error = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    const data = await Parks.getAll()
    parks.value = data.data
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="home-layout">

    <!-- Map column -->
    <div class="map-col">
      <ParkMap :parks="parks" @park-selected="selectedParkId = $event" />
    </div>

    <!-- Sidebar column -->
    <div class="sidebar-col">

      <div v-if="loading" class="sidebar-state">Loading parks…</div>
      <div v-else-if="error" class="sidebar-state error">{{ error }}</div>

      <div v-else class="park-list">
        <div
          v-for="park in parks"
          :key="park.id"
          class="park-list-item"
          :class="{ active: park.id === selectedParkId }"
          @click="selectedParkId = park.id"
        >
          <span class="park-name">{{ park.name }}</span>
          <span class="park-city">{{ park.address?.city }}</span>
          <span class="park-rating">★ {{ park.ratingSummary?.averageRating?.toFixed(1) ?? '—' }}</span>
        </div>
      </div>

      <ParkDetails v-if="selectedParkId" :parkId="selectedParkId" />

    </div>
  </div>
</template>

<style scoped>
.home-layout {
  display: flex;
  /* Subtract the NavBar height so the layout doesn't overflow the viewport */
  height: calc(100vh - 52px);
  overflow: hidden;
  text-align: left;
}

.map-col {
  flex: 0 0 60%;
  overflow: hidden;
}

/* Override the fixed 500px height so the map fills the full column */
.map-col :deep(.map-container) {
  height: calc(100vh - 52px);
}

.sidebar-col {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--border);
}

.sidebar-state {
  padding: 1.5rem;
  font-size: .875rem;
  color: var(--text);
}

.sidebar-state.error {
  color: #ff6b6b;
}

.park-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.park-list-item {
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  background: var(--code-bg);
  transition: border-color .15s, background .15s;
}

.park-list-item:hover,
.park-list-item.active {
  border-color: var(--accent);
  background: var(--accent-bg);
}

.park-name {
  display: block;
  font-weight: 600;
  font-size: 0.95rem;
  color: var(--text-h);
}

.park-city {
  display: block;
  font-size: 0.8rem;
  color: var(--text);
}

.park-rating {
  display: block;
  font-size: 0.8rem;
  color: var(--accent);
  margin-top: 2px;
}
</style>
