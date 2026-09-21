/** Wording for the Room 3 reference kiosk ("sổ nguồn"). This is only the frame for now: every
 * tab shows a placeholder until the real content is written — edit it here, nowhere else.
 * The kiosk is for looking up sources, documents and answers; it never plays video (the videos
 * play on the wall screens). */
export const KIOSK_TITLE = 'Tra cứu tư liệu'
export const KIOSK_SUBTITLE = 'Sổ nguồn · thông tin kiểm chứng · giải đáp'
export const KIOSK_SEARCH_PLACEHOLDER = 'Tìm trong sổ nguồn… (sắp có)'

export interface KioskTab {
  id: string
  label: string
  heading: string
  /** Placeholder text until the real content exists. */
  placeholder: string
}

export const KIOSK_TABS: KioskTab[] = [
  {
    id: 'sources',
    label: 'Nguồn tư liệu',
    heading: 'Nguồn tư liệu',
    placeholder: 'Danh sách nguồn tư liệu của các hiện vật trong phòng sẽ được bổ sung tại đây.',
  },
  {
    id: 'ledger',
    label: 'Sổ nguồn',
    heading: 'Sổ nguồn',
    placeholder: 'Sổ nguồn và thông tin kiểm chứng của dữ liệu trưng bày sẽ được bổ sung tại đây.',
  },
  {
    id: 'faq',
    label: 'Giải đáp',
    heading: 'Câu hỏi thường gặp',
    placeholder: 'Các câu hỏi thường gặp và lời giải đáp về nội dung trưng bày sẽ được bổ sung tại đây.',
  },
]
