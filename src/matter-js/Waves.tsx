import { Bodies, Body, Engine, Render, Runner, World } from 'matter-js'
import { useEffect, useMemo, useRef } from 'react'
import { debounce } from '../lib/utils'

type WavesProps = {
	/** radius of the particles in px, default: 8 */
	particleRadius?: number
	particleColor?: string
	/** space between particles in px, default: 1 */
	particleRandomSpace?: number
	/** max height for initial position of the particles, 0 - 1 (relative to the height of the container), default: 0.6 */
	particleMaxY?: number
	maxParticles?: number
	/** max height of the sand, 0 - 1 (relative to the height of the container), default: 1 */
	sandMaxHeight?: number
	sandColor?: string
	/** period of the wave animation, in seconds, default: 5 */
	wavePeriod?: number
}

export function Waves({
	particleRadius = 4,
	particleColor = 'rgb(110,170,255)',
	particleRandomSpace = 1,
	particleMaxY = 0.6,
	maxParticles = 1000,
	sandMaxHeight = 1,
	sandColor = 'rgb(250,230,200)',
	wavePeriod = 5,
}: WavesProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const engineRef = useRef<Engine | null>(null)
	const renderRef = useRef<Render | null>(null)
	const runnerRef = useRef<Runner | null>(null)
	const timersRef = useRef<number[]>([])
	const cleanup = useMemo(
		() => () => {
			if (timersRef.current.length > 0) {
				for (const timer of timersRef.current) {
					clearTimeout(timer)
				}
				timersRef.current = []
			}
			if (runnerRef.current) {
				Runner.stop(runnerRef.current)
				runnerRef.current = null
			}
			if (renderRef.current) {
				Render.stop(renderRef.current)
				renderRef.current.canvas.remove()
				renderRef.current = null
			}
			if (engineRef.current) {
				World.clear(engineRef.current.world, false)
				Engine.clear(engineRef.current)
				engineRef.current = null
			}
		},
		[],
	)

	useEffect(() => {
		if (!containerRef.current) {
			return
		}
		const setup = () => {
			if (!containerRef.current) return

			cleanup()

			const engine = Engine.create()
			engineRef.current = engine
			engine.gravity.y = 0

			const container = containerRef.current
			const w = container.clientWidth
			const h = container.clientHeight

			const render = Render.create({
				element: container,
				engine: engine,
				options: {
					width: w,
					height: h,
					wireframes: false,
					background: 'transparent',
					pixelRatio: window.devicePixelRatio,
				},
			})
			renderRef.current = render

			const sand = Bodies.rectangle(
				w / 2,
				h * (1 - sandMaxHeight + sandMaxHeight / 2),
				w,
				h * sandMaxHeight,
				{
					isStatic: true,
					isSensor: true,
					render: { fillStyle: sandColor },
				},
			)

			const OFFSET_Y_SPACE = 0.4 * h
			const OFFSET_X_SPACE = 0.2 * w

			const left = Bodies.rectangle(
				0 - OFFSET_X_SPACE,
				h / 2,
				particleRadius * 2,
				h * 2,
				{
					isStatic: true,
					render: { fillStyle: 'transparent' },
				},
			)
			const right = Bodies.rectangle(
				w + OFFSET_X_SPACE,
				h / 2,
				particleRadius * 2,
				h * 2,
				{
					isStatic: true,
					render: { fillStyle: 'transparent' },
				},
			)

			const particles: Body[] = []
			const minX = particleRadius * 3 - OFFSET_X_SPACE
			const maxX = w - particleRadius * 3 + OFFSET_X_SPACE
			const minY = particleRadius * 3 - OFFSET_Y_SPACE
			const maxY = h * particleMaxY - particleRadius * 3
			const countPerRow = Math.floor(
				(maxX - minX) / ((particleRadius + particleRandomSpace) * 2),
			)
			const countPerCol = Math.floor(
				(maxY - minY) / ((particleRadius + particleRandomSpace) * 2),
			)
			for (let i = 1; i <= countPerRow; i++) {
				for (let j = 1; j <= countPerCol; j++) {
					if (particles.length >= maxParticles) {
						break
					}
					const x =
						minX +
						i * (particleRadius + particleRandomSpace) * 2 +
						(Math.random() - 0.5) * particleRandomSpace * 2
					const y =
						minY +
						j * (particleRadius + particleRandomSpace) * 2 +
						(Math.random() - 0.5) * particleRandomSpace * 2
					const particle = Bodies.circle(x, y - 0.3 * h, particleRadius, {
						density: 0.03 + Math.random() * 0.12,
						restitution: 0.5,
						friction: 0.1 + Math.random() * 0.1,
						render: { fillStyle: particleColor },
					})
					particles.push(particle)
				}
			}

			const UPDATE_TIMES_PER_PERIOD = 100
			const interval = (wavePeriod * 1000) / UPDATE_TIMES_PER_PERIOD
			let step = 0
			timersRef.current.push(
				setInterval(() => {
					const gravity = Math.sin(step * Math.PI * 2) * (Math.sqrt(h) / 200)
					engine.gravity.y = gravity
					step = (step + 1 / UPDATE_TIMES_PER_PERIOD) % 1
				}, interval),
			)
			timersRef.current.push(
				setInterval(() => {
					const particle =
						particles[Math.floor(Math.random() * particles.length)]
					const force = {
						x: (Math.random() - 0.5) * 0.005,
						y: (Math.random() - 0.5) * 0.005,
					}
					Body.applyForce(particle, particle.position, force)
				}, 50),
			)

			World.add(engine.world, [sand, left, right, ...particles])
			Render.run(render)
			const runner = Runner.create()
			runnerRef.current = runner
			Runner.run(runner, engine)
		}

		setup()

		const debouncedSetup = debounce(setup, 200)
		window.addEventListener('resize', debouncedSetup)

		return () => {
			window.removeEventListener('resize', debouncedSetup)
			cleanup()
		}
	}, [
		cleanup,
		sandColor,
		sandMaxHeight,
		particleColor,
		particleRadius,
		particleRandomSpace,
		particleMaxY,
		wavePeriod,
		maxParticles,
	])

	return (
		<div
			ref={containerRef}
			style={{
				position: 'absolute',
				top: 0,
				left: 0,
				width: '100%',
				height: '100%',
			}}
		/>
	)
}
