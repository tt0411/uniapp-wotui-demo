<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import LoadList from '@/components/load-list/index.vue'
import DemoListItem from './components/demo-list-item.vue'

const activeTab = ref('all')
const tabs = [
  { title: '全部', name: 'all', total: 31 },
  { title: '待处理', name: 'pending', total: 14 },
  { title: '处理中', name: 'processing', total: 9 },
  { title: '已完成', name: 'done', total: 18 }
]

const filters = reactive({
  keyword: ''
})

const tabsWithParams = computed(() => {
  return tabs.map((item) => ({
    ...item,
    params: {
      status: item.name,
      keyword: filters.keyword
    }
  }))
})

function mockApi(params: Record<string, any>) {
  const pageNo = Number(params.pageNo || 1)
  const pageSize = Number(params.pageSize || 10)
  const tab = tabs.find((item) => item.name === params.status) || tabs[0]
  const total = tab.total
  const start = (pageNo - 1) * pageSize
  const end = Math.min(start + pageSize, total)

  return new Promise((resolve) => {
    setTimeout(() => {
      const records = Array.from({ length: Math.max(end - start, 0) }).map((_, index) => {
        const num = start + index + 1
        return {
          id: `${tab.name}-${num}`,
          title: `${tab.title}${params.keyword ? `-${params.keyword}` : ''} ${num}`,
          status: tab.name === 'all' ? (num % 3 === 0 ? '已完成' : num % 2 === 0 ? '处理中' : '待处理') : tab.title,
          amount: 80 + num * 3,
          date: `2026-04-${String((num % 24) + 1).padStart(2, '0')}`
        }
      })

      resolve({
        data: {
          records,
          total
        }
      })
    }, 450)
  })
}

function handleTabChange(event: { name: string | number }) {
  activeTab.value = String(event.name)
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="多标签列表" />
    <view class="page-body">
      <view class="search-bar">
        <input
          v-model="filters.keyword"
          class="search-input"
          placeholder="输入关键词筛选"
          confirm-type="search"
        />
        <wd-button size="small">搜索</wd-button>
      </view>

      <wd-tabs
        v-model="activeTab"
        line-theme="text"
        @change="handleTabChange"
        animated
        swipeable
      >
        <wd-tab
          v-for="item in tabsWithParams"
          :key="item.name"
          :title="item.title"
          :name="item.name"
        >
          <view class="summary-row">
            <text class="summary-title">{{ item.title }}</text>
            <text class="summary-count">共 {{ item.total }} 条</text>
          </view>

          <LoadList
            height="calc(100vh - 308rpx)"
            :api="mockApi"
            :params="item.params"
            :page-size="8"
            list-key="data.records"
            total-key="data.total"
          >
            <template #item="{ item: row }">
              <DemoListItem :item="row" />
            </template>
          </LoadList>
        </wd-tab>
      </wd-tabs>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
}

.page-body {
  min-height: calc(100vh - 88px);
}

.search-bar {
  height: 96rpx;
  padding: 16rpx 24rpx;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 16rpx;
  background-color: var(--app-bg-card);
}

.search-input {
  flex: 1;
  height: 64rpx;
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

.summary-row {
  height: 64rpx;
  padding: 0 24rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--app-bg-card);
  border-top: 1rpx solid var(--app-divider);
}

.summary-title {
  font-size: 28rpx;
  color: var(--app-text-primary);
  font-weight: 600;
}

.summary-count {
  font-size: 24rpx;
  color: var(--app-text-muted);
}

:deep(.load-list__body) {
  padding: 20rpx 24rpx;
}
</style>
