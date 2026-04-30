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

const activeTabConfig = computed(() => {
  return tabsWithParams.value.find((item) => item.name === activeTab.value) || tabsWithParams.value[0]
})

const activeParams = computed(() => activeTabConfig.value.params)

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
      <wd-tabs
        v-model="activeTab"
        custom-class="tabs-list-page__tabs"
        line-theme="text"
        @change="handleTabChange"
      >
        <wd-tab
          v-for="item in tabsWithParams"
          :key="item.name"
          :title="item.title"
          :name="item.name"
        />
      </wd-tabs>

      <view class="summary-row">
        <text class="summary-title">{{ activeTabConfig.title }}</text>
        <text class="summary-count">共 {{ activeTabConfig.total }} 条</text>
      </view>

      <LoadList
        :key="activeTab"
        auto-height
        :api="mockApi"
        :params="activeParams"
        :page-size="8"
        list-key="data.records"
        total-key="data.total"
      >
        <template #item="{ item: row }">
          <DemoListItem :item="row" />
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

:deep(.tabs-list-page__tabs) {
  flex: 0 0 auto;
  background-color: var(--app-bg-page);
}

:deep(.wd-tabs__nav) {
  border-bottom: 1rpx solid var(--app-divider);
}

:deep(.wd-tabs__container) {
  display: none;
}

.summary-row {
  flex: 0 0 auto;
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
  padding: 20rpx 24rpx 0;
}
</style>
