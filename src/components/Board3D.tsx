import { Canvas, useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import { Component, ReactNode, useMemo, useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { BOARD } from '../data/characters'
import { TileType } from '../data/types'
import { useGameStore } from '../store/game'
import { assetUrl } from '../lib/format'
import Board2D from './Board2D'

// ============================================================================
// 1. 30 EVENLY SPACED TILE POSITIONS ALONG CLEAN GARDEN LOOP (CLEARANCE FROM FOUNTAIN)
// ============================================================================
const TRACK_CONTROL_POINTS = [
  new THREE.Vector3(0, 0, 7.8),       // Tile 1: Start (Bottom center entrance between plaques)
  new THREE.Vector3(2.6, 0, 7.2),     // Lower right curve
  new THREE.Vector3(4.5, 0, 5.8),     // Lower right outer
  new THREE.Vector3(4.8, 0, 3.8),     // Mid right outer
  new THREE.Vector3(3.6, 0, 1.8),     // Upper right outer
  new THREE.Vector3(1.8, 0, 0.8),     // Fountain front right
  new THREE.Vector3(0, 0, 0.5),      // Topmost center of track (Z = 0.5)
  new THREE.Vector3(-1.8, 0, 0.8),    // Fountain front left
  new THREE.Vector3(-3.6, 0, 1.8),    // Upper left outer
  new THREE.Vector3(-4.8, 0, 3.8),    // Mid left outer
  new THREE.Vector3(-4.5, 0, 5.8),    // Lower left outer
  new THREE.Vector3(-2.6, 0, 7.2),    // Lower left curve
]

const trackSpline = new THREE.CatmullRomCurve3(TRACK_CONTROL_POINTS, true, 'centripetal', 0.5)
const trackPoints3D = trackSpline.getSpacedPoints(29)

export function tileWorldPos(n: number): THREE.Vector3 {
  const index = Math.max(0, Math.min(29, (n - 1) % 30))
  return trackPoints3D[index] || new THREE.Vector3(0, 0, 0)
}

// ============================================================================
// 2. CANVAS TEXTURE GENERATOR FOR ENGRAVED STONE PLAQUES & BANNERS
// ============================================================================
function createTextTexture(lines: string[], bgColor: string, textColor: string, width = 512, height = 512, fontSize = 38): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, width, height)

    // Decorative inner border
    ctx.strokeStyle = textColor
    ctx.lineWidth = 12
    ctx.strokeRect(18, 18, width - 36, height - 36)

    ctx.fillStyle = textColor
    ctx.font = `bold ${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    const totalHeight = lines.length * (fontSize * 1.3)
    let startY = (height - totalHeight) / 2 + fontSize / 2

    lines.forEach((line) => {
      ctx.fillText(line, width / 2, startY)
      startY += fontSize * 1.3
    })
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

// ============================================================================
// 3. FLOATING GAJIAN SPOILER ICON (Cash Bill 💵)
// ============================================================================
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
      meshRef.current.position.set(0, 0.75 + Math.sin(t * 3.0) * 0.08, 0)
      meshRef.current.rotation.y = t * 1.2
      meshRef.current.scale.set(1, 1, 1)
    } else if (animProgress.current < 1) {
      animProgress.current = Math.min(1, animProgress.current + dt / 0.35)
      const p = animProgress.current
      const scale = Math.max(0, 1.0 - p)
      meshRef.current.position.y = 0.75 + p * 0.8
      meshRef.current.rotation.y += dt * 10
      meshRef.current.scale.set(scale, scale, scale)
    } else {
      meshRef.current.scale.set(0, 0, 0)
    }
  })

  if (type !== 'gajian') return null

  return (
    <group ref={meshRef} position={[0, 0.75, 0]}>
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

// ============================================================================
// 4. GOLDEN AMBER DOME TILE (Glossy Dome Button on Stone Pedestal)
// ============================================================================
function Tile({ index, type }: { index: number; type: string }) {
  const pos = tileWorldPos(index)
  const isCurrent = useGameStore((s) => s.session?.position === index)
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      const s = 1 + 0.15 * Math.sin(state.clock.elapsedTime * 4.5)
      ringRef.current.scale.setScalar(s)
    }
  })

  const isGajian = type === 'gajian'
  const isRisk = type === 'kesempatan' || type === 'risiko'

  const domeColor = isGajian ? '#10B981' : isRisk ? '#F43F5E' : '#F59E0B'
  const emissiveColor = isGajian ? '#059669' : isRisk ? '#E11D48' : '#D97706'

  return (
    <group position={[pos.x, 0, pos.z]}>
      {/* Stone Pedestal Base */}
      <mesh position={[0, 0.08, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.50, 0.54, 0.10, 24]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} metalness={0.1} />
      </mesh>

      {/* Gold Rim Ring */}
      <mesh position={[0, 0.14, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.44, 0.47, 0.06, 24]} />
        <meshStandardMaterial color="#FBBF24" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Glossy Dome Button Body */}
      <mesh position={[0, 0.20, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.36, 0.42, 0.12, 24]} />
        <meshStandardMaterial
          color={domeColor}
          emissive={emissiveColor}
          emissiveIntensity={0.4}
          roughness={0.15}
          metalness={0.4}
        />
      </mesh>

      {/* Glossy Top Reflection Disk */}
      <mesh position={[0, 0.265, 0]}>
        <cylinderGeometry args={[0.30, 0.30, 0.02, 24]} />
        <meshStandardMaterial color="#FEF3C7" roughness={0.1} opacity={0.8} transparent />
      </mesh>

      {/* Floating 3D Money Icon above Gajian tile */}
      <TileSpoilerIcon index={index} type={type as TileType} />

      {/* Pulsating Current Tile Ring */}
      {isCurrent && (
        <mesh ref={ringRef} position={[0, 0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.56, 0.06, 12, 32]} />
          <meshStandardMaterial color="#F59E0B" emissive="#FACC15" emissiveIntensity={1.5} />
        </mesh>
      )}
    </group>
  )
}

// ============================================================================
// 5. WINDING COBBLESTONE PATHWAY & CURB BORDERS
// ============================================================================
function WindingCobblestonePath() {
  const { pavers, borders, borderFlowers } = useMemo(() => {
    const pList: Array<{ id: string; pos: [number, number, number]; rotY: number; color: string; scale: [number, number, number] }> = []
    const bList: Array<{ id: string; pos: [number, number, number]; rotY: number }> = []
    const fList: Array<{ id: string; pos: [number, number, number]; isDaisy: boolean; color?: string; scale: number }> = []

    const stoneColors = ['#E2E8F0', '#CBD5E1', '#F1F5F9', '#D4A373', '#E9D8A6']
    const flowerColors = ['#F472B6', '#FB923C', '#A855F7', '#38BDF8', '#FACC15']

    const steps = 80
    const points = trackSpline.getSpacedPoints(steps)

    for (let i = 0; i < steps; i++) {
      const p1 = points[i]
      const p2 = points[(i + 1) % steps]

      const dir = new THREE.Vector3().subVectors(p2, p1)
      dir.y = 0
      dir.normalize()

      const rotY = Math.atan2(dir.x, dir.z)
      const normal = new THREE.Vector3(-dir.z, 0, dir.x)

      // Cobblestone paver row
      ;[-0.38, 0, 0.38].forEach((offset, idx) => {
        const paverPos = p1.clone().addScaledVector(normal, offset)
        pList.push({
          id: `paver-${i}-${idx}`,
          pos: [paverPos.x + Math.sin(i * 3.7 + idx) * 0.03, 0.045, paverPos.z + Math.cos(i * 2.3) * 0.03],
          rotY: rotY + Math.sin(i + idx) * 0.1,
          color: stoneColors[(i * 3 + idx) % stoneColors.length],
          scale: [0.34, 0.03, 0.32],
        })
      })

      // Stone Curb Borders
      ;[-0.9, 0.9].forEach((offset, idx) => {
        const borderPos = p1.clone().addScaledVector(normal, offset)
        bList.push({
          id: `border-${i}-${idx}`,
          pos: [borderPos.x, 0.065, borderPos.z],
          rotY: rotY,
        })
      })

      // Floral Border Along Cobble Edges
      if (i % 2 === 0) {
        ;[-1.25, 1.25].forEach((offset, idx) => {
          const flowerPos = p1.clone().addScaledVector(normal, offset)
          const seed = i * 7 + idx
          fList.push({
            id: `path-flower-${i}-${idx}`,
            pos: [flowerPos.x + Math.sin(seed) * 0.08, 0.04, flowerPos.z + Math.cos(seed) * 0.08],
            isDaisy: seed % 2 === 0,
            color: flowerColors[seed % flowerColors.length],
            scale: 0.8 + (seed % 3) * 0.15,
          })
        })
      }
    }

    return { pavers: pList, borders: bList, borderFlowers: fList }
  }, [])

  return (
    <group>
      {pavers.map((p) => (
        <mesh key={p.id} position={p.pos} rotation={[0, p.rotY, 0]} receiveShadow>
          <boxGeometry args={p.scale} />
          <meshStandardMaterial color={p.color} roughness={0.4} polygonOffset polygonOffsetFactor={-1} polygonOffsetUnits={-1} />
        </mesh>
      ))}

      {borders.map((b) => (
        <mesh key={b.id} position={b.pos} rotation={[0, b.rotY, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.15, 0.04, 0.40]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.3} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-2} />
        </mesh>
      ))}

      {borderFlowers.map((f) =>
        f.isDaisy ? (
          <WhiteDaisyTuft key={f.id} position={f.pos} scale={f.scale} />
        ) : (
          <ToonFlowerPatch key={f.id} position={f.pos} color={f.color} />
        )
      )}
    </group>
  )
}

// ============================================================================
// 6. FOREGROUND STONE MONUMENT PLAQUES
// ============================================================================
function ForegroundStonePlaques() {
  const leftTexture = useMemo(
    () => createTextTexture(['GROW', 'LEARN ALONG', 'LIFE ♥'], '#E2E8F0', '#1E293B', 512, 512, 44),
    []
  )
  const rightTexture = useMemo(
    () => createTextTexture(['FINANCIAL', 'LITERACY', 'BRIGHTENS YOU ♥'], '#E2E8F0', '#1E293B', 512, 512, 38),
    []
  )

  return (
    <group>
      {/* Left Foreground Monument Plaque */}
      <group position={[-2.8, 0, 8.2]} rotation={[0, 0.35, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.4, 0.8]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 1.2, 0.35]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.98, 0.185]}>
          <planeGeometry args={[1.15, 1.05]} />
          <meshStandardMaterial map={leftTexture} roughness={0.2} />
        </mesh>
        <WhiteDaisyTuft position={[-0.6, 0.03, 0.4]} scale={0.9} />
        <WhiteDaisyTuft position={[0.6, 0.03, 0.3]} scale={0.85} />
      </group>

      {/* Right Foreground Monument Plaque */}
      <group position={[2.8, 0, 8.2]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.4, 0.8]} />
          <meshStandardMaterial color="#94A3B8" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 1.2, 0.35]} />
          <meshStandardMaterial color="#CBD5E1" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.98, 0.185]}>
          <planeGeometry args={[1.15, 1.05]} />
          <meshStandardMaterial map={rightTexture} roughness={0.2} />
        </mesh>
        <WhiteDaisyTuft position={[-0.6, 0.03, 0.3]} scale={0.85} />
        <WhiteDaisyTuft position={[0.6, 0.03, 0.4]} scale={0.9} />
      </group>
    </group>
  )
}

// ============================================================================
// 7. CENTRAL TIERED BLUE WATER FOUNTAIN (GLITCH-FREE WATER & SPRAY)
// ============================================================================
function WaterFountainPlaza() {
  const waterSprayRef = useRef<THREE.Group>(null)
  const sprayParticlesRef = useRef<THREE.Group>(null)

  const droplets = useMemo(() => {
    return Array.from({ length: 16 }, (_, i) => ({
      angle: (i * Math.PI * 2) / 16,
      speed: 1.5 + (i % 3) * 0.4,
      offsetY: (i % 4) * 0.1,
    }))
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (waterSprayRef.current) {
      waterSprayRef.current.position.y = 1.95 + Math.sin(t * 3.0) * 0.04
      waterSprayRef.current.scale.set(
        1.0 + Math.sin(t * 2.5) * 0.06,
        1.0 + Math.sin(t * 4.0) * 0.08,
        1.0 + Math.sin(t * 2.5) * 0.06
      )
    }

    if (sprayParticlesRef.current) {
      sprayParticlesRef.current.children.forEach((child, i) => {
        const d = droplets[i]
        const p = (t * d.speed + d.offsetY) % 1.0
        const radius = 0.1 + p * 0.55
        const y = 2.1 + Math.sin(p * Math.PI) * 0.4 - p * 0.6
        child.position.set(Math.cos(d.angle) * radius, y, Math.sin(d.angle) * radius)
        const scale = Math.max(0, (1.0 - p) * 0.08)
        child.scale.setScalar(scale)
      })
    }
  })

  return (
    <group position={[0, 0, -5.5]}>
      {/* Outer Plaza Stone Step Tier 1 */}
      <mesh position={[0, 0.10, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[2.4, 2.6, 0.20, 32]} />
        <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
      </mesh>

      {/* Fountain Base Outer Ring Bowl Tier 2 */}
      <mesh position={[0, 0.28, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[1.8, 1.6, 0.32, 32]} />
        <meshStandardMaterial color="#0284C7" roughness={0.25} />
      </mesh>

      {/* Main Outer Pool Water Surface (Cleanly inside bowl at Y = 0.38, depthWrite={false}) */}
      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[1.68, 1.68, 0.02, 32]} />
        <meshStandardMaterial
          color="#38BDF8"
          roughness={0.1}
          opacity={0.85}
          transparent
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Middle Tier Basin Column */}
      <mesh position={[0, 0.70, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.45, 0.52, 24]} />
        <meshStandardMaterial color="#0284C7" roughness={0.2} />
      </mesh>

      {/* Middle Tier Basin Bowl */}
      <mesh position={[0, 0.96, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.0, 0.35, 0.24, 24]} />
        <meshStandardMaterial color="#0369A1" roughness={0.2} />
      </mesh>

      {/* Middle Tier Basin Water Surface (Cleanly inside bowl at Y = 1.04, depthWrite={false}) */}
      <mesh position={[0, 1.04, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.02, 24]} />
        <meshStandardMaterial
          color="#7DD3FC"
          roughness={0.1}
          opacity={0.9}
          transparent
          depthWrite={false}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>

      {/* Top Fountain Pillar */}
      <mesh position={[0, 1.38, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.28, 0.6, 16]} />
        <meshStandardMaterial color="#0284C7" roughness={0.2} />
      </mesh>

      {/* Top Small Basin Bowl */}
      <mesh position={[0, 1.68, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.2, 0.18, 16]} />
        <meshStandardMaterial color="#0369A1" roughness={0.2} />
      </mesh>

      {/* Top Basin Water Surface */}
      <mesh position={[0, 1.74, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.02, 16]} />
        <meshStandardMaterial
          color="#BAE6FD"
          roughness={0.1}
          opacity={0.95}
          transparent
          depthWrite={false}
        />
      </mesh>

      {/* Central Water Spray Jet Column */}
      <group ref={waterSprayRef} position={[0, 1.95, 0]}>
        <mesh>
          <cylinderGeometry args={[0.12, 0.28, 0.55, 16]} />
          <meshStandardMaterial
            color="#BAE6FD"
            emissive="#38BDF8"
            emissiveIntensity={0.6}
            opacity={0.8}
            transparent
            depthWrite={false}
          />
        </mesh>
      </group>

      {/* Cascading Water Droplet Particles */}
      <group ref={sprayParticlesRef}>
        {droplets.map((_, i) => (
          <mesh key={`droplet-${i}`}>
            <sphereGeometry args={[1, 8, 8]} />
            <meshStandardMaterial color="#E0F2FE" emissive="#7DD3FC" emissiveIntensity={0.8} transparent opacity={0.85} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ============================================================================
// 8. GRAND CAMPUS BUILDINGS DIRECTLY BEHIND THE WATER FOUNTAIN
// ============================================================================
function CampusBackground() {
  const bannerLeftTexture = useMemo(
    () => createTextTexture(['Small Steps,', 'Big Future ♥'], '#0284C7', '#FFFFFF', 512, 512, 46),
    []
  )
  const bannerRightTexture = useMemo(
    () => createTextTexture(['Belajar Hari Ini,', 'Masa Depan', 'Lebih Bright ♥'], '#0284C7', '#FFFFFF', 512, 512, 38),
    []
  )

  return (
    <group position={[0, 0, -9.8]}>
      {/* GRAND CENTRAL RECTORATE HALL DIRECTLY BEHIND THE FOUNTAIN */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.2, 0.8]} receiveShadow castShadow>
          <boxGeometry args={[9.5, 0.4, 2.2]} />
          <meshStandardMaterial color="#E2E8F0" roughness={0.3} />
        </mesh>

        <mesh position={[0, 2.8, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[11.5, 4.8, 3.8]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.3} />
        </mesh>

        {[-4.2, -2.8, -1.4, 0, 1.4, 2.8, 4.2].map((x, i) => (
          <mesh key={`center-pillar-${i}`} position={[x, 2.6, 1.1]} castShadow receiveShadow>
            <cylinderGeometry args={[0.22, 0.28, 4.2, 16]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
        ))}

        {[-3.2, 0, 3.2].map((x, i) => (
          <mesh key={`center-win-${i}`} position={[x, 2.8, 1.32]}>
            <boxGeometry args={[1.6, 2.4, 0.05]} />
            <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={0.8} />
          </mesh>
        ))}

        <mesh position={[0, 5.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[12.2, 0.6, 4.2]} />
          <meshStandardMaterial color="#3B82F6" roughness={0.3} />
        </mesh>

        <mesh position={[0, 6.8, 1.1]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[2.8, 2.8, 0.4]} />
          <meshStandardMaterial color="#2563EB" roughness={0.3} />
        </mesh>

        <mesh position={[0, 7.2, -0.4]} castShadow receiveShadow>
          <boxGeometry args={[3.2, 2.2, 3.2]} />
          <meshStandardMaterial color="#F8FAFC" roughness={0.2} />
        </mesh>

        <mesh position={[0, 7.2, 1.22]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.7, 0.7, 0.06, 24]} />
          <meshStandardMaterial color="#FEF08A" emissive="#F59E0B" emissiveIntensity={0.9} />
        </mesh>
      </group>

      {/* LEFT CAMPUS WING BUILDING */}
      <group position={[-10.2, 0, -1.2]}>
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 6.4, 4.5]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.3} />
        </mesh>
        <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.4, 0.5, 4.8]} />
          <meshStandardMaterial color="#60A5FA" roughness={0.3} />
        </mesh>

        {[-2.2, 2.2].map((x, i) => (
          <mesh key={`win-l-${i}`} position={[x, 3.2, 2.27]}>
            <boxGeometry args={[1.5, 3.0, 0.04]} />
            <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={0.6} />
          </mesh>
        ))}

        <mesh position={[2.8, 3.8, 2.3]}>
          <planeGeometry args={[2.0, 3.8]} />
          <meshStandardMaterial map={bannerLeftTexture} roughness={0.2} />
        </mesh>
      </group>

      {/* RIGHT CAMPUS WING BUILDING */}
      <group position={[10.2, 0, -1.2]}>
        <mesh position={[0, 3.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.0, 6.4, 4.5]} />
          <meshStandardMaterial color="#FEF3C7" roughness={0.3} />
        </mesh>
        <mesh position={[0, 6.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[8.4, 0.5, 4.8]} />
          <meshStandardMaterial color="#60A5FA" roughness={0.3} />
        </mesh>

        {[-2.2, 2.2].map((x, i) => (
          <mesh key={`win-r-${i}`} position={[x, 3.2, 2.27]}>
            <boxGeometry args={[1.5, 3.0, 0.04]} />
            <meshStandardMaterial color="#FEF08A" emissive="#FDE047" emissiveIntensity={0.6} />
          </mesh>
        ))}

        <mesh position={[-2.8, 3.8, 2.3]}>
          <planeGeometry args={[2.0, 3.8]} />
          <meshStandardMaterial map={bannerRightTexture} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}

// ============================================================================
// 9. LUSH FLORAL & GRASS ENVIRONMENT (DAISIES, BUSHES, TREES)
// ============================================================================
function ToonGrassTuft({ position, scale = 1.0, rotY = 0 }: { position: [number, number, number]; scale?: number; rotY?: number }) {
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.2, 0]} rotation={[0.1, 0, 0.05]} castShadow>
        <coneGeometry args={[0.07, 0.42, 4]} />
        <meshStandardMaterial color="#4ADE80" roughness={0.4} flatShading />
      </mesh>
      <mesh position={[-0.07, 0.17, 0.03]} rotation={[-0.2, 0.7, -0.3]} castShadow>
        <coneGeometry args={[0.06, 0.36, 4]} />
        <meshStandardMaterial color="#22C55E" roughness={0.4} flatShading />
      </mesh>
      <mesh position={[0.08, 0.15, -0.04]} rotation={[0.25, -0.5, 0.25]} castShadow>
        <coneGeometry args={[0.06, 0.32, 4]} />
        <meshStandardMaterial color="#86EFAC" roughness={0.4} flatShading />
      </mesh>
    </group>
  )
}

function WhiteDaisyTuft({ position, scale = 1.0 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <ToonGrassTuft position={[0, 0, 0]} scale={0.75} />
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.012, 0.018, 0.32, 6]} />
        <meshStandardMaterial color="#16A34A" />
      </mesh>
      {[...Array(8)].map((_, i) => {
        const rad = (i * Math.PI) / 4
        return (
          <mesh
            key={`petal-${i}`}
            position={[Math.cos(rad) * 0.08, 0.36, Math.sin(rad) * 0.08]}
            rotation={[0.2 * Math.sin(rad), -rad, 0.1]}
          >
            <cylinderGeometry args={[0.025, 0.035, 0.008, 8]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.2} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.368, 0]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshStandardMaterial color="#FACC15" emissive="#F59E0B" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

function ToonFlowerPatch({ position, color = '#F472B6' }: { position: [number, number, number]; color?: string }) {
  return (
    <group position={position}>
      <ToonGrassTuft position={[0, 0, 0]} scale={0.8} />
      <mesh position={[0, 0.24, 0]}>
        <cylinderGeometry args={[0.015, 0.02, 0.38, 6]} />
        <meshStandardMaterial color="#22C55E" />
      </mesh>
      <mesh position={[0, 0.44, 0]}>
        <dodecahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial color={color} roughness={0.3} emissive={color} emissiveIntensity={0.2} />
      </mesh>
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#FACC15" />
      </mesh>
    </group>
  )
}

function ToonBushyTree({ position, scale = 1.0 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.22, 0.32, 1.6, 12]} />
        <meshStandardMaterial color="#78350F" roughness={0.7} />
      </mesh>
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
    </group>
  )
}

function GardenEnvironment() {
  const grassItems = useMemo(() => {
    const list: Array<{ id: string; pos: [number, number, number]; scale: number; rotY: number; isFlower: boolean; flowerColor?: string }> = []
    const flowerColors = ['#F472B6', '#FACC15', '#FB923C', '#A855F7', '#38BDF8', '#F44336']
    let count = 0

    for (let x = -13.5; x <= 13.5; x += 1.8) {
      for (let z = -7.5; z <= 8.5; z += 2.0) {
        count++
        const distFromCenter = Math.sqrt(x * x + z * z)
        if (distFromCenter < 1.8) continue

        const isFlower = count % 4 === 0
        list.push({
          id: `grass-env-${x}-${z}`,
          pos: [x + Math.sin(count) * 0.3, 0.015, z + Math.cos(count) * 0.3],
          scale: 0.85 + Math.abs(Math.sin(count)) * 0.35,
          rotY: count * 0.8,
          isFlower,
          flowerColor: flowerColors[count % flowerColors.length],
        })
      }
    }
    return list
  }, [])

  return (
    <group>
      {/* Ground Lawn Plane */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[45, 45]} />
        <meshStandardMaterial color="#4ADE80" roughness={0.5} />
      </mesh>

      {/* Flower and Grass Tufts */}
      {grassItems.map((g) =>
        g.isFlower ? (
          <ToonFlowerPatch key={g.id} position={g.pos} color={g.flowerColor} />
        ) : (
          <ToonGrassTuft key={g.id} position={g.pos} scale={g.scale} rotY={g.rotY} />
        )
      )}

      {/* Framing Toon Trees around Perimeter */}
      <ToonBushyTree position={[-8.5, 0, 6.5]} scale={1.2} />
      <ToonBushyTree position={[8.5, 0, 6.5]} scale={1.2} />
      <ToonBushyTree position={[-9.5, 0, 1.5]} scale={1.3} />
      <ToonBushyTree position={[9.5, 0, 1.5]} scale={1.3} />
      <ToonBushyTree position={[-7.5, 0, -4.5]} scale={1.1} />
      <ToonBushyTree position={[7.5, 0, -4.5]} scale={1.1} />
    </group>
  )
}

// ============================================================================
// 10. ANIMATED PLAYER PAWN & CAMERA RIG
// ============================================================================
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
    const idlePath = assetUrl(`/characters/${characterId}/${characterId}_6_full_body.png`)
    const walkPath = assetUrl(`/characters/${characterId}/${characterId}_7_walk.png`)

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

      const easeP = p * p * (3 - 2 * p)
      currentPos.current.x = THREE.MathUtils.lerp(startPos.current.x, target.x, easeP)
      currentPos.current.z = THREE.MathUtils.lerp(startPos.current.z, target.z, easeP)

      const yHop = Math.sin(p * Math.PI) * 0.55

      let scaleYFactor = 1.0 + Math.sin(p * Math.PI) * 0.25
      let scaleXFactor = 1.0 - Math.sin(p * Math.PI) * 0.12
      if (p > 0.85) {
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
      group.current.position.y = 0.22 + yHop

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

      group.current.position.y = 0.22 + yHop

      if (spriteMesh.current) {
        spriteMesh.current.rotation.z = stepSway
        spriteMesh.current.scale.set((facingRight ? 1.0 : -1.0) * scaleXFactor, scaleYFactor, 1.0)
      }
    }
  })

  const activeTexture = isMoving ? textures.walk || textures.idle : textures.idle || textures.walk

  return (
    <group ref={group} position={[target.x, 0.22, target.z]}>
      <Billboard follow={true} lockX={false} lockY={false} lockZ={false}>
        {activeTexture && (
          <mesh ref={spriteMesh} position={[0, 0.72, 0.22]}>
            <planeGeometry args={[1.25, 1.95]} />
            <meshBasicMaterial
              map={activeTexture}
              transparent={true}
              alphaTest={0.4}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </Billboard>
    </group>
  )
}

function CameraRig({ isPreview = false }: { isPreview?: boolean }) {
  const position = useGameStore((s) => s.session?.position ?? 1)
  const target = useMemo(() => tileWorldPos(position), [position])
  const look = useRef(new THREE.Vector3(target.x, 0.8, target.z))

  useFrame(({ camera, size }, dt) => {
    const isPortrait = size.width / size.height < 1.0

    let desiredPos: THREE.Vector3
    let desiredLook: THREE.Vector3

    if (isPreview) {
      // Zoomed in on character with framing of nearby garden scene
      desiredPos = new THREE.Vector3(
        target.x * 0.5,
        14.0,
        target.z * 0.35 + 11.2
      )
      desiredLook = new THREE.Vector3(
        target.x * 0.65,
        0.8,
        target.z * 0.5 + 0.4
      )
    } else {
      const xFollowFactor = isPortrait ? 0.75 : 0.55
      const zOffset = isPortrait ? 11.8 : 10.8
      const yHeight = isPortrait ? 13.5 : 12.0

      desiredPos = new THREE.Vector3(
        target.x * xFollowFactor,
        yHeight,
        target.z + zOffset
      )

      desiredLook = new THREE.Vector3(
        target.x * (isPortrait ? 0.85 : 0.7),
        0.8,
        target.z + 0.4
      )
    }

    const lerpSpeed = 1 - Math.exp(-6.0 * dt)
    camera.position.lerp(desiredPos, lerpSpeed)
    look.current.lerp(desiredLook, lerpSpeed)
    camera.lookAt(look.current)
  })

  return null
}

// ============================================================================
// 11. MAIN BOARD3D COMPONENT EXPORT
// ============================================================================
class Board3DErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() {
    return { hasError: true }
  }
  componentDidCatch(err: unknown) {
    console.error('Board3D 3D Canvas error:', err)
  }
  render() {
    if (this.state.hasError) {
      return <Board2D />
    }
    return this.props.children
  }
}

export default function Board3D({ isPreview = false }: { isPreview?: boolean }) {
  return (
    <Board3DErrorBoundary>
      <div className={`relative w-full h-full overflow-hidden select-none bg-gradient-to-b from-sky-300 via-sky-100 to-emerald-100 ${isPreview ? '' : 'min-h-[460px]'}`}>
        <Canvas
          shadows
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          camera={{ position: isPreview ? [0, 14.0, 11.5] : [0, 13.5, 12.5], fov: isPreview ? 45 : 42 }}
          gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
        >
          {/* Lighting */}
          <ambientLight intensity={1.15} />
          <directionalLight
            position={[10, 18, 12]}
            intensity={1.5}
            castShadow
            shadow-bias={-0.0003}
            shadow-normalBias={0.02}
            shadow-mapSize={[1024, 1024]}
            shadow-camera-near={0.5}
            shadow-camera-far={40}
            shadow-camera-left={-16}
            shadow-camera-right={16}
            shadow-camera-top={16}
            shadow-camera-bottom={-16}
          />
          <directionalLight position={[-8, 12, -10]} intensity={0.6} color="#BAE6FD" />

          {/* Camera Controller */}
          <CameraRig isPreview={isPreview} />

          {/* Scene Components */}
          <GardenEnvironment />
          <CampusBackground />
          <WaterFountainPlaza />
          <ForegroundStonePlaques />
          <WindingCobblestonePath />

          {/* 30 Golden Dome Tiles */}
          {BOARD.map((t, idx) => (
            <Tile key={`tile-${idx}`} index={idx + 1} type={t.type} />
          ))}

          {/* Player Pawn */}
          <Pawn />
        </Canvas>
      </div>
    </Board3DErrorBoundary>
  )
}
