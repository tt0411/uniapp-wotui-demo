<script setup lang="ts">
import { reactive, ref } from 'vue'
import LoadList from '@/components/load-list/index.vue'
import DemoListItem from './components/demo-list-item.vue'

const filters = reactive({
  keyword: ''
})

const loadListRef = ref()

function mockApi(params: Record<string, any>) {
  const pageNo = Number(params.pageNo || 1)
  const pageSize = Number(params.pageSize || 10)
  const total = 30
  const start = (pageNo - 1) * pageSize
  const end = Math.min(start + pageSize, total)

  return new Promise((resolve) => {
    setTimeout(() => {
      const records = Array.from({ length: Math.max(end - start, 0) }).map((_, index) => {
        const num = start + index + 1
        return {
          id: `NO${num}`,
          title: `${params.keyword || '订单'} ${num}`,
          status: num % 2 === 0 ? '已处理' : '待处理',
          amount: 100 + num,
          date: `2026-04-${String((num % 24) + 1).padStart(2, '0')}`
        }
      })

      resolve({
        data: {
          records,
          total
        }
      })
    }, 500)
  })
}

function search() {
  loadListRef.value?.reload()
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="通用列表" />
    <view class="page-body">
      <view class="search-bar">
      <input
        v-model="filters.keyword"
        class="search-input"
        placeholder="输入关键词"
        confirm-type="search"
        @confirm="search"
      />
      <wd-button size="small" @click="search">搜索</wd-button>
    </view>
      <LoadList
        ref="loadListRef"
        auto-height
        :api="mockApi"
        :params="filters"
        list-key="data.records"
        total-key="data.total"
      >
        <template #item="{ item }">
          <DemoListItem :item="item" />
        </template>
      </LoadList>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  box-sizing: border-box;
  background-color: var(--app-bg-page);
  display: flex;
  flex-direction: column;
}

.page-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  flex-shrink: 0;
  height: 112rpx;
  padding: 20rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: var(--app-bg-card);
}

.search-input {
  flex: 1;
  height: 68rpx;
  padding: 0 20rpx;
  box-sizing: border-box;
  background-color: var(--app-bg-surface-muted);
  border-radius: 8rpx;
  font-size: 28rpx;
  color: var(--app-input-text);
  caret-color: var(--app-color-primary);
}

:deep(input) {
  color: var(--app-input-text);
}

:deep(.load-list__body) {
  padding: 20rpx 24rpx 0;
}
</style>
