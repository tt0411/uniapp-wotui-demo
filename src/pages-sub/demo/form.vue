<script lang="ts" setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { useToast, zodAdapter } from '@wot-ui/ui'
import { useCascaderAreaData } from '@vant/area-data'
import type { FormInstance, FormSchema } from '@wot-ui/ui/components/wd-form/types'
import type { SliderInstance } from '@wot-ui/ui/components/wd-slider/types'
import type { SlideVerifyInstance } from '@wot-ui/ui/components/wd-slide-verify/types'
import type { CascaderOption } from '@wot-ui/ui/components/wd-cascader/types'
import dayjs from 'dayjs'
import { z } from 'zod'

import ScanInput from '@/components/scan-input/index.vue'
import SmartUpload, { type SmartUploadFile } from '@/components/smart-upload/index.vue'
import type { UploadFileItem, UploadMethod } from '@wot-ui/ui/components/wd-upload/types'
import { showSuccess } from '@/utils/toast'

// 控制选择器显示的变量
const showPlatformPicker = ref(false)
const showPromotionPicker = ref(false)
const showTimePicker = ref(false)
const showDatePicker = ref(false)
const showAddressPicker = ref(false)

const addressText = ref('')
const isVerticalLayout = ref(false)
const formItemLayout = computed(() => (isVerticalLayout.value ? 'vertical' : 'horizontal'))

const sliderRef = ref<SliderInstance>()
const slideVerifyRef = ref<SlideVerifyInstance>()
const toast = useToast()
const form = ref<FormInstance>()

// 表单数据模型
const model = reactive({
  couponName: '',
  platform: [] as string[],
  promotion: [] as string[],
  threshold: '',
  price: '',
  time: '' as string | number,
  date: null as number | null,
  address: '',
  count: 1,
  content: '',
  switchVal: true,
  cardId: '',
  phone: '',
  read: false,
  fileList: [] as any[],
  discount: 1,
  priority: 2,
  tags: [] as number[],
  rate: 3.5,
  budget: 35,
  verified: false
})

// 必填字段集合
const requiredFields = new Set([
  'couponName',
  'content',
  'threshold',
  'platform',
  'promotion',
  'time',
  'date',
  'address',
  'count',
  'cardId',
  'phone',
  'fileList',
  'discount',
  'priority',
  'tags',
  'rate',
  'budget',
  'verified'
])

// Schema 校验逻辑 (使用 Zod)
const schema: FormSchema = zodAdapter(
  z.object({
    couponName: z.string().min(6, '优惠券名称至少6个字'),
    content: z.string().min(3, '请输入活动细则信息'),
    threshold: z.string().min(1, '请输入满减金额'),
    price: z.string().optional(),
    platform: z.array(z.any()).min(1, '请选择推广平台'),
    promotion: z.array(z.any()).min(1, '请选择优惠方式'),
    time: z.union([z.string(), z.number()]).refine((val) => !!val, '请选择时间'),
     date: z.union([z.number(), z.null()]).refine((value) => !!value, '请选择日期'),
    address: z.string().min(1, '请选择地址'),
    count: z.number().gt(1, '发货数量需要大于1'),
    switchVal: z.boolean().optional(),
    discount: z.number().optional(),
    cardId: z.string().min(1, '请输入歪比巴卜'),
    phone: z.string().min(1, '请输入玛卡巴卡'),
    fileList: z.array(z.any()).min(1, '请上传活动图片'),
    priority: z.number(),
    tags: z.array(z.number()).min(1, '请至少选择一个投放标签'),
    rate: z.number(),
    budget: z.number(),
    verified: z.boolean().refine((val) => val, '请完成滑块验证')
  }),
  {
    isRequired(path: string) {
      return requiredFields.has(path)
    }
  }
)

// 选项数据
const platformList = ref([
  { value: '1', label: '京东' },
  { value: '2', label: '开普勒' },
  { value: '3', label: '手Q' },
  { value: '4', label: '微信' },
  { value: '5', label: '1号店' },
  { value: '6', label: '十元街' },
  { value: '7', label: '京东极速版' }
])

const promotionlist = ref([
  { value: '1', label: '满减' },
  { value: '2', label: '无门槛' }
])

const area = ref<any[]>(useCascaderAreaData())


// 监听布局切换
watch(isVerticalLayout, async () => {
  await nextTick()
  sliderRef.value?.initSlider()
  await slideVerifyRef.value?.init()
  slideVerifyRef.value?.reset()
})

// 计算显示文本
const platformText = computed(() => {
  if (!model.platform.length) return ''
  return model.platform
    .map(val => platformList.value.find(opt => opt.value === val)?.label || val)
    .join('、')
})

