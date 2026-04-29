import { defineStore } from 'pinia'
import { ref } from 'vue'

export type TabBarMode = 'normal' | 'floating'
export type ThemeMode = 'light' | 'dark'
export type ThemeName = 'default'

// Storage keys
const STORAGE_KEY_TABBAR_MODE = 'app_tabbar_mode'
const STORAGE_KEY_THEME_MODE = 'app_theme_mode'

export const useAppStore = defineStore('app', () => {
  // 从本地存储初始化，默认值为 'normal' 和 'light'
  const tabBarMode = ref<TabBarMode>(uni.getStorageSync(STORAGE_KEY_TABBAR_MODE) || 'normal')
  const activeTab = ref<string>('/pages/tabs/home')
  const themeMode = ref<ThemeMode>(uni.getStorageSync(STORAGE_KEY_THEME_MODE) || 'light')
  const themeName = ref<ThemeName>('default')

  function toggleTabBarMode() {
    const newMode = tabBarMode.value === 'normal' ? 'floating' : 'normal'
    tabBarMode.value = newMode
    uni.setStorageSync(STORAGE_KEY_TABBAR_MODE, newMode)
  }

  function setTabBarMode(mode: TabBarMode) {
    tabBarMode.value = mode
    uni.setStorageSync(STORAGE_KEY_TABBAR_MODE, mode)
  }

  function setActiveTab(path: string) {
    activeTab.value = path
  }

  function setThemeMode(mode: ThemeMode) {
    themeMode.value = mode
    uni.setStorageSync(STORAGE_KEY_THEME_MODE, mode)
  }

  function toggleThemeMode() {
    const newMode = themeMode.value === 'light' ? 'dark' : 'light'
    themeMode.value = newMode
    uni.setStorageSync(STORAGE_KEY_THEME_MODE, newMode)
  }

  function setThemeName(name: ThemeName) {
    themeName.value = name
  }

  return {
    tabBarMode,
    activeTab,
    themeMode,
    themeName,
    toggleTabBarMode,
    setTabBarMode,
    setActiveTab,
    setThemeMode,
    toggleThemeMode,
    setThemeName
  }
})
