import {
	CloseOutlined,
	ExpandOutlined,
	InfoCircleOutlined,
	ReloadOutlined,
} from '@ant-design/icons'
import { Button, ColorPicker, Modal, Popover } from 'antd'
import { useState } from 'react'
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary'
import { Balls } from './components/Balls'
import { Light } from './components/Light'
import { randomId } from './lib/utils'

export default function App() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalTitle, setModalTitle] = useState('')
	const [modalContent, setModalContent] = useState<React.ReactNode>(null)
	const [modalContentKey, setModalContentKey] = useState(randomId())
	const onCancelPreview = () => {
		setIsModalOpen(false)
		setModalTitle('')
		setModalContent(null)
	}
	const onOpenPreview = (title: string, content: React.ReactNode) => {
		setModalTitle(title)
		setModalContent(content)
		setIsModalOpen(true)
		setTimeout(() => {
			setModalContentKey(randomId())
		}, 0)
	}
	const [titleColor, setTitleColor] = useState('#000000')

	return (
		<div className='w-dvw py-12 bg-white'>
			<div
				className='w-full text-5xl font-semibold px-6 md:px-14 mt-8 mb-20 text-center md:text-left'
				style={{ color: titleColor }}
			>
				Components{' '}
				<ColorPicker
					className='!hidden md:!inline-flex'
					defaultFormat='rgb'
					defaultValue={titleColor}
					onChange={(_, css) => setTitleColor(css)}
				/>
			</div>
			<div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-6 md:px-12'>
				<ComponentContainer onOpenPreview={onOpenPreview} title='<Light />'>
					<Light />
				</ComponentContainer>
				<ComponentContainer onOpenPreview={onOpenPreview} title='<Balls />'>
					<Balls />
				</ComponentContainer>
			</div>
			<Modal
				title={
					<div className='flex items-center justify-between'>
						<span className='text-lg font-semibold'>{modalTitle}</span>
						<div>
							<Button
								type='text'
								icon={<ReloadOutlined />}
								onClick={() => setModalContentKey(randomId())}
							/>
							<Button
								type='text'
								icon={<CloseOutlined />}
								onClick={onCancelPreview}
							/>
						</div>
					</div>
				}
				centered
				open={isModalOpen}
				footer={null}
				className='!w-[1200px] !max-w-[90dvw]'
			>
				<div
					key={modalContentKey}
					className='w-full h-[800px] max-h-[calc(90dvh-8rem)] relative mt-6 border border-gray-600'
				>
					{modalContent}
				</div>
			</Modal>
		</div>
	)
}

function ComponentContainer({
	children,
	onOpenPreview,
	title,
}: {
	children: React.ReactNode
	onOpenPreview: (title: string, content: React.ReactNode) => void
	title: string
}) {
	const [key, setKey] = useState(randomId())
	return (
		<div className='w-full h-[300px] border overflow-hidden border-gray-600'>
			<div className='w-full h-[40px]'>
				<div className='flex items-center justify-between pl-3 pr-2 h-full border-b border-gray-600'>
					<span className='font-semibold'>{title}</span>
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
