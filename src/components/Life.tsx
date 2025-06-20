import { Canvas, CanvasEvent, Group, Line, Rect } from '@antv/g'
import { Renderer } from '@antv/g-canvas'
import { useEffect, useRef } from 'react'
import { debounce } from '../lib/utils'

const renderer = new Renderer()

/**
 * Conway's Game of Life:
 *
 * Rule 1: Any live cell with fewer than two live neighbors dies (underpopulation).
 * Rule 2: Any live cell with two or three live neighbors lives on to the next generation.
 * Rule 3: Any live cell with more than three live neighbors dies (overpopulation).
 * Rule 4: Any dead cell with exactly three live neighbors becomes a live cell (reproduction).
 */
class World {
	cells: boolean[][]
	width: number
	height: number
	iteration: number = 0
	constructor(
		width: number,
		height: number,
		initialCells: boolean[][] | 'empty' | 'random' = 'random',
	) {
		this.width = width
		this.height = height
		if (initialCells === 'empty') {
			this.cells = this.#generateEmptyCells()
		} else if (initialCells === 'random') {
			this.cells = this.#generateRandomCells()
		} else if (Array.isArray(initialCells)) {
			if (
				initialCells.length !== height ||
				!initialCells.every((row) => row.length === width)
			) {
				throw new Error(
					'Initial cells must match the specified width and height.',
				)
			}
			this.cells = initialCells
		} else {
			throw new Error('Invalid initial cells configuration.')
		}
	}

	#generateEmptyCells(): boolean[][] {
		return Array.from({ length: this.height }, () =>
			Array.from({ length: this.width }, () => false),
		)
	}

	#generateRandomCells(ratioAlive = 0.3): boolean[][] {
		return Array.from({ length: this.height }, () =>
			Array.from({ length: this.width }, () => Math.random() < ratioAlive),
		)
	}

	#directions = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, 1],
	]

	#calculateLiveNeighbors(x: number, y: number): number {
		let count = 0
		for (const [dx, dy] of this.#directions) {
			const nx = x + dx
			const ny = y + dy
			if (nx >= 0 && nx < this.width && ny >= 0 && ny < this.height) {
				count += this.cells[ny][nx] ? 1 : 0
			}
		}
		return count
	}

	update() {
		const newCells = this.#generateEmptyCells()
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const liveNeighbors = this.#calculateLiveNeighbors(x, y)
				if (this.cells[y][x]) {
					newCells[y][x] = liveNeighbors === 2 || liveNeighbors === 3
				} else {
					newCells[y][x] = liveNeighbors === 3
				}
			}
		}
		this.cells = newCells
		this.iteration++
	}
}

type GenerateGridParams = {
	canvasWidth: number
	canvasHeight: number
	worldWidth: number
	worldHeight: number
	cellWidth: number
	cellHeight: number
	gridBorder: boolean
	gridColor: string
	gridLineWidth: number
	gridLineDash: number[]
}

function generateGrid({
	canvasWidth,
	canvasHeight,
	worldWidth,
	worldHeight,
	cellWidth,
	cellHeight,
	gridBorder,
	gridColor,
	gridLineWidth,
	gridLineDash,
}: GenerateGridParams): Group {
	const grid = new Group()
	grid.style.zIndex = 9
	for (
		let i = gridBorder ? 0 : 1;
		i <= worldWidth - (gridBorder ? 0 : 1);
		i++
	) {
		const x = i * cellWidth
		const line = new Line({
			style: {
				x1: x,
				y1: 0,
				x2: x,
				y2: canvasHeight,
				stroke: gridColor,
				lineWidth: gridLineWidth,
				lineDash: gridLineDash,
			},
		})
		grid.appendChild(line)
	}
	for (
		let j = gridBorder ? 0 : 1;
		j <= worldHeight - (gridBorder ? 0 : 1);
		j++
	) {
		const y = j * cellHeight
		const line = new Line({
			style: {
				x1: 0,
				y1: y,
				x2: canvasWidth,
				y2: y,
				stroke: gridColor,
				lineWidth: gridLineWidth,
				lineDash: gridLineDash,
			},
		})
		grid.appendChild(line)
	}
	return grid
}

