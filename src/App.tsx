import { CloseOutlined, ReloadOutlined } from '@ant-design/icons'
import { Button, ColorPicker, Modal } from 'antd'
import { useState } from 'react'
import { Life } from './antv-g/Life'
import { Light } from './antv-g/Light'
import { Planets } from './antv-g/Planets'
import { Waves as WavesPlain } from './antv-g/Waves'
import { ComponentContainer } from './Container'
import { randomId } from './lib/utils'
import { Balls } from './matter-js/Balls'
import { Waves as WavesParticle } from './matter-js/Waves'

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
	const onOpenPreview = (
		title: string,
		content: React.ReactNode,
		renderDelay = 0,
	) => {
		setModalTitle(title)
		setModalContentKey(randomId())
		setIsModalOpen(true)
		setTimeout(() => {
			setModalContent(content)
		}, renderDelay)
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
				<ComponentContainer
					onOpenPreview={onOpenPreview}
					title='<Light />'
					tags={['@antv/g']}
				>
					<Light />
				</ComponentContainer>
				<ComponentContainer
					onOpenPreview={onOpenPreview}
					title='<Balls />'
					tags={['matter-js']}
				>
					<Balls />
				</ComponentContainer>
				<ComponentContainer
					onOpenPreview={onOpenPreview}
					title='<Planets />'
					tags={['@antv/g']}
				>
					<Planets />
				</ComponentContainer>
				<ComponentContainer
					onOpenPreview={onOpenPreview}
					title='<Waves />'
					tags={['@antv/g']}
					wip
				>
					<WavesPlain />
				</ComponentContainer>
				<ComponentContainer
					onOpenPreview={onOpenPreview}
					title='<Life />'
					tags={['@antv/g']}
				>
					<Life gridBorder={false} />
				</ComponentContainer>
				<ComponentContainer
					onOpenPreview={onOpenPreview}
					title='<Waves />'
					tags={['matter-js']}
					wip
				>
					<WavesParticle />
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
