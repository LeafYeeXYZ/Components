import { Canvas, type ThreeElements, useFrame } from '@react-three/fiber'
import { useRef, useState } from 'react'
import type * as THREE from 'three'

export function City() {
	return (
		<div
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
			}}
		>
			<Canvas>
				<ambientLight intensity={Math.PI / 2} />
				<spotLight
					position={[10, 10, 10]}
					angle={0.15}
					penumbra={1}
					decay={0}
					intensity={Math.PI}
				/>
				<pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
				<Box position={[-1.2, 0, 0]} />
				<Box position={[1.2, 0, 0]} />
			</Canvas>
		</div>
	)
}

function Box(props: ThreeElements['mesh']) {
	const meshRef = useRef<THREE.Mesh>(null)
	const [hovered, setHover] = useState(false)
	const [active, setActive] = useState(false)
	useFrame((_, delta) => {
		if (meshRef.current) {
			meshRef.current.rotation.x += delta
			meshRef.current.rotation.y += delta
		}
	})
	return (
		<mesh
			{...props}
			ref={meshRef}
			scale={active ? 1.5 : 1}
			onClick={(_) => setActive(!active)}
			onPointerOver={(_) => setHover(true)}
			onPointerOut={(_) => setHover(false)}
		>
			<boxGeometry args={[1, 1, 1]} />
			<meshStandardMaterial color={hovered ? 'hotpink' : '#2f74c0'} />
		</mesh>
	)
}
