<script setup>
import { onMounted, ref } from 'vue'

const mapRef = ref(null)

function loadGoogleMapsScript(apiKey) {
  return new Promise((resolve) => {
    if (window.google?.maps) {
      resolve()
      return
    }
    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    script.onload = resolve
    document.head.appendChild(script)
  })
}

onMounted(async () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  await loadGoogleMapsScript(apiKey)

  // Basic request: center map on Vienna and drop a marker
  const vie = { lat: 48.210033, lng: 16.363449 }

  const map = new google.maps.Map(mapRef.value, {
    center: vie,
    zoom: 13,
  })

  new google.maps.Marker({
    position: vie,
    map,
    title: 'Vienna',
  })
})
</script>

<template>
  <div class="map-wrapper">
    <h2>Google Maps Demo</h2>
    <div ref="mapRef" class="map-container" />
  </div>
</template>

<style scoped>
.map-wrapper {
  padding: 1rem;
  font-family: sans-serif;
}

.map-container {
  width: 100%;
  height: 500px;
  border-radius: 8px;
}
</style>
