<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  onlyFromCamera?: boolean
  scanType?: string[]
}>(), {
  modelValue: '',
  placeholder: '请输入序列号',
  disabled: false,
  clearable: false,
  onlyFromCamera: false,
  scanType: () => ['barCode', 'qrCode']
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'change', value: string): void
  (e: 'confirm', value: string): void
  (e: 'scan', value: { value: string; raw: UniApp.ScanCodeSuccessRes }): void
  (e: 'scanFail', value: UniApp.GeneralCallbackResult): void
}>()

function updateValue(value: string) {
  emit('update:modelValue', value)
  emit('input', value)
}

function handleInput(event: any) {
  updateValue(event.detail.value || '')
}

function handleBlur(event: any) {
  emit('change', event.detail.value || '')
}

function handleConfirm(event: any) {
  emit('confirm', event.detail.value || props.modelValue)
}

function handleClear() {
  updateValue('')
  emit('change', '')
}

function handleScan() {
  if (props.disabled) return

  uni.scanCode({
    onlyFromCamera: props.onlyFromCamera,
    scanType: props.scanType as any,
    success(res) {
      const value = res.result || ''
      emit('update:modelValue', value)
      emit('input', value)
      emit('change', value)
      emit('scan', { value, raw: res })
    },
    fail(error) {
      emit('scanFail', error)
    }
  })
}
</script>

<template>
  <view class="scan-input" :class="{ 'is-disabled': disabled }">
    <view class="scan-input__field">
      <input
        class="scan-input__inner"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        placeholder-class="scan-input__placeholder"
        confirm-type="done"
        @input="handleInput"
        @blur="handleBlur"
        @confirm="handleConfirm"
      />

      <view
        v-if="clearable && modelValue"
        class="scan-input__clear"
        @click="handleClear"
      >
        <wd-icon name="close-circle" size="18px" color="var(--app-text-disabled)" />
      </view>

      <view v-if="modelValue" class="scan-input__count">{{ modelValue.length }}</view>

      <view class="scan-input__scan" @click="handleScan">
         <wd-icon name="scan" size="24px" color="var(--app-text-secondary)"></wd-icon>
      </view>
    </view>

    <view v-if="$slots.default || $slots.right" class="scan-input__right">
      <slot name="right">
        <slot />
      </slot>
    </view>
  </view>
</template>

<style scoped lang="scss">
.scan-input {
  display: flex;
  align-items: center;
  width: 100%;
}

.scan-input__field {
  flex: 1;
  min-width: 0;
  height: 66rpx;
  box-sizing: border-box;
  border: 2rpx solid var(--app-input-border);
  border-radius: 8rpx;
  background-color: var(--app-input-bg);
  display: flex;
  align-items: center;
  overflow: hidden;
}

.scan-input__inner {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: 0 18rpx;
  font-size: 30rpx;
  color: var(--app-input-text);
  box-sizing: border-box;
}

:deep(.scan-input__placeholder) {
  color: var(--app-input-placeholder);
  font-size: 28rpx;
}

.scan-input__count {
  font-size: 28rpx;
  color: var(--app-text-placeholder);
  padding: 0 4rpx;
}

.scan-input__clear {
  width: 48rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-input__scan {
  width: 68rpx;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-input__right {
  flex: none;
  margin-left: 22rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.scan-input.is-disabled {
  opacity: 0.6;
}
</style>
