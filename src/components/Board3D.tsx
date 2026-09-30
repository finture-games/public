import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { Component, ReactNode, useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { BOARD } from '../data/characters'
import { TILE_COLORS, TileType } from '../data/types'
import { useGameStore } from '../store/game'
import Board2D from './Board2D'

// 30 Monopoly tiles around a rounded rectangular track loop
export function tileWorldPos(n: number): THREE.Vector3 {
  if (n <= 8) {
    const t = (n - 1) / 7
    return new THREE.Vector3(-4.6 + t * 9.2, 0, 5.2)
  } else if (n <= 15) {
    const t = (n - 8) / 7
    return new THREE.Vector3(4.6, 0, 5.2 - t * 7.4)
  } else if (n <= 23) {
    const t = (n - 15) / 8
    return new THREE.Vector3(4.6 - t * 9.2, 0, -2.2)
  } else {
    const t = (n - 23) / 7
    return new THREE.Vector3(-4.6, 0, -2.2 + t * 7.4)
  }
}

// 1. FLOATING 3D MONEY SPOILER ICON ABOVE GAJIAN TILES (Suction & Claim effect)
function TileSpoilerIcon({ index, type }: { index: number; type: TileType }) {
  const currentTileIndex = useGameStore((s) => s.session?.position ?? 1)
  const isClaimed = currentTileIndex >= index
  const meshRef = useRef<THREE.Group>(null)
  const animProgress = useRef(0)

  useFrame((state, dt) => {
    if (!meshRef.current) return
    const t = state.clock.elapsedTime

    if (!isClaimed) {
      animProgress.current = 0
      meshRef.current.position.set(0, 0.65 + Math.sin(t * 3.0) * 0.08, 0)
      meshRef.current.rotation.y = t * 1.2
      meshRef.current.scale.set(1, 1, 1)
    } else if (animProgress.current < 1) {
      animProgress.current = Math.min(1, animProgress.current + dt / 0.35)
      const p = animProgress.current
      const scale = Math.max(0, 1.0 - p)
      meshRef.current.position.y = 0.65 + p * 0.8
      meshRef.current.rotation.y += dt * 10
      meshRef.current.scale.set(scale, scale, scale)
    } else {
      meshRef.current.scale.set(0, 0, 0)
    }
  })

  if (type !== 'gajian') return null

  return (
    <group ref={meshRef} position={[0, 0.65, 0]}>
      {/* Floating Green Cash Banknote 💵 */}
      <mesh castShadow>
        <boxGeometry args={[0.55, 0.03, 0.28]} />
        <meshStandardMaterial color="#22C55E" emissive="#15803D" emissiveIntensity={0.6} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.015, 12]} />
        <meshStandardMaterial color="#DCFCE7" emissive="#4ADE80" emissiveIntensity={0.8} />
      </mesh>
    </group>
  )
}

// 3. BEVELED GEM MONOPOLY TILE (Square / Dot Nodes)
function Tile({ index, type }: { index: number; type: string }) {
  const pos = tileWorldPos(index)
  const isCurrent = useGameStore((s) => s.session?.position === index)
  const ringRef = useRef<THREE.Mesh>(null)
  const color = TILE_COLORS[type as TileType] ?? '#3B82F6'

  useFrame((state) => {
    if (ringRef.current) {
      const s = 1 + 0.14 * Math.sin(state.clock.elapsedTime * 4.5)
      ringRef.current.scale.setScalar(s)
    }
  })

  return (
    <group position={pos}>
      <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.52, 0.54, 0.10, 24]} />
        <meshStandardMaterial color="#F59E0B" roughness={0.25} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.45, 0.48, 0.12, 24]} />
        <meshStandardMaterial color={color} roughness={0.2} metalness={0.15} />
      </mesh>
      <mesh position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.03, 24]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.1} opacity={0.75} transparent />
      </mesh>

      {/* Floating 3D Money Icon above Gajian tile */}
      <TileSpoilerIcon index={index} type={type as TileType} />

      {isCurrent && (
        <mesh ref={ringRef} position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.07, 12, 32]} />
          <meshStandardMaterial color="#F59E0B" emissive="#F59E0B" emissiveIntensity={1.2} />
        </mesh>
      )}
    </group>
  )
}



