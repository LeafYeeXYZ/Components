import { Canvas, CanvasEvent, Group, Path, Rect } from '@antv/g'
import { Renderer } from '@antv/g-canvas'
import { useEffect, useRef } from 'react'
import { debounce } from '../lib/utils'

const renderer = new Renderer()

function generateWave(y: number, w: number, h: number, offset: number): string {
	let path = `M 0 -${offset} L 0 ${y}`
	const segments = 12
	const segmentWidth = w / segments
	for (let i = 0; i <= segments; i++) {
		const x = i * segmentWidth
		const randomOffset = (Math.random() - 0.5) * h * 0.8
		const currentY = y + randomOffset
		if (i === 0) {
			const startOffset = (Math.random() - 0.5) * h * 0.4
			path += ` L ${x} ${y + startOffset}`
		} else if (i === segments) {
			const endControlY = y + (Math.random() - 0.5) * h * 0.7
			path += ` Q ${x - segmentWidth * 0.5} ${endControlY} ${x} ${currentY}`
			path += ` L ${w} -${offset} Z`
		} else {
			const controlX1 = x - segmentWidth * (0.2 + Math.random() * 0.4)
			const controlY1 = y + (Math.random() - 0.5) * h * 1.2
			const controlX2 = x - segmentWidth * (0.5 + Math.random() * 0.4)
			const controlY2 = y + (Math.random() - 0.5) * h * 1.0
			path += ` C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${x} ${currentY}`
		}
	}
	return path
}

type WavesProps = {
	/** the number of layers of the wave, default: 4 */
	waveLayers?: number
	/** the distance between each layer, 0 - 1 (relative to the height of the container), default: 0.08 */
	waveLayerDistance?: number
	/** max depth of each wave in one direction, 0 - 1 (relative to the height of the container), default: 0.03 */
	waveLayerDepth?: number
	waveLayerColor?: string
	/** opacity of the wave, default: 0.25 */
	waveLayerOpacity?: number
	/** max height of the waves, 0 - 1 (relative to the height of the container), default: 0.7 */
	wavesMaxHeight?: number
	/** max height of the sand, 0 - 1 (relative to the height of the container), default: 1 */
	sandMaxHeight?: number
	sandColor?: string
	/** depth (highest to lowest) of the animation, 0 - 1 (relative to the height of the container), default: 0.065 */
	animationDepth?: number
	/** period of the wave animation, in seconds, default: 3.5 */
	animationPeriod?: number
}

export function Waves({
	waveLayers = 5,
	waveLayerDistance = 0.075,
	waveLayerDepth = 0.03,
	waveLayerColor = 'rgb(110,170,255)',
	waveLayerOpacity = 0.25,
	wavesMaxHeight = 0.7,
	sandMaxHeight = 1,
	sandColor = 'linear-gradient(90deg, rgb(255,255,255), rgb(255,255,255), rgb(255,200,120))',
	animationDepth = 0.065,
	animationPeriod = 3.5,
}: WavesProps) {
	const containerRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<Canvas | null>(null)
	useEffect(() => {
		if (!containerRef.current) {
			return
		}

		const draw = () => {
			if (!containerRef.current) {
				return
			}
			if (canvasRef.current) {
				canvasRef.current.destroy()
			}
			const canvas = new Canvas({
				container: containerRef.current,
				renderer,
				width: 0,
				height: 0,
			})
			canvasRef.current = canvas
			const w = containerRef.current.clientWidth
			const h = containerRef.current.clientHeight
			canvas.resize(w, h)

			const sand = new Rect({
				style: {
					x: 0,
					y: (1 - sandMaxHeight) * h,
					fill: sandColor,
					width: w,
					height: sandMaxHeight * h,
				},
			})
			const waves = new Group()
			for (let i = 1; i <= waveLayers; i++) {
				const waveY =
					h *
					(wavesMaxHeight - waveLayerDistance - (i - 1) * 2 * waveLayerDistance)
				const waveH = 2 * waveLayerDepth * h
				const wave = new Path({
					style: {
						d: generateWave(waveY, w, waveH, h * animationDepth),
						fill: waveLayerColor,
						opacity: waveLayerOpacity,
					},
				})
				waves.appendChild(wave)
				let timer = Date.now()
				let position = 0
				let offset = 0
				canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
					const now = Date.now()
					const elapsed = (now - timer) / 1000
					timer = now
					if (elapsed > 1) {
						return
					}
					position = (position + elapsed / animationPeriod) % 1
					const newOffset =
						Math.sin(position * 2 * Math.PI) * animationDepth * h
					const change = (newOffset - offset) * ((waveLayers - i) / waveLayers)
					wave.translateLocal(0, change)
					offset = newOffset
					// TODO: 根据时间等条件定时改变海浪的曲线形状
					// TODO: 优化沙滩的显示效果
					// TODO: 为浪花增加粒子特效
				})
			}
			canvas.ready.then(() => {
				canvas.appendChild(sand)
				canvas.appendChild(waves)
			})
		}

		draw()

		const debouncedDraw = debounce(draw)
		window.addEventListener('resize', debouncedDraw)
		return () => {
			window.removeEventListener('resize', debouncedDraw)
			if (canvasRef.current) {
				canvasRef.current.destroy()
				canvasRef.current = null
			}
		}
	}, [
		waveLayerColor,
		waveLayers,
		waveLayerOpacity,
		waveLayerDistance,
		waveLayerDepth,
		wavesMaxHeight,
		sandMaxHeight,
		sandColor,
		animationDepth,
		animationPeriod,
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
