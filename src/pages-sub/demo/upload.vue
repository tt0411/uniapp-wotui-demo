<script setup lang="ts">
import { ref } from 'vue'
import SmartUpload, { type SmartUploadFile } from '@/components/smart-upload/index.vue'
import type { UploadFileItem, UploadMethod } from '@wot-ui/ui/components/wd-upload/types'
import { showSuccess } from '@/utils/toast'

const fileList = ref<SmartUploadFile[]>([])
const uploadLog = ref<string[]>([])

const mockUpload: UploadMethod = (file: UploadFileItem, formData, options) => {
  return new Promise((resolve) => {
    let progress = 0
    const timer = setInterval(() => {
      progress += 25
      options.onProgress({ progress, totalBytesSent: progress, totalBytesExpectedToSend: 100 }, file)

      if (progress >= 100) {
        clearInterval(timer)
        options.onSuccess({
          statusCode: 200,
          data: JSON.stringify({
            url: file.url,
            formData
          }),
          errMsg: 'uploadFile:ok'
        }, file, formData)
        uploadLog.value.unshift(`已上传：${file.name || file.url}`)
        showSuccess('上传成功')
        resolve()
      }
    }, 300)
  })
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="上传组件" />
    <view class="page-content">
      <view class="demo-card">
        <view class="card-title">图片 / 视频上传</view>
        <view class="card-desc">支持水印、压缩、队列上传和成功标识</view>

        <SmartUpload
          v-model:file-list="fileList"
          :limit="6"
          :multiple="true"
          accept="media"
          :watermark="{ text: 'UniApp Demo \n222' }"
          :compress-image="true"
          :compress-video="true"
          :upload-method="mockUpload"
        />
      </view>

      <view class="demo-card">
        <view class="card-title">上传结果</view>
        <view v-if="fileList.length === 0" class="empty-text">暂无文件</view>
        <view
          v-for="item in fileList"
          :key="item.uid || item.url"
          class="result-row"
        >
          <text class="result-name">{{ item.name || '本地文件' }}</text>
          <text class="result-status" :class="`is-${item.status || 'pending'}`">
            {{ item.status === 'success' ? '成功' : item.status === 'loading' ? '上传中' : item.status === 'fail' ? '失败' : '等待中' }}
          </text>
        </view>
      </view>

      <view v-if="uploadLog.length" class="demo-card">
        <view class="card-title">队列记录</view>
        <view v-for="item in uploadLog" :key="item" class="log-item">{{ item }}</view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
  box-sizing: border-box;
}

.page-content {
  padding-bottom: 40rpx;
}

.demo-card {
  margin: 24rpx;
  padding: 28rpx;
  background-color: var(--app-bg-card);
  border-radius: 16rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: 600;
  color: var(--app-text-primary);
  margin-bottom: 8rpx;
}

.card-desc {
  font-size: 26rpx;
  color: var(--app-text-secondary);
  margin-bottom: 24rpx;
}

.empty-text {
  font-size: 26rpx;
  color: var(--app-text-muted);
}

.result-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;
  border-bottom: 1rpx solid var(--app-divider);

  &:last-child {
    border-bottom: none;
  }
}

.result-name {
  max-width: 460rpx;
  font-size: 26rpx;
  color: var(--app-text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-status {
  font-size: 24rpx;
  color: var(--app-text-muted);

  &.is-loading {
    color: var(--app-color-info);
  }

  &.is-success {
    color: var(--app-color-success);
  }

  &.is-fail {
    color: var(--app-color-danger);
  }
}

.log-item {
  font-size: 24rpx;
  color: var(--app-text-secondary);
  line-height: 1.8;
}
</style>