// 3. FLOATING MONEY BILLS PARTICLES IN THE SKY (Reference Image Feature)
function FloatingMoneyParticles() {
  const count = 40
  const billsRef = useRef<THREE.Group>(null)

  const billsData = useMemo(() => {
    return Array.from({ length: count }, () => ({
      x: (Math.random() - 0.5) * 28,
      y: 4 + Math.random() * 14,
      z: -8 + (Math.random() - 0.5) * 22,
      speed: 1.2 + Math.random() * 1.5,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      rotZ: Math.random() * Math.PI,
      swayFreq: 1.5 + Math.random() * 2.0,
      scale: 0.6 + Math.random() * 0.5,
    }))
  }, [count])

  useFrame((state, dt) => {
    if (!billsRef.current) return
    const t = state.clock.elapsedTime
    billsRef.current.children.forEach((child, i) => {
      const b = billsData[i]
      b.y -= b.speed * dt
      b.x += Math.sin(t * b.swayFreq + i) * 0.02
      b.z += Math.cos(t * b.swayFreq * 0.8 + i) * 0.015

      b.rotX += dt * 1.8
      b.rotY += dt * 1.2

      if (b.y < 0.2) {
        b.y = 16 + Math.random() * 4
        b.x = (Math.random() - 0.5) * 28
        b.z = -8 + (Math.random() - 0.5) * 22
      }

      child.position.set(b.x, b.y, b.z)
      child.rotation.set(b.rotX, b.rotY, b.rotZ)
    })
  })

  return (
    <group ref={billsRef}>
      {billsData.map((b, i) => (
        <group key={`money-${i}`} scale={[b.scale, b.scale, b.scale]}>
          {/* Green Cash Banknote Body */}
          <mesh castShadow>
            <boxGeometry args={[0.7, 0.02, 0.35]} />
            <meshStandardMaterial color="#4ADE80" emissive="#16A34A" emissiveIntensity={0.25} roughness={0.3} />
          </mesh>
          {/* Inner Money Emblem Circle */}
          <mesh position={[0, 0.012, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.01, 12]} />
            <meshStandardMaterial color="#DCFCE7" roughness={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 4. ANIMATED PLAYER PAWN
function Pawn() {
  const session = useGameStore((s) => s.session)
  const characterId = session?.characterId ?? 'alep'

  const group = useRef<THREE.Group>(null)
  const spriteMesh = useRef<THREE.Mesh>(null)

  const [textures, setTextures] = useState<{ idle: THREE.Texture | null; walk: THREE.Texture | null }>({
    idle: null,
    walk: null,
  })
  const [isMoving, setIsMoving] = useState(false)
  const [facingRight, setFacingRight] = useState(true)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    let isMounted = true
    const idlePath = `/characters/${characterId}/${characterId}_6_full_body.png`
    const walkPath = `/characters/${characterId}/${characterId}_7_walk.png`

    loader.load(idlePath, (tIdle) => {
      tIdle.colorSpace = THREE.SRGBColorSpace
      loader.load(walkPath, (tWalk) => {
        tWalk.colorSpace = THREE.SRGBColorSpace
        if (isMounted) setTextures({ idle: tIdle, walk: tWalk })
      })
    })
    return () => {
      isMounted = false
    }
  }, [characterId])

  const target = useMemo(() => tileWorldPos(session?.position ?? 1), [session?.position])
  const currentPos = useRef(new THREE.Vector3(target.x, 0, target.z))
  const startPos = useRef(new THREE.Vector3(target.x, 0, target.z))
  const animProgress = useRef(1)

  useEffect(() => {
    startPos.current.copy(currentPos.current)
    animProgress.current = 0
  }, [target.x, target.z])

  useFrame((state, dt) => {
    if (!group.current) return
    const t = state.clock.elapsedTime

    if (animProgress.current < 1) {
      animProgress.current = Math.min(1, animProgress.current + dt / 0.35)
      const p = animProgress.current

      // Smooth ease-in-out curve for horizontal movement
      const easeP = p * p * (3 - 2 * p)
      currentPos.current.x = THREE.MathUtils.lerp(startPos.current.x, target.x, easeP)
      currentPos.current.z = THREE.MathUtils.lerp(startPos.current.z, target.z, easeP)

      // Parabolic Y-arc hop (peak height 0.55u at mid-flight)
      const yHop = Math.sin(p * Math.PI) * 0.55

      // Organic Squash & Stretch during jump & landing
      let scaleYFactor = 1.0 + Math.sin(p * Math.PI) * 0.25
      let scaleXFactor = 1.0 - Math.sin(p * Math.PI) * 0.12
      if (p > 0.85) {
        // Impact landing squash on tile
        const landFactor = Math.sin(((p - 0.85) / 0.15) * Math.PI)
        scaleYFactor = 1.0 - landFactor * 0.18
        scaleXFactor = 1.0 + landFactor * 0.14
      }

      const stepSway = Math.sin(p * Math.PI) * 0.08
      const dx = target.x - startPos.current.x
      if (Math.abs(dx) > 0.1) {
        setFacingRight(dx > 0)
      }

      setIsMoving(true)

      group.current.position.x = currentPos.current.x
      group.current.position.z = currentPos.current.z
      group.current.position.y = 0.19 + yHop

      if (spriteMesh.current) {
        spriteMesh.current.rotation.z = (facingRight ? -1 : 1) * stepSway
        spriteMesh.current.scale.set((facingRight ? 1.0 : -1.0) * scaleXFactor, scaleYFactor, 1.0)
      }
    } else {
      setIsMoving(false)
      currentPos.current.set(target.x, 0, target.z)
      group.current.position.x = target.x
      group.current.position.z = target.z

      const yHop = Math.sin(t * 2.2) * 0.025
      const stepSway = Math.sin(t * 1.1) * 0.015
      const scaleYFactor = 1.0 + Math.sin(t * 2.2) * 0.015
      const scaleXFactor = 1.0 - Math.sin(t * 2.2) * 0.01

      group.current.position.y = 0.19 + yHop

      if (spriteMesh.current) {
        spriteMesh.current.rotation.z = stepSway
        spriteMesh.current.scale.set((facingRight ? 1.0 : -1.0) * scaleXFactor, scaleYFactor, 1.0)
      }
    }
  })

  const activeTexture = isMoving ? textures.walk || textures.idle : textures.idle || textures.walk

  return (
    <group ref={group} position={[target.x, 0.19, target.z]}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {activeTexture && (
          <mesh ref={spriteMesh} position={[0, 0.72, 0.22]}>
            <planeGeometry args={[1.25, 1.95]} />
            <meshBasicMaterial map={activeTexture} transparent={true} alphaTest={0.05} side={THREE.DoubleSide} />
          </mesh>
        )}
      </Billboard>
    </group>
  )
}

// 5. CAMERA RIG: Dynamic character-following isometric view
function CameraRig() {
  const position = useGameStore((s) => s.session?.position ?? 1)
  const target = useMemo(() => tileWorldPos(position), [position])
  const look = useRef(new THREE.Vector3(target.x, 1.0, target.z))

  useFrame(({ camera, size }, dt) => {
    // Detect mobile/portrait screen aspect ratio for adaptive framing
    const isPortrait = size.width / size.height < 1.0
    const xFollowFactor = isPortrait ? 0.85 : 0.65
    const zOffset = isPortrait ? 11.5 : 10.5
    const yHeight = isPortrait ? 13.5 : 12.5

    const desiredPos = new THREE.Vector3(
      target.x * xFollowFactor,
      yHeight,
      target.z + zOffset
    )

    const desiredLook = new THREE.Vector3(
      target.x * (isPortrait ? 0.95 : 0.8),
      0.9,
      target.z + 0.2
    )

    const lerpSpeed = 1 - Math.exp(-4.5 * dt)
    camera.position.lerp(desiredPos, lerpSpeed)
    look.current.lerp(desiredLook, lerpSpeed)
    camera.lookAt(look.current)
  })

  return null
}

// 6. CLUSTERY 3D TOON TREES
function ToonBushyTree({ position, scale = 1.0 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Planter Pot Base Ring */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.45, 0.22, 16]} />
        <meshStandardMaterial color="#94A3B8" roughness={0.4} />
      </mesh>
      {/* Trunk */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.32, 1.6, 12]} />
        <meshStandardMaterial color="#78350F" roughness={0.7} />
      </mesh>

      {/* Clustered Bushy Spheres (Toon Style) */}
      <mesh position={[0, 2.3, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[1.3, 1]} />
        <meshStandardMaterial color="#4ADE80" roughness={0.4} flatShading />
      </mesh>
      <mesh position={[-0.5, 2.8, 0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.9, 1]} />
        <meshStandardMaterial color="#22C55E" roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0.5, 2.7, -0.3]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.95, 1]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0, 3.4, 0]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.8, 1]} />
        <meshStandardMaterial color="#A3E635" roughness={0.4} flatShading />
      </mesh>
    </group>
  )
}