const promotionText = computed(() => {
  if (!model.promotion.length) return ''
  return model.promotion
    .map(val => promotionlist.value.find(opt => opt.value === val)?.label || val)
    .join('、')
})

const timeText = computed(() => {
  if (!model.time) return ''
  return typeof model.time === 'number' ? dayjs(model.time).format('HH:mm') : model.time
})

const dateText = computed(() => {
  if (!model.date) return ''
  return dayjs(model.date).format('YYYY-MM-DD')
})

// 事件处理
function handleAddressConfirm({ selectedOptions }: { selectedOptions: CascaderOption[] }) {
  addressText.value = selectedOptions.map(item => item.text).join('/')
}

function handleVerifySuccess() {
  model.verified = true
}

function handleVerifyFail() {
  model.verified = false
}

function handleSubmit() {
  form.value?.validate().then(({ valid, errors }) => {
    if (valid) {
      toast.success('提交成功')
      console.log('提交数据：', model)
    } else {
      console.log('校验失败：', errors)
      toast.error('表单校验未通过')
    }
  }).catch(err => {
    console.error('提交异常：', err)
  })
}

function handleIconClick() {
  toast.info('优惠券提示信息')
}

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
        showSuccess('上传成功')
        resolve()
      }
    }, 300)
  })
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="复杂表单" />

    <!-- 弹窗式选择器放置在顶部 -->
    <wd-select-picker
      v-model="model.platform"
      v-model:visible="showPlatformPicker"
      :columns="platformList"
      title="选择推广平台"
      multiple
    />
    <wd-picker
      v-model="model.promotion"
      v-model:visible="showPromotionPicker"
      :columns="promotionlist"
      title="选择优惠方式"
    />
    <wd-datetime-picker
      v-model="model.time"
      v-model:visible="showTimePicker"
      type="time"
      title="选择时间"
    />
    <wd-calendar
      v-model="model.date"
      v-model:visible="showDatePicker"
      title="选择日期"
    />
    <wd-cascader
      v-model="model.address"
      v-model:visible="showAddressPicker"
      :options="area"
      title="选择地区"
      @confirm="handleAddressConfirm"
    />

    <wd-form
      ref="form"
      :model="model"
      :schema="schema"
      :layout="formItemLayout"
      border
      asterisk-position="end"
      class="custom-form"
    >
      <!-- 布局与引擎切换 -->
      <wd-cell-group title="设置" border>
        <wd-form-item title="表单布局">
          <view class="flex items-center">
            <wd-switch v-model="isVerticalLayout" size="20" />
            <text class="ml-2 text-sm text-gray-500">{{ isVerticalLayout ? '上下布局' : '左右布局' }}</text>
          </view>
        </wd-form-item>
      </wd-cell-group>

      <!-- 基础信息 -->
      <wd-cell-group title="基础信息" border class="mt-4">
        <wd-form-item title="优惠券名称" prop="couponName" required>
          <wd-input
            v-model="model.couponName"
            placeholder="请输入名称(至少6位)"
            :maxlength="20"
            show-word-limit
            suffix-icon="question-circle"
            @clicksuffixicon="handleIconClick"
          />
        </wd-form-item>
        <wd-form-item
          title="推广平台"
          prop="platform"
          is-link
          :value="platformText"
          placeholder="请选择"
          @click="showPlatformPicker = true"
        />
        <wd-form-item
          title="优惠方式"
          prop="promotion"
          is-link
          :value="promotionText"
          placeholder="请选择"
          @click="showPromotionPicker = true"
        />
        <wd-form-item title="券面额" prop="threshold" required>
          <view class="flex items-center gap-2">
            <text>满</text>
            <wd-input v-model="model.threshold" placeholder="金额" custom-style="width: 140rpx;" no-border />
            <text>减</text>
            <wd-input v-model="model.price" placeholder="金额" custom-style="width: 140rpx;" no-border />
          </view>
        </wd-form-item>
      </wd-cell-group>

      <!-- 时间和地址 -->
      <wd-cell-group title="时间和地址" border class="mt-4">
        <wd-form-item
          title="时间"
          prop="time"
          is-link
          :value="timeText"
          placeholder="请选择时间"
          @click="showTimePicker = true"
        />
        <wd-form-item
          title="日期"
          prop="date"
          is-link
          :value="dateText"
          placeholder="请选择日期"
          @click="showDatePicker = true"
        />
        <wd-form-item
          title="地区"
          prop="address"
          is-link
          :value="addressText"
          placeholder="请选择地区"
          @click="showAddressPicker = true"
        />
      </wd-cell-group>

      <!-- 其他信息 (使用封装组件) -->
      <wd-cell-group title="高级组件" border class="mt-4">
        <wd-form-item title="活动细则" prop="content" required>
          <wd-textarea
            v-model="model.content"
            placeholder="请输入细则..."
            :maxlength="300"
            show-word-limit
            auto-height
          />
        </wd-form-item>
        <wd-form-item title="发货数量" prop="count" required>
          <wd-input-number v-model="model.count" />
        </wd-form-item>
        <wd-form-item title="扫码输入" prop="cardId" required>
          <ScanInput v-model="model.cardId" placeholder="扫码或手动输入卡号" clearable />
        </wd-form-item>
        <wd-form-item title="玛卡巴卡" prop="phone" required>
          <wd-input v-model="model.phone" placeholder="请输入玛卡巴卡" clearable />
        </wd-form-item>
        <wd-form-item title="活动图片" prop="fileList" required>
          <!-- <SmartUpload v-model:file-list="model.fileList" :limit="3" watermark /> -->
        <SmartUpload
          v-model:file-list="model.fileList"
          :limit="3"
          :multiple="true"
          accept="media"
          :watermark="{ text: 'UniApp Demo \n222' }"
          :compress-image="true"
          :compress-video="true"
          :upload-method="mockUpload"
        />
        </wd-form-item>
        <wd-form-item title="开启折扣">
          <wd-switch v-model="model.switchVal" size="20" />
        </wd-form-item>
        <wd-form-item v-if="model.switchVal" title="折扣" prop="discount" required>
          <wd-input-number v-model="model.discount" :min="1" :max="10" />
        </wd-form-item>
      </wd-cell-group>

      <!-- 交互反馈 -->
      <wd-cell-group title="交互反馈" border class="mt-4">
        <wd-form-item title="投放优先级" prop="priority">
          <wd-radio-group v-model="model.priority" direction="horizontal">
            <wd-radio :value="1">高</wd-radio>
            <wd-radio :value="2">中</wd-radio>
            <wd-radio :value="3">低</wd-radio>
          </wd-radio-group>
        </wd-form-item>
        <wd-form-item title="投放标签" prop="tags">
          <wd-checkbox-group v-model="model.tags" type="square" direction="horizontal" shape="button">
            <wd-checkbox :name="1">新品</wd-checkbox>
            <wd-checkbox :name="2">爆款</wd-checkbox>
            <wd-checkbox :name="3">清仓</wd-checkbox>
          </wd-checkbox-group>
        </wd-form-item>
        <wd-form-item title="活动评分" prop="rate">
          <wd-rate v-model="model.rate" allow-half />
        </wd-form-item>
        <wd-form-item title="预算强度" prop="budget">
          <wd-slider ref="sliderRef" v-model="model.budget" show-extreme-value />
        </wd-form-item>
        <wd-form-item title="滑块验证" prop="verified" required>
          <wd-slide-verify ref="slideVerifyRef" @success="handleVerifySuccess" @fail="handleVerifyFail" />
        </wd-form-item>
      </wd-cell-group>

      <!-- 协议与提交 -->
        <view class="tip">
          <wd-form-item prop="read" title-width="0px" :border="false">
            <wd-checkbox v-model="model.read" placement="left">
              已阅读并同意
              <text style="color: #4d80f0">《相关服务协议》</text>
            </wd-checkbox>
          </wd-form-item>
        </view>
      <view class="p-4">
        <wd-button type="primary" block size="large" @click="handleSubmit" :disabled="!model.read">
          立即提交
        </wd-button>
        </view>
    </wd-form>
  </view>
</template>

<style lang="scss" scoped>
.page-container {
  background-color: var(--app-bg-page-secondary);
  min-height: 100vh;
  padding-bottom: 40rpx;
}

.mt-4 {
  margin-top: 16px;
}

.mb-4 {
  margin-bottom: 16px;
}

.p-4 {
  padding: 20px;
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.ml-2 {
  margin-left: 8px;
}

.gap-2 {
  gap: 8px;
}

.text-sm {
  font-size: 14px;
}

.text-gray-500 {
  color: #6b7280;
}

.text-blue-500 {
  color: #3b82f6;
}

.custom-form {
  :deep(.wd-form-item) {
    &.is-vertical {
      .wd-form-item__label {
        margin-bottom: 8rpx;
      }
    }
  }
}
.tip {
  margin: 12px 0 12px;
  color: #999;
  font-size: 12px;
}
</style>
