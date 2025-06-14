import {
	Bodies,
	Engine,
	type IBodyRenderOptions,
	Render,
	Runner,
	World,
} from 'matter-js'
import { useEffect, useMemo, useRef } from 'react'
import { debounce, randomRed } from '../lib/utils'

type BallsProps = {
	/** if space is not enough, some balls may not be rendered, default: 15 */
	ballsCount?: number
	/** 0 - 1 means relative to the shorter one of container width and height, >= 1 means absolute pixel value, default: 0.08 */
	ballsRadius?: number
	/** density (密度) of the balls, default: 0.1 (kg/m^2) */
	ballsDensity?: number
	/** restitution (弹力系数) of the balls, default: 0.6 */
	ballsRestitution?: number
	/** air friction (空气阻力) of the balls, default: 0.01 */
	ballsAirFriction?: number
	/** 0 - 1 means relative to the container height, >= 1 means absolute pixel value, default: 0.6 */
	maxInitialPositionY?: number
	/** max iterations for trying to position a ball, default: 100 */
	maxIterationsForPositioning?: number
	/** minimum distance from the walls, default: 15 */
	safeZone?: number
	/** style options of balls */
	ballsStyleOptions?: (ballIndex: number) => IBodyRenderOptions
}

export function Balls({
	ballsCount = 15,
	ballsRadius = 0.08,
	ballsDensity = 0.1,
	ballsRestitution = 0.6,
	ballsAirFriction = 0.01,
	maxInitialPositionY = 0.6,
	maxIterationsForPositioning = 100,
	safeZone = 15,
	ballsStyleOptions = () => ({
		fillStyle: randomRed(),
		opacity: 0.8 - (Math.random() - 0.5) * 0.2,
	}),
}: BallsProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const engineRef = useRef<Engine | null>(null)
	const renderRef = useRef<Render | null>(null)
	const runnerRef = useRef<Runner | null>(null)
	const cleanup = useMemo(
		() => () => {
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

			const container = containerRef.current
			const w = container.clientWidth
			const h = container.clientHeight
			const min = Math.min(w, h)

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

			const ground = Bodies.rectangle(w / 2, h, w, safeZone, {
				isStatic: true,
				render: { fillStyle: 'transparant' },
			})
			const leftWall = Bodies.rectangle(0, h / 2, safeZone, h, {
				isStatic: true,
				render: { fillStyle: 'transparent' },
			})
			const rightWall = Bodies.rectangle(w, h / 2, safeZone, h, {
				isStatic: true,
				render: { fillStyle: 'transparent' },
			})
			const ceiling = Bodies.rectangle(w / 2, 0, w, safeZone, {
				isStatic: true,
				render: { fillStyle: 'transparent' },
			})

			const radius = ballsRadius >= 1 ? ballsRadius : min * ballsRadius
			const minX = Math.max(radius + safeZone, 0)
			const maxX = Math.min(w - radius - safeZone, w)
			const minY = Math.max(radius + safeZone, 0)
			const maxY = Math.min(
				maxInitialPositionY >= 1
					? maxInitialPositionY
					: h * maxInitialPositionY - radius - safeZone,
				h,
			)

			const ballsInitialPositions: [number, number][] = []
			for (let i = 0; i < ballsCount; i++) {
				let j = 0
				while (j < maxIterationsForPositioning) {
					const x = Math.random() * (maxX - minX) + minX
					const y = Math.random() * (maxY - minY) + minY
					const position: [number, number] = [x, y]
					if (
						!ballsInitialPositions.some((pos) => {
							const dx = pos[0] - x
							const dy = pos[1] - y
							return Math.sqrt(dx * dx + dy * dy) <= radius * 2
						})
					) {
						ballsInitialPositions.push(position)
						break
					}
					j++
				}
			}
			const balls = ballsInitialPositions.map((pos, index) => {
				return Bodies.circle(pos[0], pos[1], radius, {
					render: ballsStyleOptions(index),
					restitution: ballsRestitution,
					density: ballsDensity,
					frictionAir: ballsAirFriction,
				})
			})

			World.add(engine.world, [ground, leftWall, rightWall, ceiling, ...balls])
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
		ballsCount,
		ballsRadius,
		maxIterationsForPositioning,
		maxInitialPositionY,
		cleanup,
		safeZone,
		ballsDensity,
		ballsRestitution,
		ballsAirFriction,
		ballsStyleOptions,
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
