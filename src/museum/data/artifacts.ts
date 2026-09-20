import type { Artifact, ArtifactGalleryImage } from '../types/Artifact'
import { room01Images } from './room01'

/**
 * Museum artifact registry. Every image URL here is a plain Cloudinary URL
 * string (no hard-coded imports) — Room 1 uses the real, already-uploaded
 * room01Images, and Room 2 uses the real uploaded assets too. Each gallery
 * image carries its own short museum-style caption (see types/Artifact.ts's
 * ArtifactGalleryImage).
 */

const CLOUDINARY_UPLOAD = 'https://res.cloudinary.com/dw8lijwvw/image/upload'

// --- Room 1 ---------------------------------------------------------
//
// Room 1 is fully artifact-based: every wall frame is its own artifact with
// its own title, description, significance and gallery, and the central
// ballot box (a real 3D model, not an image) is its own artifact too, opened
// with a 360° viewer. Image URLs are NOT defined here — they are read from
// room01.ts by id, so the Room 1 Cloudinary mapping can be reorganized in
// one place without touching any artifact text.

const ROOM1_SOURCE = 'Tư liệu về Tổng tuyển cử năm 1946 / Tư liệu phục chế'

function room01Url(id: string): string {
  const image = room01Images.find((entry) => entry.id === id)
  if (!image) throw new Error(`[artifacts] room01Images has no entry with id "${id}"`)
  return image.imageUrl
}

function room01Gallery(id: string): ArtifactGalleryImage[] {
  const image = room01Images.find((entry) => entry.id === id)
  if (!image) throw new Error(`[artifacts] room01Images has no entry with id "${id}"`)
  return image.gallery ?? []
}

