<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'

interface Props {
  modelValue: boolean
  src?: string
  width?: string | number
  countdown?: number
  closePosition?: 'inset' | 'top' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  closeOnClickModal?: boolean
  to?: string
}

const props = withDefaults(defineProps<Props>(), {
  countdown: 0,
  closePosition: 'bottom',
  closeOnClickModal: false,
  width: 280
})

const emit = defineEmits(['update:modelValue', 'click', 'close', 'countdown-end'])

const remaining = ref(0)
let timer: number | null = null

function startCountdown() {
  if (props.countdown <= 0) {
    remaining.value = 0
    return
  }
  
  remaining.value = props.countdown
  stopCountdown()
  
  timer = setInterval(() => {
    remaining.value--
    if (remaining.value <= 0) {
      stopCountdown()
      emit('countdown-end')
    }
  }, 1000) as unknown as number
}

function stopCountdown() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function handleClose() {
  if (remaining.value > 0) return
  emit('update:modelValue', false)
  emit('close')
}

function handleClick() {
  emit('click')
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      startCountdown()
    } else {
      stopCountdown()
    }
  },
  { immediate: true }
)

onBeforeUnmount(() => {
  stopCountdown()
})
</script>

<template>
  <view class="smart-curtain">
    <wd-curtain
      :model-value="modelValue"
      :src="src"
      :width="width"
      :to="to"
      :close-position="closePosition"
      :close-on-click-modal="closeOnClickModal"
      @close="handleClose"
      @click="handleClick"
    >
      <!-- 自定义关闭按钮插槽 -->
      <template #close>
        <view class="custom-close-container" @click.stop="handleClose">
          <view v-if="remaining > 0" class="countdown-text">
            {{ remaining }}s
          </view>
          <view v-else class="close-icon-wrapper">
            <wd-icon name="close-circle" size="32px" color="var(--app-overlay-icon)" />
          </view>
        </view>
      </template>
    </wd-curtain>
  </view>
</template>

<style scoped lang="scss">

.custom-close-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 80rpx;
  height: 80rpx;
}

.countdown-text {
  background-color: var(--app-overlay-dark);
  color: var(--app-text-inverse);
  padding: 6rpx 20rpx;
  border-radius: 30rpx;
  font-size: 26rpx;
  border: 1px solid var(--app-overlay-border);
  white-space: nowrap;
  backdrop-filter: blur(4px);
}

.close-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:active {
    opacity: 0.7;
    transform: scale(0.9);
  }
}
</style>
