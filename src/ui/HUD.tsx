import { useIsTouchDevice } from '../museum/input/useIsTouchDevice'

export default function HUD() {
  const touch = useIsTouchDevice()

  return (
    <div className="hud">
      <div className="hud-info">
        <p className="hud-title">QUYỀN LÀM CHỦ</p>
        {touch ? (
          <>
            <p>Cần trái — Di chuyển</p>
            <p>Vuốt màn hình — Quan sát</p>
          </>
        ) : (
          <>
            <p>WASD — Di chuyển</p>
            <p>Chuột — Quan sát</p>
            <p>ESC — Thoát</p>
          </>
        )}
      </div>
      <div className="hud-crosshair">+</div>
    </div>
  )
}
