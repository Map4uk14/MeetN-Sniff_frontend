<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  parks: { type: Array, default: () => [] },
})

const emit = defineEmits(['park-selected'])

const mapRef = ref(null)

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

  const defaultCenter = props.parks.length > 0
    ? { lat: props.parks[0].location.coordinates[1], lng: props.parks[0].location.coordinates[0] }
    : { lat: 48.210033, lng: 16.363449 }

  // mapId is required for AdvancedMarkerElement to work
  const map = new google.maps.Map(mapRef.value, {
    center: defaultCenter,
    zoom: 13,
    mapId: 'DEMO_MAP_ID',
  })

  for (const park of props.parks) {
    // GeoJSON stores coordinates as [longitude, latitude] — swap for Google Maps
    const [lng, lat] = park.location.coordinates
    const marker = new google.maps.marker.AdvancedMarkerElement({
      position: { lat, lng },
      map,
      title: park.name,
    })
    marker.addListener('click', () => emit('park-selected', park.id))
  }
})
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
