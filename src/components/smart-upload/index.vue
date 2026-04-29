<script setup lang="ts">
import { computed, getCurrentInstance, nextTick, ref } from 'vue'
import type { UploadFileItem, UploadFileType, UploadMethod, UploadSizeType, UploadSourceType } from '@wot-ui/ui/components/wd-upload/types'
import { useAppStore } from '@/store/app'
import { getThemeTokens } from '@/theme/tokens'
import { showError } from '@/utils/toast'

type UploadStatus = 'pending' | 'loading' | 'success' | 'fail'
type MediaType = 'image' | 'video' | 'file'

export interface SmartUploadFile extends Partial<UploadFileItem> {
  url: string
  status?: UploadStatus
  mediaType?: MediaType
}

interface WatermarkOptions {
  enabled?: boolean
  text?: string
  color?: string
  fontSize?: number
  opacity?: number
}

interface QueueItem {
  file: UploadFileItem
  formData: Record<string, any>
  options: Parameters<UploadMethod>[2]
}

const props = withDefaults(defineProps<{
  fileList?: SmartUploadFile[]
  action?: string
  header?: Record<string, any>
  formData?: Record<string, any>
  name?: string
  accept?: UploadFileType
  multiple?: boolean
  disabled?: boolean
  limit?: number
  maxSize?: number
  sourceType?: UploadSourceType[]
  sizeType?: UploadSizeType[]
  imageMode?: string
  showLimitNum?: boolean
  watermark?: boolean | WatermarkOptions
  compressImage?: boolean
  compressVideo?: boolean
  imageQuality?: number
  videoQuality?: 'low' | 'medium' | 'high'
  uploadMethod?: UploadMethod
}>(), {
  fileList: () => [],
  action: '',
  header: () => ({}),
  formData: () => ({}),
  name: 'file',
  accept: 'media',
  multiple: true,
  disabled: false,
  maxSize: Number.MAX_VALUE,
  sourceType: () => ['album', 'camera'],
  sizeType: () => ['compressed'],
  imageMode: 'aspectFill',
  showLimitNum: true,
  watermark: false,
  compressImage: true,
  compressVideo: true,
  imageQuality: 80,
  videoQuality: 'medium'
})

const emit = defineEmits<{
  (e: 'update:fileList', value: SmartUploadFile[]): void
  (e: 'change', value: { fileList: SmartUploadFile[] }): void
  (e: 'success', value: any): void
  (e: 'fail', value: any): void
  (e: 'progress', value: any): void
  (e: 'remove', value: any): void
}>()

const instance = getCurrentInstance()
const appStore = useAppStore()
const uploadRef = ref()
const canvasId = `smart-upload-watermark-${Math.random().toString(36).slice(2)}`
const canvasWidth = ref(1)
const canvasHeight = ref(1)
const fileTypeMap = new Map<string, MediaType>()
let uploadChain = Promise.resolve()

const innerFileList = computed({
  get: () => props.fileList,
  set: (value: SmartUploadFile[]) => emit('update:fileList', value)
})

const successMarkers = computed(() => {
  return innerFileList.value.map((file) => ({
    visible: file.status === 'success',
    key: `${file.uid || file.url}-${file.status || ''}`
  }))
})

const watermarkOptions = computed<Required<WatermarkOptions>>(() => {
  const tokens = getThemeTokens(appStore.themeMode, appStore.themeName)
  if (typeof props.watermark === 'object') {
    return {
      enabled: props.watermark.enabled !== false,
      text: props.watermark.text || 'uniapp-wotui-demo',
      color: props.watermark.color || tokens.textInverse,
      fontSize: props.watermark.fontSize || 16,
      opacity: props.watermark.opacity ?? 0.72
    }
  }
  return {
    enabled: Boolean(props.watermark),
    text: 'uniapp-wotui-demo',
    color: tokens.textInverse,
    fontSize: 16,
    opacity: 0.72
  }
})