// Wall frames on Room 1's left wall, in the same slots the room's frames
// always occupied (x = -(halfWidth - WALL_MOUNT_GAP), z = centerZ + offset).
// Each frame's cover and gallery come from room01.ts (add/replace images
// and captions there).
export const ROOM1_WALL_ARTIFACTS: Artifact[] = [
  {
    id: 'room1-historical-context',
    roomId: 'room1',
    title: 'Bối cảnh lịch sử năm 1946',
    year: '1945 – 1946',
    location: 'Việt Nam',
    category: 'Tư liệu lịch sử',
    description:
      'Sau Cách mạng Tháng Tám năm 1945 và Tuyên ngôn Độc lập ngày 2/9/1945, nước Việt Nam Dân chủ Cộng hòa vừa ra đời đã phải đối mặt với nhiều khó khăn về kinh tế, xã hội và an ninh quốc phòng. Trong bối cảnh đó, việc tổ chức Tổng tuyển cử để bầu ra Quốc hội và thành lập chính quyền hợp hiến, hợp pháp trở thành yêu cầu cấp thiết.',
    significance:
      'Tổng tuyển cử năm 1946 không chỉ là một sự kiện chính trị mà còn là bước đi củng cố tính chính đáng của chính quyền cách mạng, khẳng định nguyên tắc quyền lực nhà nước thuộc về nhân dân, tức quyền làm chủ của nhân dân.',
    source: ROOM1_SOURCE,
    thumbnail: room01Url('historical-context'),
    thumbnailCaption: 'Bối cảnh đất nước trước cuộc Tổng tuyển cử đầu tiên.',
    gallery: room01Gallery('historical-context'),
    position: { x: -7.81, y: 2.05, z: -10.55 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
  },
  {
    id: 'room1-election-day',
    roomId: 'room1',
    title: 'Ngày Tổng tuyển cử năm 1946',
    year: '6/1/1946',
    location: 'Toàn quốc',
    category: 'Sự kiện lịch sử',
    description:
      'Ngày 6/1/1946, cử tri cả nước, không phân biệt nam nữ, giàu nghèo, tôn giáo hay dân tộc, đã đi bỏ phiếu bầu đại biểu Quốc hội khóa I. Cuộc bầu cử diễn ra khi đất nước còn nhiều khó khăn, thử thách nhưng có đông đảo nhân dân tham gia.',
    significance:
      'Đây là lần đầu tiên nhân dân Việt Nam trực tiếp bầu ra cơ quan đại diện quyền lực nhà nước cao nhất, mở đầu cho chế độ bầu cử dân chủ theo nguyên tắc phổ thông đầu phiếu, trực tiếp và bỏ phiếu kín.',
    source: ROOM1_SOURCE,
    thumbnail: room01Url('election-day'),
    thumbnailCaption: 'Cử tri tham gia Tổng tuyển cử ngày 6 tháng 1 năm 1946.',
    gallery: room01Gallery('election-day'),
    position: { x: -7.81, y: 1.82, z: -12.85 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
  },
  {
    id: 'room1-voting-station',
    roomId: 'room1',
    title: 'Không khí tại điểm bỏ phiếu',
    year: '6/1/1946',
    location: 'Các khu vực bỏ phiếu trong cả nước',
    category: 'Tư liệu lịch sử',
    description:
      'Tại các khu vực bỏ phiếu, việc tổ chức bầu cử có sự tham gia của chính quyền địa phương và đông đảo nhân dân. Hòm phiếu và các thủ tục bỏ phiếu giúp mỗi cử tri thực hiện quyền của mình một cách trực tiếp.',
    significance:
      'Điểm bỏ phiếu là nơi quyền làm chủ của nhân dân được thực hiện trực tiếp, cho thấy vai trò của chính quyền địa phương trong việc tổ chức và bảo đảm quyền bầu cử của công dân.',
    source: ROOM1_SOURCE,
    thumbnail: room01Url('voting-station'),
    thumbnailCaption: 'Hoạt động tổ chức và bỏ phiếu tại khu vực bầu cử.',
    gallery: room01Gallery('voting-station'),
    position: { x: -7.81, y: 1.82, z: -15.15 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
  },
  {
    id: 'room1-citizens-participation',
    roomId: 'room1',
    title: 'Nhân dân thực hiện quyền bầu cử',
    year: '1946',
    location: 'Toàn quốc',
    category: 'Tư liệu lịch sử',
    description:
      'Công dân từ 18 tuổi trở lên, không phân biệt nam nữ, đều có quyền tham gia bầu cử theo quy định của pháp luật về bầu cử lúc bấy giờ. Hình ảnh người dân đi bỏ phiếu thể hiện sự tham gia của nhân dân vào việc lập ra cơ quan quyền lực nhà nước.',
    significance:
      'Quyền bầu cử phổ thông là biểu hiện cụ thể của quyền làm chủ của nhân dân và của việc nhân dân tham gia quản lý nhà nước và xã hội thông qua lá phiếu.',
    source: ROOM1_SOURCE,
    thumbnail: room01Url('citizens-participation'),
    thumbnailCaption: 'Quyền làm chủ của nhân dân được thực hiện qua từng lá phiếu.',
    gallery: room01Gallery('citizens-participation'),
    position: { x: -7.81, y: 2.05, z: -17.45 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
  },
]

// The central 3D ballot box. It has no wall frame: the existing model on its
// pedestal is the exhibit (position = pedestal top at Room 1's center), and
// `modelId` makes the panel open with the 360° viewer. Its gallery holds
// related election photographs, referenced from room01.ts like the frames above.
export const BALLOT_BOX_1946: Artifact = {
  id: 'room1-ballot-box-1946',
  roomId: 'room1',
  title: 'Hòm phiếu bầu cử năm 1946',
  subtitle: 'Cuộc Tổng tuyển cử đầu tiên của nước Việt Nam Dân chủ Cộng hòa',
  year: '6/1/1946',
  location: 'Toàn quốc',
  category: 'Hiện vật lịch sử',
  description:
    'Ngày 6/1/1946, hơn 90% cử tri cả nước đã tham gia cuộc Tổng tuyển cử đầu tiên, bầu ra Quốc hội khóa I trong bối cảnh đất nước còn nhiều khó khăn, thử thách. Chiếc hòm phiếu là hiện vật biểu trưng cho quyền làm chủ của nhân dân, lần đầu tiên được thực hiện qua chế độ phổ thông đầu phiếu, không phân biệt nam nữ, giàu nghèo, tôn giáo.',
  significance:
    'Đây là dấu mốc khai sinh nền dân chủ cộng hòa và chế độ bầu cử phổ thông đầu phiếu ở Việt Nam — nền tảng pháp lý và chính trị cho việc xây dựng Nhà nước pháp quyền xã hội chủ nghĩa sau này.',
  source: 'Bảo tàng Lịch sử Quốc gia / Tư liệu phục chế',
  thumbnail: room01Url('election-day'),
  thumbnailCaption: 'Cử tri tham gia Tổng tuyển cử ngày 6 tháng 1 năm 1946.',
  gallery: [
    { url: room01Url('historical-context'), caption: 'Bối cảnh đất nước trước cuộc Tổng tuyển cử đầu tiên.' },
    { url: room01Url('voting-station'), caption: 'Hoạt động tổ chức và bỏ phiếu tại khu vực bầu cử.' },
    { url: room01Url('citizens-participation'), caption: 'Quyền làm chủ của nhân dân được thực hiện qua từng lá phiếu.' },
  ],
  modelId: 'ballot-box-1946',
  interactionPrompt: 'Nhấn E để xem hiện vật',
  position: { x: 0, y: 1.3, z: -14 },
}

export const ROOM1_ARTIFACTS: Artifact[] = [BALLOT_BOX_1946, ...ROOM1_WALL_ARTIFACTS]

// --- Room 2 -----------------------------------------------------------
//
// The 10 originally-listed Room 2 exhibits are consolidated into 4 major
// museum artifacts (not 10 wall frames) — each theme's related topics live
// inside its description/gallery instead of getting their own physical
// frame. Wired into Room2Props in RoomProps.tsx.

export const ROOM2_ARTIFACTS: Artifact[] = [
  {
    id: 'room2-hien-phap-1946',
    roomId: 'room2',
    title: 'Hiến pháp năm 1946 và sự ra đời Nhà nước Việt Nam mới',
    year: '1946',
    location: 'Kỳ họp thứ 2, Quốc hội khóa I',
    category: 'Văn kiện lập hiến',
    description:
      'Chuyên đề trưng bày quá trình xây dựng và ban hành bản Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa. Nội dung giới thiệu hoạt động của Quốc hội khóa I năm 1946 — cơ quan đại biểu dân cử đầu tiên — cùng quá trình soạn thảo văn bản hiến định nền tảng cho tổ chức bộ máy nhà nước kiểu mới.',
    significance:
      'Hiến pháp năm 1946 xác lập những nguyên tắc hiến định đầu tiên về chủ quyền nhân dân và tổ chức quyền lực nhà nước, đặt cơ sở pháp lý cho sự hình thành một nhà nước dân chủ nhân dân, vận dụng lý luận về nhà nước kiểu mới vào điều kiện cụ thể của Việt Nam.',
    source: 'Trung tâm Lưu trữ Quốc gia III / Tư liệu phục chế',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789801290/Hi%E1%BA%BFn_ph%C3%A1p_1946.png`,
    thumbnailCaption: 'Hiến pháp năm 1946 - bản Hiến pháp đầu tiên của nước Việt Nam Dân chủ Cộng hòa.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789801413/K%C3%AC_h%E1%BB%8Dp_th%E1%BB%A9_I_Qu%E1%BB%91c_h%E1%BB%99i_Vi%E1%BB%87t_Nam_kh%C3%B3a_%C4%91%E1%BA%A7u_ti%C3%AAn.jpg`,
        caption:
          'Quốc hội khóa I của nước Việt Nam Dân chủ Cộng hòa năm 1946, đánh dấu sự hình thành cơ quan đại diện quyền lực nhà nước sau Tổng tuyển cử đầu tiên.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789801463/Ch%E1%BB%A7_t%E1%BB%8Bch_H%E1%BB%93_Ch%C3%AD_Minh_v%C3%A0_Ban_d%E1%BB%B1_th%E1%BA%A3o_Hi%E1%BA%BFn_ph%C3%A1p_n%C4%83m_1946.gif`,
        caption: 'Chủ tịch Hồ Chí Minh cùng Ban dự thảo Hiến pháp năm 1946 trong quá trình xây dựng bản Hiến pháp đầu tiên.',
      },
    ],
    position: { x: -7.81, y: 1.9, z: -35.5 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
  },
  {
    id: 'room2-hien-phap-1992',
    roomId: 'room2',
    title: 'Hiến pháp năm 1992 và quá trình đổi mới bộ máy nhà nước',
    year: '1992',
    location: 'Kỳ họp thứ 11, Quốc hội khóa VIII',
    category: 'Văn kiện lập hiến',
    description:
      'Chuyên đề giới thiệu Hiến pháp năm 1992 và bối cảnh Quốc hội thông qua văn kiện này. Bản Hiến pháp gắn liền với quá trình cải cách bộ máy nhà nước trong giai đoạn đầu công cuộc đổi mới, chuyển đổi từ cơ chế quản lý tập trung sang nền kinh tế nhiều thành phần vận hành theo cơ chế thị trường định hướng xã hội chủ nghĩa.',
    significance:
      'Đánh dấu bước phát triển trong tư duy tổ chức nhà nước phù hợp với yêu cầu đổi mới kinh tế – xã hội, thể hiện sự vận dụng lý luận về nhà nước và pháp luật xã hội chủ nghĩa vào thực tiễn cải cách thể chế.',
    source: 'Trung tâm Lưu trữ Quốc gia III / Tư liệu phục chế',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789801506/Hi%E1%BA%BFn_ph%C3%A1p_1992.png`,
    thumbnailCaption: 'Hiến pháp năm 1992, được ban hành trong bối cảnh đổi mới và hoàn thiện tổ chức bộ máy nhà nước.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789801553/Qu%E1%BB%91c_h%E1%BB%99i_th%C3%B4ng_qua_Hi%E1%BA%BFn_ph%C3%A1p_n%C4%83m_1992.jpg`,
        caption: 'Quốc hội thông qua Hiến pháp năm 1992, đánh dấu một bước phát triển trong quá trình xây dựng và hoàn thiện hệ thống pháp luật.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789803976/C%E1%BA%A3i_c%C3%A1ch_b%E1%BB%99_m%C3%A1y_nh%C3%A0_n%C6%B0%E1%BB%9Bc.webp`,
        caption: 'Hình ảnh về quá trình cải cách bộ máy nhà nước trong thời kỳ đổi mới, hướng tới nâng cao hiệu quả quản lý nhà nước.',
      },
    ],
    position: { x: -7.81, y: 1.9, z: -26.5 },
    rotation: { x: 0, y: Math.PI / 2, z: 0 },
  },
  {
    id: 'room2-hien-phap-2013',
    roomId: 'room2',
    title: 'Hiến pháp năm 2013 và hoàn thiện Nhà nước pháp quyền',
    year: '2013',
    location: 'Kỳ họp thứ 6, Quốc hội khóa XIII',
    category: 'Văn kiện lập hiến',
    description:
      'Chuyên đề trình bày quá trình xây dựng Hiến pháp năm 2013 — bản Hiến pháp hiện hành. Nội dung phản ánh việc tổ chức lấy ý kiến rộng rãi trong nhân dân, một hình thức để nhân dân tham gia quản lý nhà nước và xã hội, đến phiên biểu quyết thông qua tại Quốc hội.',
    significance:
      'Hiến pháp năm 2013 hoàn thiện các quy định về tổ chức quyền lực nhà nước theo nguyên tắc quyền lực nhà nước là thống nhất, có sự phân công, phối hợp và kiểm soát giữa các cơ quan. Bản Hiến pháp cũng đề cao vị trí của quyền con người, quyền công dân — bước phát triển quan trọng trong xây dựng Nhà nước pháp quyền xã hội chủ nghĩa.',
    source: 'Văn phòng Quốc hội / Tư liệu phục chế',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789801635/Hi%E1%BA%BFn_ph%C3%A1p_2013.png`,
    thumbnailCaption: 'Hiến pháp năm 2013, văn bản pháp lý quan trọng trong giai đoạn phát triển và hội nhập của Việt Nam.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789801676/%C4%90%E1%BA%A1i_bi%E1%BB%83u_Qu%E1%BB%91c_h%E1%BB%99i_b%E1%BA%A5m_n%C3%BAt_th%C3%B4ng_qua_Hi%E1%BA%BFn_ph%C3%A1p_ng%C3%A0y_28_11_2013.png`,
        caption: 'Đại biểu Quốc hội biểu quyết thông qua Hiến pháp năm 2013 tại kỳ họp Quốc hội khóa XIII.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789801684/L%E1%BA%A5y_%C3%BD_ki%E1%BA%BFn_nh%C3%A2n_d%C3%A2n_v%E1%BB%81_Hi%E1%BA%BFn_ph%C3%A1p.jpg`,
        caption: 'Hoạt động lấy ý kiến nhân dân về dự thảo Hiến pháp năm 2013, thể hiện sự tham gia của nhân dân vào quá trình xây dựng pháp luật.',
      },
    ],
    position: { x: 7.81, y: 1.9, z: -35.5 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  },
  {
    id: 'room2-tu-phap',
    roomId: 'room2',
    title: 'Hoạt động tư pháp và bảo vệ pháp luật',
    year: 'Đương đại',
    location: 'Hệ thống Tòa án nhân dân các cấp',
    category: 'Tổ chức bộ máy nhà nước',
    description:
      'Chuyên đề giới thiệu tổ chức và hoạt động của hệ thống cơ quan tư pháp, trọng tâm là hoạt động tư pháp của Tòa án nhân dân, cùng vai trò của các thiết chế bảo đảm thực thi pháp luật trong bộ máy nhà nước.',
    significance:
      'Thể hiện nguyên tắc phân công, phối hợp và kiểm soát quyền lực nhà nước, trong đó quyền tư pháp giữ vai trò bảo vệ công lý, quyền con người và trật tự pháp luật — một nội dung cốt lõi trong xây dựng Nhà nước pháp quyền xã hội chủ nghĩa.',
    source: 'Tòa án nhân dân tối cao / Tư liệu phục chế',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789801742/Ho%E1%BA%A1t_%C4%91%E1%BB%99ng_t%C6%B0_ph%C3%A1p_t%C3%B2a_%C3%A1n.png`,
    thumbnailCaption: 'Hoạt động tư pháp trong hệ thống Nhà nước pháp quyền xã hội chủ nghĩa Việt Nam.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789801909/ho%E1%BA%A1t_%C4%91%E1%BB%99ng_x%C3%A9t_x%E1%BB%AD.jpg`,
        caption: 'Hoạt động xét xử tại tòa án, thể hiện chức năng bảo vệ công lý và thực hiện quyền tư pháp.',
      },
    ],
    position: { x: 7.81, y: 1.9, z: -26.5 },
    rotation: { x: 0, y: -Math.PI / 2, z: 0 },
  },
]

