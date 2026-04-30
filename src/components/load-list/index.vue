<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, onMounted, ref, watch } from 'vue'

type ApiFn = (params: Record<string, any>) => Promise<any>
type ListStatus = 'idle' | 'loading' | 'refreshing' | 'loadingMore' | 'error'

const props = withDefaults(defineProps<{
  api: ApiFn
  params?: Record<string, any>
  height?: string
  autoHeight?: boolean
  pageKey?: string
  pageSizeKey?: string
  pageStart?: number
  pageSize?: number
  listKey?: string
  totalKey?: string
  immediate?: boolean
  active?: boolean
  refresherEnabled?: boolean
  emptyText?: string
  errorText?: string
  finishedText?: string
  loadingText?: string
}>(), {
  params: () => ({}),
  height: '100vh',
  autoHeight: false,
  pageKey: 'pageNo',
  pageSizeKey: 'pageSize',
  pageStart: 1,
  pageSize: 10,
  immediate: true,
  active: true,
  refresherEnabled: true,
  emptyText: '暂无数据',
  errorText: '加载失败，点击重试',
  finishedText: '没有更多了',
  loadingText: '加载中...'
})

const emit = defineEmits<{
  (e: 'success', value: { list: any[]; response: any; page: number }): void
  (e: 'fail', value: any): void
  (e: 'refresh'): void
  (e: 'loadMore'): void
}>()

const isDark = ref(false)
try {
  isDark.value = uni.getSystemInfoSync().theme === 'dark'
} catch (_) {}
uni.onThemeChange?.((result: any) => {
  isDark.value = result.theme === 'dark'
})
const refresherStyle = computed(() => isDark.value ? 'white' : 'black')

const list = ref<any[]>([])
const page = ref(props.pageStart)
const total = ref<number | null>(null)
const status = ref<ListStatus>('idle')
const refresherTriggered = ref(false)
const computedHeight = ref('')
let requestId = 0
const instance = getCurrentInstance()
let checkingScrollable = false

const finalHeight = computed(() => {
  if (props.autoHeight && computedHeight.value) return computedHeight.value
  return props.height
})

const isRefreshing = computed(() => status.value === 'refreshing')
const isLoadingMore = computed(() => status.value === 'loadingMore')
const isLoading = computed(() => status.value === 'loading')
const isError = computed(() => status.value === 'error')
const isBusy = computed(() => isLoading.value || isRefreshing.value || isLoadingMore.value)
const isEmpty = computed(() => !isLoading.value && !isError.value && list.value.length === 0)
const isFinished = computed(() => {
  if (isBusy.value || isError.value) return false
  if (total.value !== null) return list.value.length >= total.value
  return list.value.length > 0 && lastPageCount.value < props.pageSize
})
const lastPageCount = ref(props.pageSize)

function getByPath(source: any, path?: string) {
  if (!path) return undefined
  return path.split('.').reduce((result, key) => result == null ? undefined : result[key], source)
}

function normalizeResponse(response: any) {
  const listFromKey = getByPath(response, props.listKey)
  const totalFromKey = getByPath(response, props.totalKey)
  const data = response?.data
  const candidates = [
    listFromKey,
    response,
    response?.list,
    response?.records,
    response?.rows,
    data,
    data?.list,
    data?.records,
    data?.rows
  ]
  const nextList = candidates.find((item) => Array.isArray(item)) || []
  const nextTotal = totalFromKey ?? response?.total ?? response?.count ?? data?.total ?? data?.count ?? null

  return {
    list: nextList,
    total: typeof nextTotal === 'number' ? nextTotal : Number.isFinite(Number(nextTotal)) ? Number(nextTotal) : null
  }
}

function buildParams(nextPage: number) {
  return {
    ...props.params,
    [props.pageKey]: nextPage,
    [props.pageSizeKey]: props.pageSize
  }
}

function resetPaging() {
  total.value = null
  lastPageCount.value = props.pageSize
}

function canRequest(nextStatus: ListStatus) {
  if (!props.api) return false
  if (isBusy.value && nextStatus !== 'refreshing') return false
  return nextStatus !== 'loadingMore' || !isFinished.value
}

function measure(selector: string) {
  return new Promise<any>((resolve) => {
    uni.createSelectorQuery().in(instance).select(selector).boundingClientRect(resolve).exec()
  })
}

function measureList() {
  return new Promise<any[]>((resolve) => {
    const query = uni.createSelectorQuery().in(instance)
    query.select('.load-list').boundingClientRect()
    query.select('.load-list__body').boundingClientRect()
    query.exec(resolve)
  })
}

async function calcHeight() {
  if (!props.autoHeight || !props.active) return

  const rect = await measure('.load-list')
  if (!rect) return

  computedHeight.value = `${uni.getSystemInfoSync().windowHeight - rect.top}px`
  ensureScrollable()
}

