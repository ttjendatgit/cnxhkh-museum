import { Text } from '@react-three/drei'

const CHARCOAL = '#1B1815'
const BACKING = '#0F0D0B'
const BRONZE = '#B08A4F'
const BRONZE_DIM = '#8B6A3E'
const GOLD = '#D8B56A'
const IVORY_DIM = '#CABFA9'

const WIDTH = 0.92
const HEIGHT = 0.34
const RAIL = 0.025
const TEXT_Z = 0.038

interface EntranceRoomSignProps {
  roomNumber: string
  period?: string
  position: [number, number, number]
  rotationY?: number
}

export default function EntranceRoomSign({
  roomNumber,
  period,
  position,
  rotationY = 0,
}: EntranceRoomSignProps) {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      <pointLight position={[0, 0.12, 0.32]} color={GOLD} intensity={0.12} distance={1.1} decay={2} />

      <mesh position={[0, 0, -0.026]} receiveShadow>
        <boxGeometry args={[WIDTH + 0.08, HEIGHT + 0.08, 0.014]} />
        <meshStandardMaterial color={BACKING} roughness={0.88} metalness={0} />
      </mesh>
      <mesh position={[0, 0, -0.004]} castShadow receiveShadow>
        <boxGeometry args={[WIDTH, HEIGHT, 0.032]} />
        <meshStandardMaterial color={CHARCOAL} roughness={0.58} metalness={0.04} />
      </mesh>
      {[
        [0, HEIGHT / 2 - RAIL / 2, WIDTH, RAIL],
        [0, -(HEIGHT / 2 - RAIL / 2), WIDTH, RAIL],
        [-(WIDTH / 2 - RAIL / 2), 0, RAIL, HEIGHT],
        [WIDTH / 2 - RAIL / 2, 0, RAIL, HEIGHT],
      ].map(([x, y, width, height], index) => (
        <mesh key={`rail-${index}`} position={[x, y, 0.015]} castShadow receiveShadow>
          <boxGeometry args={[width, height, 0.036]} />
          <meshStandardMaterial
            color={index < 2 ? BRONZE : BRONZE_DIM}
            emissive={GOLD}
            emissiveIntensity={0.04}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}

      <Text
        fontSize={0.07}
        color={GOLD}
        anchorX="center"
        anchorY="middle"
        maxWidth={WIDTH - 0.14}
        textAlign="center"
        position={[0, period ? 0.055 : 0, TEXT_Z]}
      >
        {roomNumber}
      </Text>
      {period && (
        <Text
          fontSize={0.038}
          color={IVORY_DIM}
          anchorX="center"
          anchorY="middle"
          maxWidth={WIDTH - 0.16}
          textAlign="center"
          position={[0, -0.08, TEXT_Z]}
        >
          {period}
        </Text>
      )}
    </group>
  )
}