type GenerateCellsParams = {
	cells: boolean[][]
	worldWidth: number
	worldHeight: number
	cellWidth: number
	cellHeight: number
	cellAliveColor: string
	cellDeadColor: string
}

function generateCells({
	cells,
	worldWidth,
	worldHeight,
	cellWidth,
	cellHeight,
	cellAliveColor,
	cellDeadColor,
}: GenerateCellsParams): Group {
	const group = new Group()
	for (let y = 0; y < worldHeight; y++) {
		for (let x = 0; x < worldWidth; x++) {
			const isAlive = cells[y][x]
			const rect = new Rect({
				style: {
					x: x * cellWidth,
					y: y * cellHeight,
					width: cellWidth,
					height: cellHeight,
					fill: isAlive ? cellAliveColor : cellDeadColor,
				},
			})
			group.appendChild(rect)
		}
	}
	return group
}

type LifeProps = {
	/** Width of the world in cells, default: auto */
	width?: number
	/** Height of the world in cells, default: auto */
	height?: number
	/** Initial cells configuration, default: random */
	initialCells?: boolean[][]
	/** Minimum update interval in milliseconds, default: 1000 */
	minUpdateInterval?: number
	showGrid?: boolean
	gridBorder?: boolean
	gridColor?: string
	gridLineWidth?: number
	gridLineDash?: number[]
	cellAliveColor?: string
	cellDeadColor?: string
}

export function Life({
	width,
	height,
	initialCells,
	minUpdateInterval = 1000,
	showGrid = true,
	gridBorder = true,
	gridColor = 'rgba(64,0,0,0.3)',
	gridLineWidth = 1,
	gridLineDash = [2, 2],
	cellAliveColor = `rgba(${255 - Math.floor(Math.random() * 64)}, 0, ${Math.floor(Math.random() * 192)}, 0.5)`,
	cellDeadColor = 'rgb(255,255,255)',
}: LifeProps) {
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
			const worldWidth = width || Math.floor(w / 50)
			const worldHeight = height || Math.floor(h / 50)
			const world = new World(worldWidth, worldHeight, initialCells || 'random')
			const cellWidth = w / worldWidth
			const cellHeight = h / worldHeight
			const grid = showGrid
				? generateGrid({
						canvasWidth: w,
						canvasHeight: h,
						worldWidth,
						worldHeight,
						cellWidth,
						cellHeight,
						gridBorder,
						gridColor,
						gridLineWidth,
						gridLineDash,
					})
				: null
			let cells = generateCells({
				cells: world.cells,
				worldWidth,
				worldHeight,
				cellWidth,
				cellHeight,
				cellAliveColor,
				cellDeadColor,
			})
			let timer = Date.now()
			canvas.addEventListener(CanvasEvent.AFTER_RENDER, () => {
				const now = Date.now()
				const elapsed = now - timer
				if (elapsed >= minUpdateInterval) {
					world.update()
					timer = now
					canvas.removeChild(cells)
					cells = generateCells({
						cells: world.cells,
						worldWidth,
						worldHeight,
						cellWidth,
						cellHeight,
						cellAliveColor,
						cellDeadColor,
					})
					canvas.appendChild(cells)
				}
			})
			canvas.ready.then(() => {
				canvas.appendChild(cells)
				if (grid) {
					canvas.appendChild(grid)
				}
			})
		}

		draw()

		const debouncedDraw = debounce(draw)
		window.addEventListener('resize', debouncedDraw)
		return () => {
			window.removeEventListener('resize', debouncedDraw)
			canvas.removeAllEventListeners()
			canvas.destroy()
		}
	}, [
		width,
		height,
		initialCells,
		minUpdateInterval,
		showGrid,
		gridBorder,
		gridColor,
		gridLineWidth,
		gridLineDash,
		cellAliveColor,
		cellDeadColor,
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
