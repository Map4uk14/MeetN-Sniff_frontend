<script setup>
import { onMounted, ref, shallowRef, watch } from 'vue'

const props = defineProps({
  parks: { type: Array, default: () => [] },
})

const emit = defineEmits(['park-selected'])

const mapRef = ref(null)
const mapInstance = shallowRef(null)

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve) => {
    if (window.google?.maps) {
      resolve()
      return
    }
    const script = document.createElement('script')
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

  // mapId is required for AdvancedMarkerElement to work
  mapInstance.value = new google.maps.Map(mapRef.value, {
    center: { lat: 48.210033, lng: 16.363449 },
    zoom: 13,
    mapId: 'DEMO_MAP_ID',
  })
})

// Parks data and map initialization are independent async operations —
// either can finish first. Watch both and place markers once both are ready.
watch([mapInstance, () => props.parks], ([map, parks]) => {
  if (!map || parks.length === 0) return

  map.setCenter({
    lat: parks[0].location.coordinates[1],
    lng: parks[0].location.coordinates[0],
  })

  for (const park of parks) {
    // GeoJSON stores coordinates as [longitude, latitude] — swap for Google Maps
    const [lng, lat] = park.location.coordinates
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat, lng },
      map,
      title: park.name,
    })
    marker.addListener('gmp-click', () => emit('park-selected', park.id))
  }
})

// Pan (and zoom in) the map to a given park's location
function focusPark(park) {
  if (!mapInstance.value) return
  const [lng, lat] = park.location.coordinates
  mapInstance.value.panTo({ lat, lng })
  mapInstance.value.setZoom(15)
}

defineExpose({ focusPark })
</script>

<template>
  <div ref="mapRef" class="map-container" />
</template>

<style scoped>
.map-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
  border: 1px solid var(--border, #ccc);
}
</style>