// 7. PROCEDURAL 3D RECTORATE HALL (Rektorat - Matching Reference Image Facade)
function ProceduralRektorat3D() {
  const sealRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (sealRef.current) {
      sealRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group position={[0, 0, -11.5]}>
      {/* Grand Marble Plaza Stairs */}
      <mesh position={[0, 0.15, 0.5]} receiveShadow castShadow>
        <boxGeometry args={[16.0, 0.3, 4.5]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 1.2]} receiveShadow castShadow>
        <boxGeometry args={[12.0, 0.3, 2.5]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.25} />
      </mesh>

      {/* Main Building Base Block (Pastel Tan / Cream Wall) */}
      <mesh position={[0, 2.4, -0.5]} castShadow receiveShadow>
        <boxGeometry args={[14.5, 3.6, 4.2]} />
        <meshStandardMaterial color="#FEF3C7" roughness={0.3} />
      </mesh>

      {/* White Classical Pillars Front Facade */}
      {[-5.6, -3.8, -2.0, 0.0, 2.0, 3.8, 5.6].map((x, i) => (
        <mesh key={`pillar-${i}`} position={[x, 2.4, 1.4]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.32, 3.2, 16]} />
          <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
        </mesh>
      ))}

      {/* Warm Emissive Interior Glow Windows */}
      {[-4.2, 0.0, 4.2].map((x, i) => (
        <mesh key={`glow-win-${i}`} position={[x, 2.5, 1.42]}>
          <boxGeometry args={[2.0, 2.0, 0.05]} />
          <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={0.8} />
        </mesh>
      ))}

      {/* Second Floor Balcony & Roof Pediment */}
      <mesh position={[0, 4.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[15.2, 0.5, 4.5]} />
        <meshStandardMaterial color="#60A5FA" roughness={0.25} />
      </mesh>

      {/* Upper Floor Body */}
      <mesh position={[0, 5.8, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[10.5, 2.6, 3.6]} />
        <meshStandardMaterial color="#3B82F6" roughness={0.3} />
      </mesh>

      {/* Triangular Roof Pediment Front Header */}
      <mesh position={[0, 7.3, 1.2]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[3.2, 3.2, 0.4]} />
        <meshStandardMaterial color="#2563EB" roughness={0.3} />
      </mesh>

      {/* Central Clock Base */}
      <mesh position={[0, 7.8, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.8, 3.4]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
      </mesh>

      {/* Analog Clock Face Mesh */}
      <mesh position={[0, 7.8, 1.42]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.06, 24]} />
        <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.9} />
      </mesh>

      {/* Floating Rotating University Badge Seal */}
      <group ref={sealRef} position={[0, 10.4, -0.3]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.8, 0.09, 16, 32]} />
          <meshStandardMaterial color="#60A5FA" emissive="#3B82F6" emissiveIntensity={1.2} />
        </mesh>
      </group>
    </group>
  )
}

