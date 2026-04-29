<script setup lang="ts">
import { computed } from 'vue'

export type WaterfallItem = {
  id?: string | number
  key?: string | number
  width?: number
  height?: number
  imageWidth?: number
  imageHeight?: number
  title?: string
  desc?: string
  [key: string]: any
}

const props = withDefaults(defineProps<{
  list: WaterfallItem[]
  columns?: number
  gap?: number
  imageWidthKey?: string
  imageHeightKey?: string
  titleKey?: string
  descKey?: string
}>(), {
  columns: 2,
  gap: 20,
  imageWidthKey: 'width',
  imageHeightKey: 'height',
  titleKey: 'title',
  descKey: 'desc'
})

const safeColumns = computed(() => Math.max(1, Math.min(Number(props.columns) || 2, 4)))
const columnGap = computed(() => `${props.gap}rpx`)

function getNumber(item: WaterfallItem, key: string) {
  const value = Number(item?.[key])
  return Number.isFinite(value) && value > 0 ? value : 0
}

function getTextLength(item: WaterfallItem, key: string) {
  const value = item?.[key]
  return typeof value === 'string' ? value.length : 0
}

function getEstimatedHeight(item: WaterfallItem) {
  const imageWidth = getNumber(item, props.imageWidthKey) || getNumber(item, 'imageWidth') || 1
  const imageHeight = getNumber(item, props.imageHeightKey) || getNumber(item, 'imageHeight') || imageWidth
  const imageRatioHeight = imageHeight / imageWidth
  const titleRows = Math.ceil(getTextLength(item, props.titleKey) / 12)
  const descRows = Math.ceil(getTextLength(item, props.descKey) / 16)

  return imageRatioHeight * 320 + Math.min(titleRows, 2) * 44 + Math.min(descRows, 2) * 34 + 96
}

const columnsList = computed(() => {
  const result = Array.from({ length: safeColumns.value }, () => [] as Array<{ item: WaterfallItem; index: number }>)
  const heights = Array.from({ length: safeColumns.value }, () => 0)

  props.list.forEach((item, index) => {
    const targetIndex = heights.indexOf(Math.min(...heights))
    result[targetIndex].push({ item, index })
    heights[targetIndex] += getEstimatedHeight(item) + props.gap
  })

  return result
})

function getItemKey(item: WaterfallItem, index: number) {
  return item.id ?? item.key ?? index
}
</script>

<template>
  <view class="waterfall-flow" :style="{ gap: columnGap }">
    <view
      v-for="(column, columnIndex) in columnsList"
      :key="columnIndex"
      class="waterfall-flow__column"
      :style="{ gap: columnGap }"
    >
      <view
        v-for="{ item, index } in column"
        :key="getItemKey(item, index)"
        class="waterfall-flow__item"
      >
        <slot name="item" :item="item" :index="index">
          <view class="waterfall-flow__fallback">
            <image
              v-if="item.image || item.cover"
              class="waterfall-flow__fallback-image"
              :src="item.image || item.cover"
              mode="widthFix"
            />
            <view class="waterfall-flow__fallback-body">
              <view v-if="item.title" class="waterfall-flow__fallback-title">{{ item.title }}</view>
              <view v-if="item.desc" class="waterfall-flow__fallback-desc">{{ item.desc }}</view>
            </view>
          </view>
        </slot>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.waterfall-flow {
  display: flex;
  align-items: flex-start;
  width: 100%;
  box-sizing: border-box;
}

.waterfall-flow__column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.waterfall-flow__item {
  width: 100%;
  min-width: 0;
}

.waterfall-flow__fallback {
  overflow: hidden;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
}

.waterfall-flow__fallback-image {
  display: block;
  width: 100%;
}

.waterfall-flow__fallback-body {
  padding: 18rpx;
}

.waterfall-flow__fallback-title {
  font-size: 28rpx;
  font-weight: 600;
  line-height: 1.4;
  color: var(--app-text-primary);
}

.waterfall-flow__fallback-desc {
  margin-top: 8rpx;
  font-size: 24rpx;
  line-height: 1.45;
  color: var(--app-text-secondary);
}
</style>
