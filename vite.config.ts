import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react({
			babel: {
				plugins: [['babel-plugin-react-compiler', {}]],
			},
		}),
		tailwindcss(),
	],
	build: {
		target: ['chrome110', 'firefox115', 'safari16', 'edge110'],
		chunkSizeWarningLimit: 600,
		rollupOptions: {
			output: {
				manualChunks: {
					antd: ['antd', '@ant-design/icons'],
					antv: ['@antv/g', '@antv/g-canvas'],
				},
			},
		},
	},
})
