<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { showToast } from '@/utils/toast'
import { getCommentsByNoteId, getNoteById, type CommentItem } from './waterfall-data'

const note = ref(getNoteById(1))
const comments = ref<CommentItem[]>([])
const commentText = ref('')

onLoad((options) => {
  const id = Number(options?.id || 1)
  note.value = getNoteById(id)
  comments.value = getCommentsByNoteId(note.value.id)
})

function submitComment() {
  const content = commentText.value.trim()

  if (!content) {
    showToast('请输入评论内容')
    return
  }

  comments.value.unshift({
    id: Date.now(),
    author: '我',
    avatar: 'https://picsum.photos/80/80?random=399',
    content,
    time: '刚刚'
  })
  commentText.value = ''
  showToast('评论已发布')
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="笔记详情" />
    <scroll-view scroll-y class="detail-scroll">
      <image class="cover" :src="note.cover" mode="widthFix" />

      <view class="content-panel">
        <view class="author-row">
          <image class="author-avatar" :src="note.avatar" mode="aspectFill" />
          <view class="author-main">
            <view class="author-name">{{ note.author }}</view>
            <view class="note-tag">{{ note.tag }}</view>
          </view>
          <view class="like-count">
            <wd-icon name="heart" size="26rpx" />
            <text>{{ note.likes }}</text>
          </view>
        </view>

        <view class="note-title">{{ note.title }}</view>
        <view class="note-content">{{ note.content }}</view>
      </view>

      <view class="comment-panel">
        <view class="comment-title">评论 {{ comments.length }}</view>
        <view v-if="comments.length === 0" class="empty-comment">暂无评论，来写第一条吧</view>
        <view
          v-for="item in comments"
          :key="item.id"
          class="comment-item"
        >
          <image class="comment-avatar" :src="item.avatar" mode="aspectFill" />
          <view class="comment-main">
            <view class="comment-meta">
              <text class="comment-author">{{ item.author }}</text>
              <text class="comment-time">{{ item.time }}</text>
            </view>
            <view class="comment-content">{{ item.content }}</view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="comment-bar safe-area-bottom">
      <input
        v-model="commentText"
        class="comment-input"
        confirm-type="send"
        placeholder="说点什么..."
        @confirm="submitComment"
      />
      <button class="comment-button" @click="submitComment">发送</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
}

.detail-scroll {
  height: calc(100vh - 88px);
  box-sizing: border-box;
  padding-bottom: 128rpx;
}

.cover {
  display: block;
  width: 100%;
  background-color: var(--app-bg-surface-muted);
}

.content-panel,
.comment-panel {
  margin-top: 18rpx;
  padding: 24rpx;
  background-color: var(--app-bg-card);
}

.author-row {
  display: flex;
  align-items: center;
  gap: 14rpx;
}

.author-avatar,
.comment-avatar {
  flex: 0 0 auto;
  border-radius: 50%;
  background-color: var(--app-bg-surface-muted);
}

.author-avatar {
  width: 64rpx;
  height: 64rpx;
}

.author-main {
  flex: 1;
  min-width: 0;
}

.author-name {
  font-size: 28rpx;
  font-weight: 600;
  color: var(--app-text-primary);
}

.note-tag {
  margin-top: 4rpx;
  font-size: 22rpx;
  color: var(--app-text-muted);
}

.like-count {
  display: flex;
  align-items: center;
  gap: 6rpx;
  color: var(--app-text-secondary);
  font-size: 24rpx;
}

.note-title {
  margin-top: 28rpx;
  font-size: 38rpx;
  font-weight: 700;
  line-height: 1.35;
  color: var(--app-text-primary);
}

.note-content {
  margin-top: 18rpx;
  font-size: 29rpx;
  line-height: 1.75;
  color: var(--app-text-secondary);
}

.comment-panel {
  padding-bottom: 32rpx;
}

.comment-title {
  margin-bottom: 8rpx;
  font-size: 32rpx;
  font-weight: 700;
  color: var(--app-text-primary);
}

.empty-comment {
  padding: 36rpx 0;
  text-align: center;
  color: var(--app-text-muted);
  font-size: 26rpx;
}

.comment-item {
  display: flex;
  gap: 16rpx;
  padding-top: 24rpx;
}

.comment-avatar {
  width: 56rpx;
  height: 56rpx;
}

.comment-main {
  flex: 1;
  min-width: 0;
  padding-bottom: 22rpx;
  border-bottom: 1rpx solid var(--app-border-primary);
}

.comment-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
}

.comment-author {
  min-width: 0;
  overflow: hidden;
  color: var(--app-text-secondary);
  font-size: 24rpx;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-time {
  flex: 0 0 auto;
  color: var(--app-text-muted);
  font-size: 22rpx;
}

.comment-content {
  margin-top: 8rpx;
  color: var(--app-text-primary);
  font-size: 28rpx;
  line-height: 1.55;
}

.comment-bar {
  position: fixed;
  right: 0;
  bottom: 0;
  left: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 24rpx;
  background-color: var(--app-bg-card);
  border-top: 1rpx solid var(--app-border-primary);
  box-sizing: border-box;
}

.comment-input {
  flex: 1;
  min-width: 0;
  height: 72rpx;
  padding: 0 24rpx;
  box-sizing: border-box;
  border-radius: 36rpx;
  background-color: var(--app-bg-surface-muted);
  color: var(--app-input-text);
  font-size: 28rpx;
}

.comment-button {
  flex: 0 0 auto;
  width: 120rpx;
  height: 72rpx;
  padding: 0;
  border: none;
  border-radius: 36rpx;
  background-color: var(--app-button-primary-bg);
  color: var(--app-button-primary-text);
  font-size: 28rpx;
  line-height: 72rpx;
}

.comment-button::after {
  border: none;
}
</style>
