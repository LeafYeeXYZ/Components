import { Canvas, Rect, Path } from '@antv/g'
import { Renderer } from '@antv/g-canvas'
import { useEffect, useRef } from 'react'
import { debounce } from '../lib/utils'

const renderer = new Renderer()

export function Waves() {
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
			const sand = new Rect({
				style: {
					x: 0,
					y: 0.4 * h,
					fill: 'linear-gradient(90deg, rgb(255,255,255), rgb(255,200,120))',
					width: w,
					height: 0.6 * h,
				},
			})
      const wave = new Path({
        style: {
          d: `
            M 0 0 
            L 0 ${0.6 * h} 
            Q ${w / 4} ${0.2 * h}, ${w / 2} ${0.6 * h} 
            T ${w} ${0.6 * h} 
            L ${w} 0 
            Z
          `,
          fill: 'rgba(55,120,255,0.2)',
          stroke: 'rgb(55,120,255)',
          lineWidth: 2,
        },
      })
			canvas.ready.then(() => {
				canvas.appendChild(sand)
        canvas.appendChild(wave)
			})
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
