import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { ThreeElements } from '@react-three/fiber'
import { Box3, Mesh, Vector3, type Group } from 'three'

const MODEL_PATH = '/models/ballot-box-1946.glb'

type BallotBox1946Props = Pick<ThreeElements['group'], 'position' | 'rotation' | 'scale'>

export default function BallotBox1946(props: BallotBox1946Props) {
  const { scene } = useGLTF(MODEL_PATH) as { scene: Group }

  const { model, modelOffset } = useMemo(() => {
    const clone = scene.clone(true)

    clone.traverse((child) => {
      if (child instanceof Mesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })

    const bounds = new Box3().setFromObject(clone)
    const center = bounds.getCenter(new Vector3())

    return {
      model: clone,
      modelOffset: new Vector3(-center.x, -bounds.min.y, -center.z),
    }
  }, [scene])

  return (
    <group {...props}>
      <primitive object={model} position={modelOffset} dispose={null} />
    </group>
  )
}

useGLTF.preload(MODEL_PATH)