// 8. STONE ARCH BRIDGE OVER THE PLAZA (Reference Image Feature)
function StoneArchBridge({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Curved Arch Base */}
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.6, 0.5, 2.2]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
      </mesh>
      {/* Arch Bridge Ramp West */}
      <mesh position={[-1.7, 0.35, 0]} rotation={[0, 0, 0.22]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.4, 2.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.35} />
      </mesh>
      {/* Arch Bridge Ramp East */}
      <mesh position={[1.7, 0.35, 0]} rotation={[0, 0, -0.22]} castShadow receiveShadow>
        <boxGeometry args={[1.8, 0.4, 2.2]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.35} />
      </mesh>

      {/* Stone Side Railings / Balustrades */}
      {[-1.0, 1.0].map((z, i) => (
        <group key={`rail-${i}`} position={[0, 0, z]}>
          <mesh position={[0, 1.0, 0]} castShadow>
            <boxGeometry args={[4.8, 0.25, 0.25]} />
            <meshStandardMaterial color="#94A3B8" roughness={0.3} />
          </mesh>
          {[-2.0, -1.0, 0, 1.0, 2.0].map((x, j) => (
            <mesh key={`post-${j}`} position={[x, 0.75, 0]} castShadow>
              <cylinderGeometry args={[0.08, 0.1, 0.4, 12]} />
              <meshStandardMaterial color="#64748B" roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}

// 9. ANIMATED WATER FOUNTAIN PLAZA (Reference Image Feature)
function WaterFountainPlaza() {
  const waterRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)
  const particleCount = 70

  const [positions] = useState(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 1.5
      pos[i * 3 + 1] = Math.random() * 2.0 + 0.5
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.5
    }
    return pos
  })

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (waterRef.current) {
      const mat = waterRef.current.material as THREE.MeshStandardMaterial
      if (mat) mat.emissiveIntensity = 0.6 + 0.35 * Math.sin(t * 3.8)
    }
    if (particlesRef.current) {
      const attr = particlesRef.current.geometry.attributes.position
      const arr = attr.array as Float32Array
      for (let i = 0; i < particleCount; i++) {
        arr[i * 3 + 1] += 0.024
        if (arr[i * 3 + 1] > 2.6) {
          arr[i * 3 + 1] = 0.6
          arr[i * 3] = (Math.random() - 0.5) * 1.5
          arr[i * 3 + 2] = (Math.random() - 0.5) * 1.5
        }
      }
      attr.needsUpdate = true
    }
  })

  return (
    <group position={[0, 0, 1.5]}>
      {/* Stone Plaza Circular Base */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[3.8, 36]} />
        <meshStandardMaterial color="#F1F5F9" roughness={0.3} />
      </mesh>

      {/* Fountain Outer Stone Rim Basin */}
      <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[2.5, 2.7, 0.42, 36]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.2} />
      </mesh>

      {/* Animated Glowing Water Pool */}
      <mesh ref={waterRef} position={[0, 0.4, 0]}>
        <cylinderGeometry args={[2.38, 2.38, 0.04, 36]} />
        <meshStandardMaterial color="#38BDF8" emissive="#0EA5E9" emissiveIntensity={0.7} roughness={0.1} />
      </mesh>

      {/* Center Stone Column */}
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.65, 0.95, 20]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
      </mesh>

      {/* Second Upper Bowl */}
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[1.2, 1.2, 0.16, 24]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.2} />
      </mesh>

      {/* Top Water Spray Jet Particles */}
      <points ref={particlesRef} position={[0, 0.9, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.16} color="#7DD3FC" transparent opacity={0.85} />
      </points>
    </group>
  )
}

