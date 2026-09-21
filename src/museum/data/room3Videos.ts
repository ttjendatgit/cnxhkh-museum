/** The two documentary videos on Room 3's video walls (Cloudinary). Each plays muted on a loop
 * on its wall screen; pressing E next to a screen opens it in a large player with sound.
 * `width` / `height` are the video's own pixel size — the screen frame and the picture are
 * fitted to that aspect ratio, so the picture is never stretched or cropped. */
export interface MuseumVideo {
  id: string
  /** Shown on the caption plate under the screen and in the player. */
  title: string
  url: string
  width: number
  height: number
}

const CLOUDINARY_VIDEO = 'https://res.cloudinary.com/dw8lijwvw/video/upload'

/** Portrait 9:16 — a timeline of Vietnam through its periods. Hangs on the left wall,
 * in the slot the "timeline" screen had. */
export const VIDEO_VIETNAM_THROUGH_PERIODS: MuseumVideo = {
  id: 'room3-viet-nam-qua-tung-thoi-ky',
  title: 'Việt Nam qua từng thời kỳ',
  url: `${CLOUDINARY_VIDEO}/v1789969979/VietNamquatungthoiky.mp4`,
  width: 576,
  height: 1024,
}

/** About 4:3 (720 x 558). Hangs on the back wall, straight ahead on the entry axis. */
export const VIDEO_VIETNAM_RISING: MuseumVideo = {
  id: 'room3-su-vuon-minh-cua-viet-nam',
  title: 'Sự vươn mình của Việt Nam',
  url: `${CLOUDINARY_VIDEO}/v1789970326/suphatrien.mp4`,
  width: 720,
  height: 558,
}

/** 16:9 (1280 x 720) — a VTV news piece on public services and community life. Hangs on the front
 * wall, right of the entrance door. TODO: `title` is a placeholder (the slot's old "Cộng đồng và
 * dịch vụ công" label) until the final name is decided — it is the only place to change. */
export const VIDEO_COMMUNITY_SERVICES: MuseumVideo = {
  id: 'room3-cong-dong-va-dich-vu-cong',
  title: 'Cộng đồng và dịch vụ công',
  url: `${CLOUDINARY_VIDEO}/f_mp4/v1789972950/af5e7481-e098-4d98-ba9c-10bc5244150e.mp4`,
  width: 1280,
  height: 720,
}
