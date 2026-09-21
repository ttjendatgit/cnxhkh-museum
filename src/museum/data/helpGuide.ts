/** Wording for the "?" tour guide. A frame for now: the lines below describe the controls that
 * exist today, and `note` marks that the fuller guide is still to come. Edit the text here. */
export const HELP_TITLE = 'Hướng dẫn tham quan'
export const HELP_NOTE = 'Nội dung hướng dẫn chi tiết sẽ được bổ sung.'

export interface HelpSection {
  id: 'desktop' | 'mobile'
  /** Tab label. */
  label: string
  items: { keys: string; text: string }[]
}

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'desktop',
    label: 'Máy tính',
    items: [
      { keys: 'W A S D', text: 'Di chuyển' },
      { keys: 'Chuột', text: 'Nhìn quanh (nhấp vào màn hình để khóa chuột, Esc để thả)' },
      { keys: 'E', text: 'Tương tác: xem hiện vật, video tư liệu, tra cứu tại kiosk' },
      { keys: 'H hoặc ?', text: 'Mở / đóng hướng dẫn này' },
    ],
  },
  {
    id: 'mobile',
    label: 'Điện thoại',
    items: [
      { keys: 'Cần trái', text: 'Di chuyển' },
      { keys: 'Vuốt', text: 'Vuốt trên màn hình để nhìn quanh' },
      { keys: 'TƯƠNG TÁC', text: 'Xem hiện vật, video tư liệu, tra cứu tại kiosk' },
      { keys: '?', text: 'Mở / đóng hướng dẫn này' },
    ],
  },
]
