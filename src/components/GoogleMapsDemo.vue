<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  parks: { type: Array, default: () => [] },
})

const emit = defineEmits(['park-selected'])

const router = useRouter()
const mapRef = ref(null)

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve) => {
    if (window.google?.maps) {
      resolve()
      return
    }
    const script = document.createElement('script')
    // Added libraries=marker to load the new advanced marker element engine
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`
    script.async = true
    script.defer = true
    script.onload = resolve
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.error('Missing VITE_GOOGLE_MAPS_API_KEY environment variable.')
    return
  }

  await loadGoogleMapsScript(apiKey)

  // Centre on first park if available, otherwise default to Vienna
  const defaultCenter = props.parks.length > 0
    ? { lat: props.parks[0].location.coordinates[1], lng: props.parks[0].location.coordinates[0] }
    : { lat: 48.210033, lng: 16.363449 }

  // Modern configuration requires a mapId for AdvancedMarkerElement to work
  const map = new google.maps.Map(mapRef.value, {
    center: defaultCenter,
    zoom: 13,
    mapId: 'DEMO_MAP_ID',
  })

  // Place a marker for every park; GeoJSON stores [longitude, latitude]
  for (const park of props.parks) {
    const [lng, lat] = park.location.coordinates
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat, lng },
      map,
      title: park.name,
    })
    marker.addListener('click', () => emit('park-selected', park.id))
  }
})

// Utility clear function to let users scrub their local sessions safely
function handleLogout() {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<template>
  <div class="map-wrapper">
    <div class="dashboard-header">
      <h2>Google Maps Engine</h2>
      <button class="btn secondary logout-btn" @click="handleLogout">Sign out</button>
    </div>
    
    <div ref="mapRef" class="map-container" />
  </div>
</template>

<style scoped>
.map-wrapper {
  padding: 1rem;
  font-family: sans-serif;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.map-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  border: 1px solid var(--border, #ccc);
}

.logout-btn {
  padding: 0.5rem 1rem;
  cursor: pointer;
}
</style>