// --- Room 3 -----------------------------------------------------------
//
// Room 3 uses the same artifact system as Rooms 1 and 2: four wall frames
// (ArtifactFrame), each opening the shared panel on E with its own gallery,
// captions and source. It is an exhibition room only — no game logic.
//
// Scope: content stays within "từ thời kỳ Đổi mới đến trước năm 2021" — no
// events, reforms or examples after 2021.
//
// The exhibits are spread over three walls, apart from the LED screens
// (supplementary media displays, see Room3Props):
//   left wall  : 15, 16
//   front wall : 17 (left of the entrance door)
//   back wall  : 18 (right of the exit door)
// Same slot convention as Rooms 1 and 2: 0.19 in front of the wall's centreline
// (x = -7.81 on the left wall, z = -54.81 back / -41.19 front).

const ROOM3_ERA = 'Từ thời kỳ Đổi mới đến trước năm 2021'
const ROOM3_LEFT_WALL = { x: 0, y: Math.PI / 2, z: 0 }
const ROOM3_BACK_WALL = { x: 0, y: 0, z: 0 }
const ROOM3_FRONT_WALL = { x: 0, y: Math.PI, z: 0 }

export const ROOM3_ARTIFACTS: Artifact[] = [
  {
    id: 'room3-citizen-feedback',
    roomId: 'room3',
    title: 'Lấy ý kiến nhân dân và tiếp xúc cử tri',
    year: ROOM3_ERA,
    location: 'Chính quyền địa phương',
    category: 'Nhân dân tham gia xây dựng chính quyền',
    description:
      'Lấy ý kiến nhân dân và tiếp xúc cử tri là những hình thức để người dân trực tiếp trao đổi, phản ánh nguyện vọng và đóng góp ý kiến với chính quyền địa phương và đại biểu dân cử, thể hiện cơ chế tham gia của nhân dân trong quản lý nhà nước và xã hội.',
    significance:
      'Thông qua đối thoại trực tiếp, ý kiến của người dân được lắng nghe và đưa vào quá trình xây dựng, hoàn thiện chính sách, pháp luật và quản lý ở địa phương — cụ thể hóa phương châm "dân biết, dân bàn, dân làm, dân kiểm tra".',
    source: 'Cổng thông tin điện tử tỉnh Hưng Yên',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789887096/L%E1%BA%A5y_%C3%BD_ki%E1%BA%BFn_nh%C3%A2n_d%C3%A2n.png`,
    thumbnailCaption: 'Người dân trao đổi, đóng góp ý kiến với chính quyền địa phương.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886243/l%E1%BA%A5y_%C3%BD_ki%E1%BA%BFn_nh%C3%A2n_d%C3%A2n_new.jpg`,
        caption: 'Hoạt động lấy ý kiến nhân dân tại địa phương.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886048/Ti%E1%BA%BFp_x%C3%BAc_c%E1%BB%AD_tri.jpg`,
        caption: 'Tiếp xúc cử tri — kênh để nhân dân phản ánh nguyện vọng với đại biểu dân cử.',
      },
    ],
    position: { x: -7.81, y: 1.9, z: -44.2 },
    rotation: ROOM3_LEFT_WALL,
  },
  {
    id: 'room3-community-participation',
    roomId: 'room3',
    title: 'Hội nghị cộng đồng và dân chủ ở cơ sở',
    year: ROOM3_ERA,
    location: 'Cộng đồng dân cư',
    category: 'Nhân dân tham gia xây dựng chính quyền',
    description:
      'Các cuộc họp tổ dân phố, hội nghị cộng đồng dân cư và những hoạt động xã hội ở địa phương là nơi người dân cùng bàn bạc các vấn đề chung của khu dân cư, tham gia xây dựng môi trường sống và phát triển cộng đồng.',
    significance:
      'Cộng đồng dân cư là không gian quan trọng để người dân thực hiện quyền tham gia và trách nhiệm xã hội, là nền tảng của dân chủ ở cơ sở trong thời kỳ Đổi mới.',
    source: 'Tư liệu hoạt động cộng đồng',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789886321/H%E1%BB%99i_ngh%E1%BB%8B_c%E1%BB%99ng_%C4%91%E1%BB%93ng.png`,
    thumbnailCaption: 'Hội nghị cộng đồng dân cư tại địa phương.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886366/H%E1%BB%8Dp_t%E1%BB%95_d%C3%A2n_ph%E1%BB%91.jpg`,
        caption: 'Họp tổ dân phố — nơi người dân cùng bàn bạc các vấn đề của khu dân cư.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886358/Ng%C6%B0%E1%BB%9Di_d%C3%A2n_tham_gia_ho%E1%BA%A1t_%C4%91%E1%BB%99ng_x%C3%A3_h%E1%BB%99i.jpg`,
        caption: 'Người dân tham gia các hoạt động xã hội ở cộng đồng.',
      },
    ],
    position: { x: -7.81, y: 1.9, z: -51.8 },
    rotation: ROOM3_LEFT_WALL,
  },
  {
    id: 'room3-community-supervision',
    roomId: 'room3',
    title: 'Giám sát cộng đồng và sự tham gia của nhân dân',
    year: ROOM3_ERA,
    location: 'Chính quyền và cộng đồng địa phương',
    category: 'Giám sát và phản hồi từ cộng đồng',
    description:
      'Người dân tham gia theo dõi, phản ánh và giám sát các hoạt động đầu tư, xây dựng và quản lý tại địa phương thông qua các hình thức giám sát của cộng đồng.',
    significance:
      'Hoạt động giám sát cộng đồng góp phần tăng tính minh bạch và trách nhiệm trong quản lý xã hội, phát huy vai trò làm chủ của nhân dân.',
    source: 'Thư viện pháp luật',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789886434/Gi%C3%A1m_s%C3%A1t_c%E1%BB%99ng_%C4%91%E1%BB%93ng.png`,
    thumbnailCaption: 'Người dân tham gia theo dõi, giám sát hoạt động ở địa phương.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886821/ho%E1%BA%A1t_%C4%91%E1%BB%99ng_x%C3%A3_h%E1%BB%99i_1.jpg`,
        caption: 'Hoạt động xã hội có sự tham gia của người dân.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886822/Ho%E1%BA%A1t_%C4%91%E1%BB%99ng_x%C3%A3_h%E1%BB%99i.jpg`,
        caption: 'Cộng đồng cùng theo dõi, phản ánh và đóng góp ý kiến.',
      },
    ],
    position: { x: -6, y: 1.9, z: -41.19 },
    rotation: ROOM3_FRONT_WALL,
  },
  {
    id: 'room3-digital-government',
    roomId: 'room3',
    title: 'Cải cách hành chính và dịch vụ công phục vụ nhân dân',
    year: ROOM3_ERA,
    location: 'Cơ quan hành chính nhà nước',
    category: 'Hiện đại hóa quản trị và dịch vụ công',
    description:
      'Cải cách hành chính và việc cung cấp dịch vụ công, trong đó có dịch vụ công trực tuyến, thể hiện quá trình đổi mới phương thức phục vụ người dân của bộ máy nhà nước. Trung tâm hành chính công là nơi tiếp nhận và giải quyết thủ tục hành chính theo hướng thuận tiện, công khai, minh bạch.',
    significance:
      'Ứng dụng công nghệ thông tin trong quản lý nhà nước góp phần nâng cao khả năng tiếp cận dịch vụ công và trách nhiệm phục vụ nhân dân.',
    source: 'Tư liệu cải cách hành chính',
    thumbnail: `${CLOUDINARY_UPLOAD}/v1789886838/Trung_t%C3%A2m_h%C3%A0nh_ch%C3%ADnh_c%C3%B4ng.png`,
    thumbnailCaption: 'Trung tâm hành chính công — nơi tiếp nhận và giải quyết thủ tục hành chính cho người dân.',
    gallery: [
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886998/d%E1%BB%8Bch_v%E1%BB%A5_c%C3%B4ng_tr%E1%BB%B1c_tuy%E1%BA%BFn.png`,
        caption: 'Dịch vụ công trực tuyến giúp người dân thực hiện thủ tục hành chính thuận tiện hơn.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789886996/Ch%C3%ADnh_Ph%E1%BB%A7_S%E1%BB%91_Qu%E1%BB%91c_t%E1%BA%BF.jpg`,
        caption: 'Chính phủ số — xu hướng ứng dụng công nghệ trong quản lý nhà nước.',
      },
      {
        url: `${CLOUDINARY_UPLOAD}/v1789887000/Ch%C3%ADnh_ph%E1%BB%A7_s%E1%BB%91.jpg`,
        caption: 'Chính phủ số — hướng tới nâng cao khả năng tiếp cận dịch vụ công.',
      },
    ],
    position: { x: 6, y: 1.9, z: -54.81 },
    rotation: ROOM3_BACK_WALL,
  },
]

export const ARTIFACTS: Artifact[] = [...ROOM1_ARTIFACTS, ...ROOM2_ARTIFACTS, ...ROOM3_ARTIFACTS]

export function getArtifactsByRoom(roomId: string): Artifact[] {
  return ARTIFACTS.filter((artifact) => artifact.roomId === roomId)
}

export function getArtifactById(id: string): Artifact | undefined {
  return ARTIFACTS.find((artifact) => artifact.id === id)
}