async function requestList(nextPage: number, mode: ListStatus) {
  if (!canRequest(mode)) return

  const currentRequestId = ++requestId
  status.value = mode

  try {
    const response = await props.api(buildParams(nextPage))
    if (currentRequestId !== requestId) return

    const normalized = normalizeResponse(response)
    lastPageCount.value = normalized.list.length
    total.value = normalized.total
    page.value = nextPage
    list.value = nextPage === props.pageStart ? normalized.list : list.value.concat(normalized.list)
    status.value = 'idle'
    refresherTriggered.value = false
    emit('success', { list: normalized.list, response, page: nextPage })
    ensureScrollable()
  } catch (error) {
    if (currentRequestId !== requestId) return
    status.value = 'error'
    refresherTriggered.value = false
    emit('fail', error)
  }
}

async function ensureScrollable() {
  if (!props.active || checkingScrollable || isBusy.value || isFinished.value || isError.value) return

  checkingScrollable = true
  await nextTick()

  const [containerRect, bodyRect] = await measureList()
  checkingScrollable = false

  const containerHeight = Number(containerRect?.height)
  const bodyHeight = Number(bodyRect?.height)

  if (!Number.isFinite(containerHeight) || !Number.isFinite(bodyHeight)) return
  if (containerHeight <= 0) return
  if (bodyHeight <= containerHeight + 1 && !isFinished.value && !isError.value) {
    loadMore()
  }
}

function refresh() {
  emit('refresh')
  resetPaging()
  refresherTriggered.value = true
  requestList(props.pageStart, 'refreshing')
}

function reload() {
  resetPaging()
  list.value = []
  requestList(props.pageStart, 'loading')
}

function loadMore() {
  if (!canRequest('loadingMore') || isError.value) return
  emit('loadMore')
  requestList(page.value + 1, 'loadingMore')
}

function handleScroll(event: any) {
  const detail = event?.detail || {}
  const scrollTop = Number(detail.scrollTop)
  const scrollHeight = Number(detail.scrollHeight)
  const viewHeight = Number.parseFloat(finalHeight.value)

  if (!Number.isFinite(scrollTop) || !Number.isFinite(scrollHeight) || !Number.isFinite(viewHeight)) return
  if (scrollHeight - scrollTop - viewHeight <= 80) {
    loadMore()
  }
}

function retry() {
  if (list.value.length === 0) {
    reload()
  } else {
    requestList(page.value + 1, 'loadingMore')
  }
}

watch(
  () => props.params,
  reload,
  { deep: true }
)

watch(
  () => props.active,
  async (active) => {
    if (!active) return
    await nextTick()
    await calcHeight()

    if (list.value.length === 0 && props.immediate) {
      reload()
    } else {
      ensureScrollable()
    }
  }
)

onMounted(() => {
  calcHeight()
  if (props.immediate) {
    reload()
  }
})


defineExpose({
  refresh,
  reload,
  loadMore,
  list
})
</script>

<template>
  <scroll-view
    :class="['load-list']"
    scroll-y
    :style="{ height: finalHeight }"
    :refresher-enabled="refresherEnabled"
    :refresher-triggered="refresherTriggered"
    :lower-threshold="80"
    :refresher-default-style="refresherStyle"
    @refresherrefresh="refresh"
    @scroll="handleScroll"
    @scrolltolower="loadMore"
  >
    <view :class="['load-list__body', { 'is-empty': list.length === 0, 'is-finished': isFinished }]">
      <view
        v-for="(item, index) in list"
        :key="item.id || item.key || index"
        class="load-list__item"
      >
        <slot name="item" :item="item" :index="index">
          <view class="load-list__fallback">{{ item.title || item.name || item.id || item }}</view>
        </slot>
      </view>

      <view v-if="isLoading" class="load-list__state">{{ loadingText }}</view>
      <view v-else-if="isEmpty" class="load-list__state">{{ emptyText }}</view>
      <view v-else-if="isError" class="load-list__state is-clickable" @click="retry">{{ errorText }}</view>
      <view v-else-if="isLoadingMore" class="load-list__state">{{ loadingText }}</view>
      <view v-else-if="isFinished" class="load-list__state is-finished-state">{{ finishedText }}</view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.load-list {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
}

.load-list__body {
  box-sizing: border-box;
  padding-bottom: calc(env(safe-area-inset-bottom) + 120rpx);
}

.load-list__body.is-empty {
  min-height: 100%;
}

.load-list__body.is-finished {
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.load-list__item {
  margin-bottom: 20rpx;

  &:last-child {
    margin-bottom: 0;
  }
}

.load-list__state {
  padding: 28rpx 0;
  text-align: center;
  font-size: 26rpx;
  color: var(--app-text-muted);
}

.load-list__state.is-finished-state {
  margin-top: auto;
}

.load-list__state.is-clickable {
  color: var(--app-text-brand);
}

.load-list__fallback {
  padding: 24rpx;
  background-color: var(--app-bg-card);
  border-radius: 12rpx;
  font-size: 28rpx;
  color: var(--app-text-primary);
}
</style>
