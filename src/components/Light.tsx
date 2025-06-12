import { type IUI, Leafer, Rect } from 'leafer'
import { useEffect, useRef } from 'react'

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

		const leafer = new Leafer({
			view: containerRef.current,
			fill: '#ffffff',
		})

		const draw: (app: Leafer) => void = (app) => {
			app.clear()
			const w = app.width
			const h = app.height
			if (!w || !h) {
				return
			}
			const items: IUI[] = []
			const widthStep = (w - w * minShapeWidth) / (shapeCount - 1) / 2
			const heightStep = (h - h * minShapeHeight) / (shapeCount - 1) / 2
			for (let i = 1; i <= shapeCount; i++) {
				const x = (i - 1) * widthStep
				const y = (i - 1) * heightStep
				const rect = new Rect({
					x,
					y,
					width: w - 2 * x,
					height: h - 2 * y,
					fill: shapeColor,
					opacity: shapeOpacity,
				})
				items.push(rect)
			}
			app.add(items)
		}

		leafer.on('resize', () => {
			draw(leafer)
		})
		draw(leafer)

		return () => {
			leafer.destroy()
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