// 10. 3D TOON STREET LAMP
function ToonStreetLamp({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.1, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.3, 0.2, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 1.3, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 2.4, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[0, 2.3, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 1.2, 12]} />
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.6} />
      </mesh>
      <mesh position={[-0.55, 2.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={1.0} />
      </mesh>
      <mesh position={[0.55, 2.2, 0]}>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={1.0} />
      </mesh>
    </group>
  )
}

// 11. 3D TOON PARK BENCH
function ToonParkBench({ position, rotation = [0, 0, 0] }: { position: [number, number, number]; rotation?: [number, number, number] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Wood Seat Plank */}
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.08, 0.45]} />
        <meshStandardMaterial color="#78350F" roughness={0.7} />
      </mesh>
      {/* Wood Backrest */}
      <mesh position={[0, 0.6, -0.2]} castShadow receiveShadow>
        <boxGeometry args={[1.4, 0.4, 0.08]} />
        <meshStandardMaterial color="#78350F" roughness={0.7} />
      </mesh>
      {/* Metal Legs */}
      {[-0.6, 0.6].map((x, i) => (
        <group key={`leg-${i}`} position={[x, 0.15, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.3, 0.45]} />
            <meshStandardMaterial color="#334155" roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// 12. ELEGANT CHECKERBOARD CAMPUS QUAD PLAZA & GARDEN
function CampusQuadPlaza() {
  const tileSize = 1.4
  const gridRows = 14
  const gridCols = 16

  const tiles = useMemo(() => {
    const list = []
    for (let r = 0; r < gridRows; r++) {
      for (let c = 0; c < gridCols; c++) {
        const isEven = (r + c) % 2 === 0
        const x = (c - gridCols / 2 + 0.5) * tileSize
        const z = (r - gridRows / 2 + 0.5) * tileSize
        list.push({ id: `${r}-${c}`, x, z, isEven })
      }
    }
    return list
  }, [gridRows, gridCols, tileSize])

  return (
    <group position={[0, 0, 1.5]}>
      {/* Checkerboard Paved Stone Tiles Floor */}
      {tiles.map((t) => (
        <mesh key={t.id} position={[t.x, 0.01, t.z]} receiveShadow>
          <boxGeometry args={[tileSize * 0.96, 0.015, tileSize * 0.96]} />
          <meshStandardMaterial color={t.isEven ? '#F8FAFC' : '#E2E8F0'} roughness={0.25} />
        </mesh>
      ))}

      {/* Lawn Border Edge Surrounding the Plaza */}
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <boxGeometry args={[26, 0.1, 22]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.6} />
      </mesh>

      {/* Garden Terraces Along Campus Edges */}
      {[-9.5, 9.5].map((x, i) => (
        <mesh key={`quad-hedge-x-${i}`} position={[x, 0.22, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.8, 0.35, 14.0]} />
          <meshStandardMaterial color="#15803D" roughness={0.6} />
        </mesh>
      ))}

      {/* Park Benches facing the Fountain (Placed safely inside plaza & outside south) */}
      <ToonParkBench position={[-2.1, 0, 1.5]} rotation={[0, Math.PI / 2, 0]} />
      <ToonParkBench position={[2.1, 0, 1.5]} rotation={[0, -Math.PI / 2, 0]} />
      <ToonParkBench position={[-2.5, 0, 7.2]} rotation={[0, 0, 0]} />
      <ToonParkBench position={[2.5, 0, 7.2]} rotation={[0, 0, 0]} />
    </group>
  )
}

function Scene() {
  return (
    <>
      {/* Warm Sunny Sky Lighting */}
      <ambientLight intensity={0.95} color="#FFFBEB" />
      <hemisphereLight intensity={0.7} color="#FEF3C7" groundColor="#86EFAC" />
      <directionalLight
        position={[14, 24, 12]}
        intensity={1.7}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
      />

      {/* Base Foundation Platform */}
      <mesh position={[0, -0.15, 0]} receiveShadow>
        <boxGeometry args={[36, 0.3, 36]} />
        <meshStandardMaterial color="#CBD5E1" roughness={0.4} />
      </mesh>

      {/* Floating Money Particles falling from Sky */}
      <FloatingMoneyParticles />

      {/* Procedural 3D Rektorat Building */}
      <ProceduralRektorat3D />

      {/* Stone Arch Bridge (Placed safely behind top tile track, Z = -5.8) */}
      <StoneArchBridge position={[0, 0, -5.8]} />

      {/* Central Water Fountain Plaza */}
      <WaterFountainPlaza />

      {/* Checkerboard Paved Quad Plaza & Lawn */}
      <CampusQuadPlaza />

      {/* Clustered 3D Campus Toon Trees */}
      <ToonBushyTree position={[-12.5, 0, -8.0]} scale={1.25} />
      <ToonBushyTree position={[12.5, 0, -8.0]} scale={1.25} />
      <ToonBushyTree position={[-12.5, 0, -1.0]} scale={1.15} />
      <ToonBushyTree position={[12.5, 0, -1.0]} scale={1.15} />
      <ToonBushyTree position={[-12.5, 0, 6.0]} scale={1.1} />
      <ToonBushyTree position={[12.5, 0, 6.0]} scale={1.1} />

      {/* 3D Campus Street Lamps (Positioned safely away from tile track) */}
      <ToonStreetLamp position={[-2.5, 0, -0.4]} />
      <ToonStreetLamp position={[2.5, 0, -0.4]} />
      <ToonStreetLamp position={[-2.5, 0, 3.4]} />
      <ToonStreetLamp position={[2.5, 0, 3.4]} />
      <ToonStreetLamp position={[-6.2, 0, -5.0]} />
      <ToonStreetLamp position={[6.2, 0, -5.0]} />
      <ToonStreetLamp position={[-6.2, 0, 7.0]} />
      <ToonStreetLamp position={[6.2, 0, 7.0]} />

      {/* 30 Monopoly Beveled Gem Dot Tiles */}
      {BOARD.map((t) => (
        <Tile key={t.index} index={t.index} type={t.type} />
      ))}

      {/* Animated Player Character Pawn */}
      <Pawn />

      {/* Camera Rig View */}
      <CameraRig />
    </>
  )
}

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

class CanvasErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(error: unknown) {
    console.error('Board3D Canvas Error:', error)
  }
  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}

export default function Board3D() {
  const [failed, setFailed] = useState(() => !hasWebGL())
  useEffect(() => {
    const onLost = (e: Event) => {
      e.preventDefault()
      setFailed(true)
    }
    window.addEventListener('webglcontextlost', onLost)
    return () => window.removeEventListener('webglcontextlost', onLost)
  }, [])

  if (failed) return <Board2D />

  return (
    <CanvasErrorBoundary fallback={<Board2D />}>
      <Canvas
        dpr={[1, 2]}
        shadows={true}
        camera={{ position: [0, 14, 12], fov: 44 }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener('webglcontextlost', (e) => {
            e.preventDefault()
            setFailed(true)
          })
        }}
      >
        <Scene />
      </Canvas>
    </CanvasErrorBoundary>
  )
}
