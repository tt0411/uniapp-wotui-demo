<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { onPageScroll } from '@dcloudio/uni-app'
import {
  clampDockY,
  getStickyX,
  resolveDragPosition,
  snapDockPosition,
  type DockSide
} from './position'

export interface SideDockItem {
  /** 唯一标识 */
  key: string
  /** wd-icon 名称 */
  icon: string
  /** 菜单文案（展开后显示） */
  label: string
  /** 图标颜色，默认使用主题色 */
  color?: string
  /** 图标背景色，默认使用主题色 */
  backgroundColor?: string
  /** 图标颜色，默认白色 */
  iconColor?: string
  /** 角标文案 */
  badge?: string | number
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<{
  /** 菜单项配置 */
  items: SideDockItem[]
  /** 初始吸附方向 */
  side?: 'left' | 'right'
  /** 初始垂直位置（rpx），未传则取屏幕 40% */
  top?: number
  /** 顶部安全区（rpx），用于限制拖拽上边界 */
  safeTop?: number
  /** 底部安全区（rpx），用于限制拖拽下边界 */
  safeBottom?: number
  /** 本地持久化 key，不传则不记忆位置 */
  storageKey?: string
  /** 点击展开后多少毫秒自动收起，0 表示不自动 */
  collapseDelay?: number
  /** z-index */
  zIndex?: number
  /** 主题色（图标 & 边框） */
  themeColor?: string
  /** 收起宽度（rpx） */
  collapsedWidth?: number
  /** 展开宽度（rpx） */
  expandedWidth?: number
  /** 外部控制隐藏 */
  hidden?: boolean
  /** 页面滚动时是否自动隐藏 */
  hideOnScroll?: boolean
  /** 停止滚动后多少毫秒显示 */
  scrollShowDelay?: number
}>(), {
  side: 'right',
  top: 0,
  safeTop: 180,
  safeBottom: 220,
  storageKey: '',
  collapseDelay: 0,
  zIndex: 99,
  themeColor: 'var(--app-color-info)',
  collapsedWidth: 88,
  expandedWidth: 196,
  hidden: false,
  hideOnScroll: true,
  scrollShowDelay: 180
})

const emit = defineEmits<{
  (e: 'select', item: SideDockItem, index: number): void
  (e: 'expand', expanded: boolean): void
  (e: 'dragend', pos: { side: 'left' | 'right'; top: number }): void
}>()

// 屏幕尺寸（px）
const sysInfo = uni.getSystemInfoSync()
const screenW = sysInfo.windowWidth
const screenH = sysInfo.windowHeight
// rpx -> px 换算
const rpx2px = (rpx: number) => (rpx * screenW) / 750
const px2rpx = (px: number) => (px * 750) / screenW

const expanded = ref(false)
const side = ref<DockSide>(props.side)
const posX = ref(0)
const posY = ref(0)
const dragging = ref(false)
const moved = ref(false)
const scrollHidden = ref(false)
const touchStartX = ref(0)
const touchStartY = ref(0)
const touchStartLeft = ref(0)
const touchStartTop = ref(0)

const dockWidthPx = computed(() => rpx2px(expanded.value ? props.expandedWidth : props.collapsedWidth))

const dockBounds = computed(() => ({
  screenW,
  screenH,
  safeTop: rpx2px(props.safeTop),
  safeBottom: rpx2px(props.safeBottom)
}))

function clampY(y: number) {
  return clampDockY(y, dockBounds.value)
}

function computeStickyX() {
  return getStickyX(side.value, dockWidthPx.value, screenW)
}

// 读取持久化
function loadPersist() {
  if (!props.storageKey) return false
  try {
    const raw = uni.getStorageSync(props.storageKey)
    if (raw && typeof raw === 'object') {
      if (raw.side === 'left' || raw.side === 'right') side.value = raw.side
      if (typeof raw.topRpx === 'number') {
        posY.value = clampY(rpx2px(raw.topRpx))
        return true
      }
    }
  } catch {}
  return false
}

function savePersist() {
  if (!props.storageKey) return
  try {
    uni.setStorageSync(props.storageKey, {
      side: side.value,
      topRpx: px2rpx(posY.value)
    })
  } catch {}
}

onMounted(() => {
  const hit = loadPersist()
  if (!hit) {
    posY.value = clampY(props.top > 0 ? rpx2px(props.top) : screenH * 0.4)
  }
  posX.value = computeStickyX()
})

watch(expanded, (val) => {
  emit('expand', val)
  if (!dragging.value) posX.value = computeStickyX()
})

let collapseTimer: any = null
let scrollTimer: any = null
function scheduleAutoCollapse() {
  if (!props.collapseDelay) return
  clearTimeout(collapseTimer)
  collapseTimer = setTimeout(() => {
    expanded.value = false
  }, props.collapseDelay)
}

function handleItemTap(item: SideDockItem, index: number) {
  if (moved.value) return
  if (!expanded.value) {
    expanded.value = true
    scheduleAutoCollapse()
    return
  }
  if (item.disabled) return
  emit('select', item, index)
  if (props.collapseDelay) scheduleAutoCollapse()
}

function getTouch(e: any) {
  return e.changedTouches?.[0] || e.touches?.[0]
}

function onTouchStart(e: any) {
  if (isHidden.value) return
  const touch = getTouch(e)
  if (!touch) return
  touchStartX.value = touch.clientX
  touchStartY.value = touch.clientY
  touchStartLeft.value = posX.value
  touchStartTop.value = posY.value
  dragging.value = false
  moved.value = false
}

