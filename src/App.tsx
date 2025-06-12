import { ExpandOutlined } from '@ant-design/icons'
import { Button, ColorPicker, Modal } from 'antd'
import { useState } from 'react'
import { Light } from './components/Light'

export default function App() {
	const [isModalOpen, setIsModalOpen] = useState(false)
	const [modalTitle, setModalTitle] = useState('')
	const [modalContent, setModalContent] = useState<React.ReactNode>(null)
	const onCancelPreview = () => {
		setIsModalOpen(false)
		setModalTitle('')
		setModalContent(null)
	}
	const onOpenPreview = (title: string, content: React.ReactNode) => {
		setModalTitle(title)
		setModalContent(content)
		setIsModalOpen(true)
	}
	const [titleColor, setTitleColor] = useState('#000000')

	return (
		<div className='w-dvw py-12 bg-white'>
			<div
				className='w-full text-5xl font-semibold pl-14 mt-8 mb-20'
				style={{ color: titleColor }}
			>
				Components{' '}
				<ColorPicker
					defaultValue={titleColor}
					onChange={(_, css) => setTitleColor(css)}
				/>
			</div>
			<div className='w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-12'>
				<ComponentContainer onOpenPreview={onOpenPreview} title='<Light />'>
					<Light />
				</ComponentContainer>
			</div>
			<Modal
				title={modalTitle}
				centered
				open={isModalOpen}
				onCancel={onCancelPreview}
				footer={null}
				className='!w-[1200px] !max-w-[90dvw]'
			>
				<div className='w-full h-[800px] max-h-[calc(90dvh-8rem)] relative mt-6 border border-gray-600'>
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
	return (
		<div className='w-full h-[300px] border overflow-hidden border-gray-600'>
			<div className='w-full h-[40px]'>
				<div className='flex items-center justify-between pl-3 pr-2 h-full border-b border-gray-600'>
					<span className='font-semibold'>{title}</span>
					<Button
						type='text'
						icon={<ExpandOutlined />}
						onClick={() => onOpenPreview(title, children)}
					/>
				</div>
			</div>
			<div className='w-full h-[calc(100%-40px)] relative'>{children}</div>
		</div>
	)
}
