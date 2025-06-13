import { Canvas, Text } from '@antv/g'
import { useEffect, useRef } from 'react'
import { renderer } from '../lib/antv'
import { debounce } from '../lib/utils'

type BallsProps = {
	ballsCount?: number
}

export function Balls({
	ballsCount = 10,
}: BallsProps) {
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
			
      canvas.appendChild(
        new Text({
          style: {
            x: w / 2,
            y: h / 2,
            text: 'Under Construction',
            fontSize: 24,
            fill: '#000',
            textAlign: 'center',
            textBaseline: 'middle',
          },
        }),
      )
		}

		draw()

		const debouncedDraw = debounce(draw)
		window.addEventListener('resize', debouncedDraw)
		return () => {
			window.removeEventListener('resize', debouncedDraw)
			canvas.destroy()
		}
	}, [])

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