function inferMediaType(file: Record<string, any>): MediaType {
  if (file.type === 'image' || file.fileType === 'image') return 'image'
  if (file.type === 'video' || file.fileType === 'video') return 'video'
  const path = String(file.path || file.url || file.thumb || '').toLowerCase()
  if (/\.(mp4|mov|m4v|avi|wmv|webm)(\?|$)/.test(path)) return 'video'
  if (/\.(jpg|jpeg|png|gif|webp|bmp|heic)(\?|$)/.test(path)) return 'image'
  return 'file'
}

function updatePath(file: Record<string, any>, path: string) {
  file.path = path
  if (file.type === 'image') {
    file.thumb = path
  }
}

function compressImageFile(path: string): Promise<string> {
  if (!props.compressImage) return Promise.resolve(path)
  return new Promise((resolve) => {
    uni.compressImage({
      src: path,
      quality: props.imageQuality,
      success: (res) => resolve(res.tempFilePath || path),
      fail: () => resolve(path)
    })
  })
}

function compressVideoFile(path: string): Promise<string> {
  if (!props.compressVideo) return Promise.resolve(path)
  return new Promise((resolve) => {
    uni.compressVideo({
      src: path,
      quality: props.videoQuality,
      success: (res) => resolve(res.tempFilePath || path),
      fail: () => resolve(path)
    })
  })
}

function getImageInfo(path: string): Promise<UniApp.GetImageInfoSuccessData> {
  return new Promise((resolve, reject) => {
    uni.getImageInfo({
      src: path,
      success: resolve,
      fail: reject
    })
  })
}

async function addImageWatermark(path: string): Promise<string> {
  const options = watermarkOptions.value
  if (!options.enabled || !options.text) return Promise.resolve(path)

  try {
    const info = await getImageInfo(path)
    const width = info.width
    const height = info.height
    canvasWidth.value = width
    canvasHeight.value = height
    await nextTick()

    return await new Promise<string>((resolve) => {
      const ctx = uni.createCanvasContext(canvasId, instance?.proxy)
      const padding = Math.max(16, Math.round(width * 0.04))
      const fontSize = Math.max(12, Math.round(options.fontSize))
      const lineHeight = Math.round(fontSize * 1.35)
      const lines = options.text.split(/\r?\n/).filter((line) => line.length > 0)

      ctx.drawImage(path, 0, 0, width, height)
      ctx.setGlobalAlpha(options.opacity)
      ctx.setFillStyle(options.color)
      ctx.setFontSize(fontSize)
      ctx.setTextAlign('left')
      ctx.setTextBaseline('bottom')
      lines.forEach((line, index) => {
        const offset = (lines.length - 1 - index) * lineHeight
        ctx.fillText(line, padding, height - padding - offset)
      })
      ctx.draw(false, () => {
        uni.canvasToTempFilePath({
          canvasId,
          width,
          height,
          destWidth: width,
          destHeight: height,
          fileType: 'jpg',
          quality: props.imageQuality / 100,
          success: (res) => resolve(res.tempFilePath || path),
          fail: () => resolve(path)
        }, instance?.proxy)
      })
    })
  } catch (error) {
    return path
  }
}

async function processBeforeUpload({ files }: { files: Record<string, any>[] }) {
  for (const file of files) {
    const mediaType = inferMediaType(file)
    let nextPath = file.path

    if (mediaType === 'image') {
      nextPath = await compressImageFile(nextPath)
      nextPath = await addImageWatermark(nextPath)
    }

    if (mediaType === 'video') {
      nextPath = await compressVideoFile(nextPath)
    }

    updatePath(file, nextPath)
    fileTypeMap.set(nextPath, mediaType)
  }
  return true
}

