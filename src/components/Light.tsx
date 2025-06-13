import { Canvas, Rect } from '@antv/g'
import { useEffect, useRef } from 'react'
import { renderer } from '../lib/antv'
import { debounce } from '../lib/utils'

type LightProps = {
	/** default: rgb(255,0,20) */
	shapeColor?: `rgb(${number},${number},${number})`
	/** default: 10 */
	shapeCount?: number
	/** 0 - 1, default: 0.2 */
	minShapeWidth?: number
	/** 0 - 1, default: 0.2 */
	minShapeHeight?: number
	/** 0 - 1, default: 1 / shapeCount */
	shapeOpacity?: number
}

export function Light({
	shapeColor = 'rgb(255,0,20)',
	shapeCount = 10,
	minShapeWidth = 0.2,
	minShapeHeight = 0.2,
	shapeOpacity = 1 / shapeCount,
}: LightProps) {
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
			canvas.resize(
				containerRef.current.clientWidth,
				containerRef.current.clientHeight,
			)
			canvas.destroyChildren()
			const w = containerRef.current.clientWidth
			const h = containerRef.current.clientHeight
			const items: Rect[] = []
			const widthStep = (w - w * minShapeWidth) / (shapeCount - 1) / 2
			const heightStep = (h - h * minShapeHeight) / (shapeCount - 1) / 2
			for (let i = 1; i <= shapeCount; i++) {
				const x = (i - 1) * widthStep
				const y = (i - 1) * heightStep
				const rect = new Rect({
					style: {
						x,
						y,
						width: w - 2 * x,
						height: h - 2 * y,
						fill: shapeColor,
						opacity: shapeOpacity,
					},
				})
				items.push(rect)
			}
			canvas.ready.then(() => {
				for (const item of items) {
					canvas.appendChild(item)
				}
			})
		}

		draw()

		const debouncedDraw = debounce(draw)
		window.addEventListener('resize', debouncedDraw)
		return () => {
			window.removeEventListener('resize', debouncedDraw)
			canvas.destroy()
		}
	}, [shapeColor, shapeCount, shapeOpacity, minShapeWidth, minShapeHeight])

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
