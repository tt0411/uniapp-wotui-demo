<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

type ApiFn = (params: Record<string, any>) => Promise<any>
type ListStatus = 'idle' | 'loading' | 'refreshing' | 'loadingMore' | 'error'

const props = withDefaults(defineProps<{
  api: ApiFn
  params?: Record<string, any>
  height?: string
  pageKey?: string
  pageSizeKey?: string
  pageStart?: number
  pageSize?: number
  listKey?: string
  totalKey?: string
  immediate?: boolean
  refresherEnabled?: boolean
  emptyText?: string
  errorText?: string
  finishedText?: string
  loadingText?: string
}>(), {
  params: () => ({}),
  height: '100vh',
  pageKey: 'pageNo',
  pageSizeKey: 'pageSize',
  pageStart: 1,
  pageSize: 10,
  immediate: true,
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

const list = ref<any[]>([])
const page = ref(props.pageStart)
const total = ref<number | null>(null)
const status = ref<ListStatus>('idle')
const refresherTriggered = ref(false)
let requestId = 0

const isRefreshing = computed(() => status.value === 'refreshing')
const isLoadingMore = computed(() => status.value === 'loadingMore')
const isLoading = computed(() => status.value === 'loading')
const isError = computed(() => status.value === 'error')
const isEmpty = computed(() => !isLoading.value && !isError.value && list.value.length === 0)
const isFinished = computed(() => {
  if (isLoading.value || isRefreshing.value || isLoadingMore.value || isError.value) return false
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

async function requestList(nextPage: number, mode: ListStatus) {
  if (!props.api) return
  if ((isLoading.value || isRefreshing.value || isLoadingMore.value) && mode !== 'refreshing') return
  if (mode === 'loadingMore' && isFinished.value) return

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
  } catch (error) {
    if (currentRequestId !== requestId) return
    status.value = 'error'
    refresherTriggered.value = false
    emit('fail', error)
  }
}

function refresh() {
  emit('refresh')
  total.value = null
  lastPageCount.value = props.pageSize
  refresherTriggered.value = true
  requestList(props.pageStart, 'refreshing')
}

function reload() {
  total.value = null
  lastPageCount.value = props.pageSize
  list.value = []
  requestList(props.pageStart, 'loading')
}

function loadMore() {
  if (isFinished.value || isError.value) return
  emit('loadMore')
  requestList(page.value + 1, 'loadingMore')
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
  () => reload(),
  { deep: true }
)

onMounted(() => {
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
    class="load-list"
    scroll-y
    :style="{ height }"
    :refresher-enabled="refresherEnabled"
    :refresher-triggered="refresherTriggered"
    @refresherrefresh="refresh"
    @scrolltolower="loadMore"
  >
    <view class="load-list__body">
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
      <view v-else-if="isFinished" class="load-list__state">{{ finishedText }}</view>
    </view>
  </scroll-view>
</template>

<style scoped lang="scss">
.load-list {
  width: 100%;
  box-sizing: border-box;
}

.load-list__body {
  min-height: 100%;
  box-sizing: border-box;
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
