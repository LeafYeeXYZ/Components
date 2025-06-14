import { Canvas, CanvasEvent, Circle, Group } from '@antv/g'
import { Renderer } from '@antv/g-canvas'
import { useEffect, useRef } from 'react'
import { debounce, randomRed } from '../lib/utils'

const renderer = new Renderer()

type PlanetsProps = {
	/** 0 - 1 means relative to the shorter one of container width and height, >= 1 means absolute pixel value, default: 0.1 */
	centerPlanetRadius?: number
	centerPlanetColor?: string
	/** 0 - 1 means relative to the shorter one of container width and height, >= 1 means absolute pixel value, default: 0.06 */
	subPlanetOrbitDistance?: number
	/** number of sub planets, default: 4 */
	subPlanetCount?: number
	/** 0 - 1 means relative to the shorter one of container width and height, >= 1 means absolute pixel value, default: 0.02 */
	subPlanetRadius?: number
	subPlanetColor?: string | ((subPlanetIndex: number) => string)
	/** degrees per second (0 - 360), default: random */
	subPlanetOrbitSpeed?: number | ((subPlanetIndex: number) => number)
	subPlanetOrbitDirection?: 'clockwise' | 'counterclockwise'
	/** wheather to draw the orbit, default: true */
	subPlanetOrbit?: boolean
	subPlanetOrbitColor?: string | ((subPlanetIndex: number) => string)
	/** pixel width of the orbit, default: 1 */
	subPlanetOrbitLineWidth?: number
	/** line dash of the orbit, default: [2, 2] */
	subPlanetOrbitLineDash?: [number, number]
}

export function Planets({
	centerPlanetRadius = 0.1,
	centerPlanetColor = randomRed(),
	subPlanetOrbitDistance = 0.06,
	subPlanetCount = 4,
	subPlanetRadius = 0.02,
	subPlanetColor = () => randomRed(),
	subPlanetOrbitSpeed = () => +(60 + Math.random() * 60).toFixed(0),
	subPlanetOrbitDirection = 'clockwise',
	subPlanetOrbit = true,
	subPlanetOrbitColor = 'rgba(64,0,0,0.3)',
	subPlanetOrbitLineWidth = 1,
	subPlanetOrbitLineDash = [2, 2],
}: PlanetsProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	useEffect(() => {
		if (!containerRef.current) {
			return
		}

		const canvas = new Canvas({
			container: containerRef.current,
			renderer,
			width: 0,
			height: 0,
		})

		const draw = () => {
			if (!containerRef.current) {
				return
			}
			const w = containerRef.current.clientWidth
			const h = containerRef.current.clientHeight
			canvas.resize(w, h)
			canvas.destroyChildren()
			const min = Math.min(w, h)
			const centerX = w / 2
			const centerY = h / 2
			const centerR =
				centerPlanetRadius >= 1 ? centerPlanetRadius : centerPlanetRadius * min
			const system = new Group()
			const centerPlanet = new Circle({
				style: {
					cx: 0,
					cy: 0,
					r: centerR,
					fill: centerPlanetColor,
				},
			})
			system.appendChild(centerPlanet)
			const subPlanetOrbitDistancePx =
				subPlanetOrbitDistance >= 1
					? subPlanetOrbitDistance
					: subPlanetOrbitDistance * min
			const subPlanetRadiusPx =
				subPlanetRadius >= 1 ? subPlanetRadius : subPlanetRadius * min
			for (let i = 1; i <= subPlanetCount; i++) {
				const subSystem = new Group()
				const orbitRadius = centerR + i * subPlanetOrbitDistancePx
				if (subPlanetOrbit) {
					const orbit = new Circle({
						style: {
							cx: 0,
							cy: 0,
							r: orbitRadius,
							fill: 'transparent',
							stroke:
								typeof subPlanetOrbitColor === 'function'
									? subPlanetOrbitColor(i)
									: subPlanetOrbitColor,
							lineWidth: subPlanetOrbitLineWidth,
							lineDash: subPlanetOrbitLineDash,
						},
					})
					subSystem.appendChild(orbit)
				}
				const subPlanet = new Circle({
					style: {
						cx: orbitRadius,
						cy: 0,
						r: subPlanetRadiusPx,
						fill:
							typeof subPlanetColor === 'function'
								? subPlanetColor(i)
								: subPlanetColor,
					},
				})
				subSystem.appendChild(subPlanet)
				system.appendChild(subSystem)
				let timer = Date.now()
				const speed =
					typeof subPlanetOrbitSpeed === 'function'
						? subPlanetOrbitSpeed(i)
						: subPlanetOrbitSpeed
				canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
					const elapsed = (Date.now() - timer) / 1000
					timer = Date.now()
					if (elapsed > 1000) {
						return
					}
					const angleToRotate = (speed * elapsed) % 360
					subPlanet.rotateLocal(
						subPlanetOrbitDirection === 'clockwise'
							? angleToRotate
							: -angleToRotate,
					)
				})
			}
			canvas.ready.then(() => {
				canvas.appendChild(system)
				system.setPosition(centerX, centerY)
			})
		}

		draw()

		const debouncedDraw = debounce(draw)
		window.addEventListener('resize', debouncedDraw)
		return () => {
			window.removeEventListener('resize', debouncedDraw)
			canvas.destroy()
		}
	}, [
		centerPlanetRadius,
		centerPlanetColor,
		subPlanetOrbitDistance,
		subPlanetCount,
		subPlanetRadius,
		subPlanetColor,
		subPlanetOrbitSpeed,
		subPlanetOrbitDirection,
		subPlanetOrbit,
		subPlanetOrbitColor,
		subPlanetOrbitLineWidth,
		subPlanetOrbitLineDash,
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
