import type { ArtifactGalleryImage } from '../types/Artifact'

export interface RoomImage {
  id: string
  title: string
  description: string
  /** Cover image (Cloudinary). */
  imageUrl: string
  /** Additional images for this artifact's gallery, each with its own caption. */
  gallery?: ArtifactGalleryImage[]
}

const CLOUDINARY_UPLOAD = 'https://res.cloudinary.com/dw8lijwvw/image/upload'

// The single place Room 1's Cloudinary mapping lives: artifacts.ts reads
// covers and galleries from here by id, so assets can be swapped without
// touching any artifact text.
export const room01Images: RoomImage[] = [
  {
    id: 'historical-context',
    title: 'Bối cảnh lịch sử năm 1946',
    description: 'Bối cảnh đất nước trước cuộc Tổng tuyển cử đầu tiên.',
    imageUrl: `${CLOUDINARY_UPLOAD}/v1789810829/1945.png`,
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789811941/NG%C6%B0%E1%BB%9Di_d%C3%A2n_nghe_tuy%C3%AAn_ng%C3%B4n.jpg`,
        caption: 'Người dân nghe Tuyên ngôn Độc lập năm 1945',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789811880/tuy%C3%AAn_ng%C3%B4n.jpg`,
        caption: 'Tuyên ngôn Độc lập năm 1945',
      },
    ],
  },
  {
    id: 'election-day',
    title: 'Ngày Tổng tuyển cử năm 1946',
    description: 'Cử tri tham gia Tổng tuyển cử ngày 6 tháng 1 năm 1946.',
    imageUrl: `${CLOUDINARY_UPLOAD}/v1789810891/B%C3%A1c_%C4%91%E1%BA%BFn_bu%E1%BB%95i_b%E1%BB%8F_phi%E1%BA%BFu.png`,
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789811099/Ch%E1%BB%A7_t%E1%BB%8Bch_H%E1%BB%93_Ch%C3%AD_Minh_%C4%91%E1%BA%BFn_b%E1%BA%A7u_c%E1%BB%AD_t%E1%BA%A1i_nh%C3%A0_s%E1%BB%91_10_ph%E1%BB%91_H%C3%A0ng_V%C3%B4i_H%C3%A0_N%E1%BB%99i.jpg`,
        caption: 'Chủ tịch Hồ Chí Minh tham gia bỏ phiếu trong cuộc Tổng tuyển cử năm 1946',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789810962/1_v%C4%83n_b%E1%BA%A3n_s%E1%BA%AFc_l%E1%BB%87nh_li%C3%AAn_quan_T%E1%BB%95ng_tuy%E1%BB%83n_c%E1%BB%AD.jpg`,
        caption: 'Văn bản liên quan đến cuộc Tổng tuyển cử năm 1946',
      },
    ],
  },
  {
    id: 'voting-station',
    title: 'Không khí tại điểm bỏ phiếu',
    description: 'Hoạt động tổ chức và bỏ phiếu tại khu vực bầu cử.',
    imageUrl: `${CLOUDINARY_UPLOAD}/v1789811307/kh%C3%B4ng_kh%C3%AD_b%E1%BB%8F_phi%E1%BA%BFu_ng%E1%BB%93i.png`,
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789811380/c%E1%BA%A7m_c%E1%BB%9D.jpg`,
        caption: 'Không khí nhân dân tham gia ngày bầu cử',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789811378/ng%C6%B0%E1%BB%9Di_d%C3%A2n.jpg`,
        caption: 'Người dân thực hiện quyền bầu cử',
      },
    ],
  },
  {
    id: 'citizens-participation',
    title: 'Nhân dân thực hiện quyền bầu cử',
    description: 'Quyền làm chủ của nhân dân được thực hiện qua từng lá phiếu.',
    imageUrl: `${CLOUDINARY_UPLOAD}/v1789812651/D%C3%A2n_b%E1%BB%8F_phi%E1%BA%BFu.png`,
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789811532/D%C3%A2n_H%C3%A0_N%E1%BB%99i_b%E1%BB%8F_phi%E1%BA%BFu.jpg`,
        caption: 'Nhân dân tham gia bỏ phiếu',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789811522/ngaybaucudautien.jpg`,
        caption: 'Ngày bầu cử đầu tiên năm 1946',
      },
    ],
  },
]