function onTouchMove(e: any) {
  if (isHidden.value) return
  const touch = getTouch(e)
  if (!touch) return
  const dx = touch.clientX - touchStartX.value
  const dy = touch.clientY - touchStartY.value
  if (Math.abs(dx) > 6 || Math.abs(dy) > 6) {
    dragging.value = true
    moved.value = true
  }
  if (!dragging.value) return
  const next = resolveDragPosition({
    startLeft: touchStartLeft.value,
    startTop: touchStartTop.value,
    deltaX: dx,
    deltaY: dy,
    width: dockWidthPx.value,
    ...dockBounds.value
  })
  posX.value = next.x
  posY.value = next.y
}

function onTouchEnd(e: any) {
  if (isHidden.value) return
  if (!dragging.value) {
    setTimeout(() => {
      moved.value = false
    }, 0)
    return
  }
  const next = snapDockPosition({
    x: posX.value,
    y: posY.value,
    width: dockWidthPx.value,
    ...dockBounds.value
  })
  side.value = next.side
  posX.value = next.x
  posY.value = next.y
  // 延迟复位 dragging，避免触发点击
  setTimeout(() => {
    dragging.value = false
    moved.value = false
  }, 50)
  savePersist()
  emit('dragend', { side: side.value, top: px2rpx(posY.value) })
}

onPageScroll(() => {
  if (!props.hideOnScroll || dragging.value) return
  scrollHidden.value = true
  clearTimeout(scrollTimer)
  scrollTimer = setTimeout(() => {
    scrollHidden.value = false
  }, props.scrollShowDelay)
})

const isHidden = computed(() => props.hidden || scrollHidden.value)

const viewStyle = computed(() => {
  return [
    `width:${dockWidthPx.value}px;`,
    `left:${posX.value}px;`,
    `top:${posY.value}px;`,
    `z-index:${props.zIndex};`,
    dragging.value
      ? 'transition:none;'
      : 'transition:left 0.22s ease, top 0.22s ease, width 0.18s ease, opacity 0.2s ease, transform 0.2s ease;'
  ].join('')
})

function getItemIconStyle(item: SideDockItem) {
  return {
    backgroundColor: item.backgroundColor || item.color || props.themeColor
  }
}
</script>

<template>
  <view
    class="side-dock"
    :class="[`is-${side}`, { 'is-hidden': isHidden }]"
    :style="viewStyle"
    @touchstart="onTouchStart"
    @touchmove="onTouchMove"
    @touchend="onTouchEnd"
    @touchcancel="onTouchEnd"
  >
    <view
      class="side-dock__inner"
      :class="[expanded ? 'is-expanded' : 'is-collapsed', `is-${side}`]"
    >
      <view
        v-for="(item, index) in items"
        :key="item.key"
        class="side-dock__item"
        :class="{ 'is-disabled': item.disabled }"
        @tap.stop="handleItemTap(item, index)"
      >
        <view class="side-dock__icon" :style="getItemIconStyle(item)">
          <wd-icon
            :name="item.icon"
            size="36rpx"
            :color="item.iconColor || 'var(--app-text-inverse)'"
          />
          <text v-if="item.badge !== undefined && item.badge !== ''" class="side-dock__badge">
            {{ item.badge }}
          </text>
        </view>
        <text v-if="expanded" class="side-dock__label">{{ item.label }}</text>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.side-dock {
  position: fixed;
  pointer-events: auto;
  height: auto;
  box-sizing: border-box;
  opacity: 1;
  transform: translateX(0) scale(1);
  transform-origin: center right;
}

.side-dock.is-left {
  transform-origin: center left;
}

.side-dock.is-hidden {
  opacity: 0;
  pointer-events: none;
}

.side-dock.is-hidden.is-left {
  transform: translateX(-100%) scale(0.92);
}

.side-dock.is-hidden.is-right {
  transform: translateX(100%) scale(0.92);
}

.side-dock__inner {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 12rpx;
}

.side-dock__item {
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  min-height: 74rpx;
  padding: 10rpx 18rpx;
  gap: 12rpx;
  box-sizing: border-box;
  background-color: var(--app-bg-card);
  border: 2rpx solid var(--app-border-primary);
  box-shadow: var(--app-shadow-float);

  &.is-disabled {
    opacity: 0.4;
  }

  &:active {
    background-color: var(--app-color-info-soft);
  }
}

.is-left .side-dock__item {
  border-left: none;
  border-radius: 0 40rpx 40rpx 0;
}

.is-right .side-dock__item {
  border-right: none;
  border-radius: 40rpx 0 0 40rpx;
}

.side-dock__icon {
  position: relative;
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: none;
}

.side-dock__badge {
  position: absolute;
  top: -8rpx;
  right: -8rpx;
  min-width: 28rpx;
  height: 28rpx;
  padding: 0 6rpx;
  border-radius: 14rpx;
  background-color: var(--app-color-danger);
  color: var(--app-text-inverse);
  font-size: 20rpx;
  line-height: 28rpx;
  text-align: center;
  box-sizing: border-box;
}

.side-dock__label {
  font-size: 26rpx;
  color: var(--app-text-brand);
  white-space: nowrap;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-collapsed .side-dock__item {
  justify-content: center;
  padding: 10rpx 14rpx;
}
</style>