function uploadByUni({ file, formData, options }: QueueItem): Promise<void> {
  return new Promise((resolve) => {
    if (!options.action) {
      options.onError({ errMsg: '缺少上传地址' }, file, formData)
      resolve()
      return
    }

    const mediaType = fileTypeMap.get(file.url) || inferMediaType(file)
    const task = uni.uploadFile({
      url: options.action,
      header: options.header,
      name: options.name,
      fileName: options.fileName || options.name,
      filePath: file.url,
      fileType: mediaType === 'video' ? 'video' : 'image',
      formData,
      success: (res) => {
        const successStatus = Array.isArray(options.statusCode)
          ? options.statusCode.includes(res.statusCode)
          : res.statusCode === options.statusCode
        if (successStatus) {
          options.onSuccess(res, file, formData)
        } else {
          options.onError({ ...res, errMsg: res.errMsg || '上传失败' }, file, formData)
        }
        resolve()
      },
      fail: (error) => {
        options.onError(error, file, formData)
        resolve()
      }
    })
    task.onProgressUpdate((res) => options.onProgress(res, file))
  })
}

function queueUpload(file: UploadFileItem, formData: Record<string, any>, options: Parameters<UploadMethod>[2]) {
  const item = { file, formData, options }
  uploadChain = uploadChain
    .catch(() => undefined)
    .then(() => props.uploadMethod ? props.uploadMethod(file, formData, options) : uploadByUni(item))
    .then(() => undefined)
    .catch((error) => {
      options.onError({ errMsg: error?.message || '上传失败' }, file, formData)
    })
  return uploadChain
}

function handleChange(value: { fileList: SmartUploadFile[] }) {
  emit('change', value)
}

function handleSuccess(value: any) {
  emit('success', value)
}

function handleFail(value: any) {
  showError(value?.error?.errMsg || '上传失败')
  emit('fail', value)
}

function handleProgress(value: any) {
  emit('progress', value)
}

function handleRemove(value: any) {
  emit('remove', value)
}

defineExpose({
  submit: () => uploadRef.value?.submit(),
  abort: () => uploadRef.value?.abort()
})
</script>

<template>
  <view class="smart-upload">
    <wd-upload
      ref="uploadRef"
      v-model:file-list="innerFileList"
      :action="action"
      :header="header"
      :form-data="formData"
      :name="name"
      :accept="accept"
      :multiple="multiple"
      :disabled="disabled"
      :limit="limit"
      :max-size="maxSize"
      :source-type="sourceType"
      :size-type="sizeType"
      :image-mode="imageMode"
      :show-limit-num="showLimitNum"
      :compressed="compressVideo"
      :auto-upload="true"
      :before-upload="processBeforeUpload"
      :upload-method="queueUpload"
      custom-preview-class="smart-upload-preview"
      @change="handleChange"
      @success="handleSuccess"
      @fail="handleFail"
      @progress="handleProgress"
      @remove="handleRemove"
    />

    <view class="smart-upload__marker-layer">
      <view
        v-for="marker in successMarkers"
        :key="marker.key"
        class="smart-upload__marker-cell"
      >
        <view v-if="marker.visible" class="smart-upload__success">
          <view class="smart-upload__success-check" />
        </view>
      </view>
    </view>

    <canvas
      :canvas-id="canvasId"
      :style="{ width: `${canvasWidth}px`, height: `${canvasHeight}px` }"
      class="smart-upload__canvas"
    />
  </view>
</template>

<style scoped lang="scss">
.smart-upload {
  position: relative;
  --wot-upload-size: 176rpx;
}

.smart-upload__marker-layer {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  pointer-events: none;
}

.smart-upload__marker-cell {
  position: relative;
  width: var(--wot-upload-size);
  height: var(--wot-upload-size);
  margin: 0 16rpx 16rpx 0;
}

.smart-upload__success {
  position: absolute;
  right: 6rpx;
  bottom: 6rpx;
  width: 44rpx;
  height: 44rpx;
  border-radius: 50%;
  background-color: var(--app-color-success);
  display: flex;
  align-items: center;
  justify-content: center;
}

.smart-upload__success-check {
  width: 20rpx;
  height: 12rpx;
  border-left: 5rpx solid var(--app-text-inverse);
  border-bottom: 5rpx solid var(--app-text-inverse);
  transform: rotate(-45deg) translate(1rpx, -1rpx);
  border-radius: 2rpx;
}

.smart-upload__canvas {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
