<script setup lang="ts">
import { ref, nextTick } from 'vue'

interface ChatMessage {
  id: number
  role: 'user' | 'ai'
  content: string
  loading?: boolean
}

const messages = ref<ChatMessage[]>([
  { id: 0, role: 'ai', content: '你好！我是AI助手，有什么可以帮你的吗？' }
])

const inputText = ref('')
const scrollTop = ref(0)
let msgId = 1

const aiReplies = [
  '这是一个很好的问题！让我想想...\n\n根据我的理解，这个问题可以从多个角度来分析。首先，我们需要考虑基本的概念和原理；其次，实际应用中的场景也很重要。',
  '当然可以！这里有一些建议供你参考：\n\n1. 先明确目标和需求\n2. 制定合理的计划\n3. 逐步执行并调整\n4. 及时总结和复盘',
  '这个话题很有意思。我认为关键在于平衡——既要注重效率，也不能忽视质量。你可以尝试以下方法来优化流程。',
  '感谢你的提问！\n\n这确实是一个常见的痛点。我的建议是：从小处着手，逐步迭代改进。不要试图一次性解决所有问题。',
  '我理解你的需求。让我为你梳理一下思路：\n\n首先，明确核心问题是什么；然后，找到最关键的约束条件；最后，在约束条件下寻找最优解。',
  '这是一个值得深入探讨的话题。\n\n从技术角度来看，当前的主流方案已经比较成熟。但每个具体场景都有其特殊性，需要因地制宜地调整策略。',
  '没问题！我来帮你分析一下。\n\n根据目前的情况，我建议分三个阶段推进：短期快速验证、中期优化迭代、长期体系建设。',
  '好问题！\n\n简单来说，核心思路是"以终为始"——先想清楚最终想要达到的效果，再倒推需要做什么。这样能避免走弯路。',
]

function getRandomReply() {
  return aiReplies[Math.floor(Math.random() * aiReplies.length)]
}

function scrollToBottom() {
  nextTick(() => {
    const query = uni.createSelectorQuery()
    query.select('.chat-list').scrollOffset((res: any) => {
      if (res) {
        scrollTop.value = res.scrollHeight + 1000
      }
    })
    query.exec()
    // fallback: use a large value
    setTimeout(() => {
      scrollTop.value += 999
    }, 50)
  })
}

function sendMessage() {
  const text = inputText.value.trim()
  if (!text) return

  // add user message
  messages.value.push({ id: msgId++, role: 'user', content: text })
  inputText.value = ''
  scrollToBottom()

  // add AI loading message
  const aiMsgId = msgId++
  const aiMsg: ChatMessage = { id: aiMsgId, role: 'ai', content: '', loading: true }
  messages.value.push(aiMsg)
  scrollToBottom()

  // simulate AI reply with typing effect
  const reply = getRandomReply()
  const delay = 600 + Math.random() * 800

  setTimeout(() => {
    const target = messages.value.find(m => m.id === aiMsgId)
    if (!target) return
    target.loading = false

    // typing effect
    let index = 0
    const timer = setInterval(() => {
      if (index < reply.length) {
        target.content = reply.slice(0, index + 1)
        index++
        scrollToBottom()
      } else {
        clearInterval(timer)
      }
    }, 30)
  }, delay)
}

function handleConfirm() {
  sendMessage()
}
</script>

<template>
  <view class="page-container">
    <PageNavbar title="AI聊天" />
    <view class="chat-container">
      <!-- message list -->
      <scroll-view
        class="chat-list"
        :scroll-y="true"
        :scroll-top="scrollTop"
        :scroll-with-animation="true"
      >
        <view
          v-for="msg in messages"
          :key="msg.id"
          class="msg-row"
          :class="msg.role === 'user' ? 'msg-row-right' : 'msg-row-left'"
        >
          <!-- AI avatar -->
          <view v-if="msg.role === 'ai'" class="avatar avatar-ai">🤖</view>

          <!-- bubble -->
          <view
            class="msg-bubble"
            :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'"
          >
            <view v-if="msg.loading" class="typing-indicator">
              <view class="dot" />
              <view class="dot" />
              <view class="dot" />
            </view>
            <text v-else class="msg-text">{{ msg.content }}</text>
          </view>

          <!-- user avatar -->
          <view v-if="msg.role === 'user'" class="avatar avatar-user">👤</view>
        </view>
      </scroll-view>

      <!-- input bar -->
      <view class="input-bar">
        <input
          class="chat-input"
          v-model="inputText"
          placeholder="输入消息..."
          confirm-type="send"
          @confirm="handleConfirm"
        />
        <view class="send-btn" :class="{ active: inputText.trim() }" @click="sendMessage">
          发送
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.page-container {
  min-height: 100vh;
  background-color: var(--app-bg-page);
  display: flex;
  flex-direction: column;
}

.chat-container {
  position: relative;
  height: calc(100vh - var(--status-bar-height) - 64px);
  overflow: hidden;
}

.chat-list {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 24rpx 20rpx;
  padding-bottom: calc(104rpx + env(safe-area-inset-bottom) + 24rpx);
  box-sizing: border-box;
}

.msg-row {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24rpx;
}

.msg-row-left {
  justify-content: flex-start;
}

.msg-row-right {
  justify-content: flex-end;
  padding-right: 20rpx;
}

.avatar {
  width: 64rpx;
  height: 64rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.avatar-ai {
  background-color: var(--app-bg-card);
  margin-right: 16rpx;
  border: 1rpx solid var(--app-border-primary);
}

.avatar-user {
  background-color: var(--app-bg-card);
  margin-left: 16rpx;
  border: 1rpx solid var(--app-border-primary);
}

.msg-bubble {
  max-width: 70%;
  padding: 20rpx 24rpx;
  border-radius: 20rpx;
  word-break: break-all;
}

.bubble-ai {
  background-color: var(--app-bg-card);
  border-top-left-radius: 4rpx;
}

.bubble-user {
  background-color: var(--app-color-primary, #07c160);
  border-top-right-radius: 4rpx;
}

.msg-text {
  font-size: 28rpx;
  line-height: 1.6;
  color: var(--app-text-primary);
  white-space: pre-wrap;
}

.bubble-user .msg-text {
  color: #fff;
}

/* typing indicator */
.typing-indicator {
  display: flex;
  align-items: center;
  gap: 8rpx;
  padding: 4rpx 0;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: var(--app-text-muted);
  animation: dotBounce 1.2s infinite ease-in-out;
}

.dot:nth-child(2) {
  animation-delay: 0.2s;
}

.dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes dotBounce {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* input bar */
.input-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  padding: 16rpx 20rpx;
  padding-bottom: calc(16rpx + env(safe-area-inset-bottom));
  background-color: var(--app-bg-card);
  border-top: 1rpx solid var(--app-border-primary);
  gap: 16rpx;
}

.chat-input {
  flex: 1;
  height: 72rpx;
  padding: 0 24rpx;
  background-color: var(--app-bg-page);
  border-radius: 36rpx;
  font-size: 28rpx;
  color: var(--app-text-primary);
}

.send-btn {
  flex-shrink: 0;
  width: 120rpx;
  height: 72rpx;
  line-height: 72rpx;
  text-align: center;
  border-radius: 36rpx;
  font-size: 28rpx;
  color: #fff;
  background-color: var(--app-text-disabled);
  transition: background-color 0.2s;
}

.send-btn.active {
  background-color: var(--app-color-primary, #07c160);
}
</style>
