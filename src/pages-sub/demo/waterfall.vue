<script setup lang="ts">
import WaterfallFlow from '@/components/waterfall-flow/index.vue'
import { notes } from './waterfall-data'

function openDetail(id: number) {
  uni.navigateTo({ url: `/pages-sub/demo/waterfall-detail?id=${id}` })
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="瀑布流" />
    <scroll-view scroll-y class="page-scroll">
      <view class="topic-bar">
        <view class="topic-title">发现笔记</view>
        <view class="topic-subtitle">双列瀑布流，适合图片高低不一的内容卡片</view>
      </view>

      <WaterfallFlow :list="notes" :gap="18">
        <template #item="{ item }">
          <view class="note-card" @click="openDetail(item.id as number)">
            <view class="cover-wrap">
              <image class="note-cover" :src="item.cover" mode="widthFix" />
              <text class="note-tag">{{ item.tag }}</text>
            </view>
            <view class="note-body">
              <view class="note-title">{{ item.title }}</view>
              <view class="note-footer">
                <view class="author">
                  <image class="avatar" :src="item.avatar" mode="aspectFill" />
                  <text class="author-name">{{ item.author }}</text>
                </view>
                <view class="likes">
                  <wd-icon name="heart" size="24rpx" />
                  <text>{{ item.likes }}</text>
                </view>
              </view>
            </view>
          </view>
        </template>
      </WaterfallFlow>
    </scroll-view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
}

.page-scroll {
  height: calc(100vh - 88px);
  box-sizing: border-box;
  padding: 24rpx;
}

.topic-bar {
  margin-bottom: 24rpx;
}

.topic-title {
  font-size: 36rpx;
  font-weight: 700;
  color: var(--app-text-primary);
}

.topic-subtitle {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: var(--app-text-secondary);
}

.note-card {
  overflow: hidden;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
  box-shadow: 0 8rpx 24rpx rgba(15, 23, 42, 0.06);
}

.cover-wrap {
  position: relative;
  overflow: hidden;
  background-color: var(--app-bg-surface-muted);
}

.note-cover {
  display: block;
  width: 100%;
}

.note-tag {
  position: absolute;
  left: 12rpx;
  bottom: 12rpx;
  padding: 4rpx 12rpx;
  border-radius: 999rpx;
  background-color: rgba(0, 0, 0, 0.52);
  color: #fff;
  font-size: 20rpx;
  line-height: 1.4;
}

.note-body {
  padding: 16rpx;
}

.note-title {
  display: -webkit-box;
  min-height: 76rpx;
  overflow: hidden;
  color: var(--app-text-primary);
  font-size: 27rpx;
  font-weight: 600;
  line-height: 1.42;
  text-overflow: ellipsis;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.note-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10rpx;
  margin-top: 16rpx;
}

.author {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.avatar {
  flex: 0 0 auto;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  background-color: var(--app-bg-surface-muted);
}

.author-name {
  min-width: 0;
  max-width: 120rpx;
  overflow: hidden;
  color: var(--app-text-secondary);
  font-size: 22rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.likes {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 4rpx;
  color: var(--app-text-muted);
  font-size: 22rpx;
}
</style>
