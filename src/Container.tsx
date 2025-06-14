import {
	ExpandOutlined,
	InfoCircleOutlined,
	ReloadOutlined,
} from '@ant-design/icons'
import { Button, Popover, Tag } from 'antd'
import { useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { randomId } from './lib/utils'

export function ComponentContainer({
	children,
	onOpenPreview,
	title,
	wip,
}: {
	children: React.ReactNode
	onOpenPreview: (title: string, content: React.ReactNode) => void
	title: string
	wip?: boolean
}) {
	const [key, setKey] = useState(randomId())
	return (
		<div className='w-full h-[300px] border overflow-hidden border-gray-600'>
			<div className='w-full h-[40px]'>
				<div className='flex items-center justify-between pl-3 pr-2 h-full border-b border-gray-600'>
					<span className='font-semibold'>
						{title}
						{wip && (
							<Tag color='pink' className='!ml-2'>
								WIP
							</Tag>
						)}
					</span>
					<div>
						<Button
							type='text'
							icon={<ReloadOutlined />}
							onClick={() => setKey(randomId())}
						/>
						<Button
							type='text'
							icon={<ExpandOutlined />}
							onClick={() => onOpenPreview(title, children)}
						/>
					</div>
				</div>
			</div>
			<div key={key} className='w-full h-[calc(100%-40px)] relative'>
				<ErrorBoundary FallbackComponent={ErrorFallback}>
					{children}
				</ErrorBoundary>
			</div>
		</div>
	)
}

function ErrorFallback({ error }: FallbackProps) {
	return (
		<div className='w-full h-full flex items-center justify-center'>
			<Popover
				content={error instanceof Error ? error.message : String(error)}
				trigger={['hover', 'click']}
			>
				<Button type='text' icon={<InfoCircleOutlined />} size='large' danger />
			</Popover>
		</div>
	)
}
