import type { WaterfallItem } from '@/components/waterfall-flow/index.vue'

export type NoteItem = WaterfallItem & {
  id: number
  cover: string
  title: string
  content: string
  author: string
  avatar: string
  likes: string
  tag: string
}

export type CommentItem = {
  id: number
  author: string
  avatar: string
  content: string
  time: string
}

export const notes: NoteItem[] = [
  {
    id: 1,
    cover: 'https://picsum.photos/360/480?random=101',
    width: 360,
    height: 480,
    title: '周末 city walk 路线，咖啡店和展览都安排好了',
    content: '上午先去河边咖啡店，午后看展，傍晚沿着老街慢慢走。路线不赶，适合想放松又想拍点照片的周末。',
    author: '林小夏',
    avatar: 'https://picsum.photos/80/80?random=201',
    likes: '1.2k',
    tag: '出行'
  },
  {
    id: 2,
    cover: 'https://picsum.photos/360/300?random=102',
    width: 360,
    height: 300,
    title: '通勤包里真正会每天用到的 8 件小物',
    content: '保留每天都会用的物品，把“可能用到”的东西移出去之后，通勤包轻了很多，找东西也更快。',
    author: 'Ariel',
    avatar: 'https://picsum.photos/80/80?random=202',
    likes: '856',
    tag: '好物'
  },
  {
    id: 3,
    cover: 'https://picsum.photos/360/560?random=103',
    width: 360,
    height: 560,
    title: '小户型餐边柜收纳，视觉清爽很多',
    content: '把高频物品放在中段，囤货和备用餐具放到柜门后，台面只留杯子和咖啡机。',
    author: '木木家',
    avatar: 'https://picsum.photos/80/80?random=203',
    likes: '2.4k',
    tag: '家居'
  },
  {
    id: 4,
    cover: 'https://picsum.photos/360/420?random=104',
    width: 360,
    height: 420,
    title: '低饱和穿搭公式，春夏拍照很出片',
    content: '米白、浅灰、牛仔蓝和一点绿色就够了，颜色少一点，照片反而更干净。',
    author: '南风',
    avatar: 'https://picsum.photos/80/80?random=204',
    likes: '634',
    tag: '穿搭'
  },
  {
    id: 5,
    cover: 'https://picsum.photos/360/640?random=105',
    width: 360,
    height: 640,
    title: '阳台改造记录：把洗衣区藏进柜子里',
    content: '先确认洗衣机尺寸和排水位置，再做柜体规划。门板统一之后，阳台看起来完整很多。',
    author: '予安',
    avatar: 'https://picsum.photos/80/80?random=205',
    likes: '3.1k',
    tag: '装修'
  },
  {
    id: 6,
    cover: 'https://picsum.photos/360/360?random=106',
    width: 360,
    height: 360,
    title: '一人食晚餐，15 分钟搞定番茄虾仁意面',
    content: '番茄炒出汁后加一点盐和黑胡椒，虾仁不要煮太久，最后用面汤调整浓稠度。',
    author: '盐粒',
    avatar: 'https://picsum.photos/80/80?random=206',
    likes: '978',
    tag: '美食'
  },
  {
    id: 7,
    cover: 'https://picsum.photos/360/520?random=107',
    width: 360,
    height: 520,
    title: '工作日晨间流程，减少出门前的慌乱',
    content: '前一晚把衣服和包准备好，早上只保留洗漱、早餐和出门三个动作，节奏会稳定很多。',
    author: '七月',
    avatar: 'https://picsum.photos/80/80?random=207',
    likes: '711',
    tag: '效率'
  },
  {
    id: 8,
    cover: 'https://picsum.photos/360/440?random=108',
    width: 360,
    height: 440,
    title: '书桌整理前后对比，线材终于不乱了',
    content: '显示器后面加了理线槽，桌面只留键盘、鼠标和一盏灯，工作时更容易专注。',
    author: '橘子',
    avatar: 'https://picsum.photos/80/80?random=208',
    likes: '1.7k',
    tag: '收纳'
  }
]

export const commentsMap: Record<number, CommentItem[]> = {
  1: [
    { id: 101, author: '青柠', avatar: 'https://picsum.photos/80/80?random=301', content: '这个路线看起来很舒服，周末想照着走一遍。', time: '10 分钟前' },
    { id: 102, author: 'Mia', avatar: 'https://picsum.photos/80/80?random=302', content: '展览需要提前预约吗？', time: '25 分钟前' }
  ],
  2: [
    { id: 201, author: '西西', avatar: 'https://picsum.photos/80/80?random=303', content: '同意，包里东西少了以后通勤轻松很多。', time: '18 分钟前' }
  ],
  3: [
    { id: 301, author: '阿泽', avatar: 'https://picsum.photos/80/80?random=304', content: '餐边柜分区很实用，准备抄作业。', time: '32 分钟前' }
  ]
}

export function getNoteById(id: number) {
  return notes.find((item) => item.id === id) || notes[0]
}

export function getCommentsByNoteId(id: number) {
  return commentsMap[id] ? [...commentsMap[id]] : []
}
