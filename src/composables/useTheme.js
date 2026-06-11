import { ref } from 'vue'

const isDark = ref(localStorage.getItem('theme') === 'dark')

function apply() {
  document.documentElement.dataset.theme = isDark.value ? 'dark' : ''
}

apply()

export function useTheme() {
  function toggle() {
    isDark.value = !isDark.value
    localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
    apply()
  }
  return { isDark, toggle }
}
