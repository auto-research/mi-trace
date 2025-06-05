export enum Brand {
  APPLE = 0,
  HUAWEI = 1,
  XIAOMI = 2,
  HONOR = 3,
  OPPO = 4,
  VIVO = 5,
  HUAWEI_SELECTION = 6,
  OTHERS = 7,
}

export const brandList = [
  { id: Brand.APPLE, name: 'Apple', color: '#222222' },
  { id: Brand.HUAWEI, name: '华为', color: '#C7000B' },
  { id: Brand.HUAWEI_SELECTION, name: '华为智选', color: '#C7000B' },
  { id: Brand.XIAOMI, name: '小米', color: '#ff6900' },
  { id: Brand.HONOR, name: '荣耀', color: '#15A3FF' },
  { id: Brand.OPPO, name: 'OPPO', color: '#00C18E' },
  { id: Brand.VIVO, name: 'VIVO', color: '#3C5AFF' },
  { id: Brand.OTHERS, name: '其他', color: '#888888' },
]