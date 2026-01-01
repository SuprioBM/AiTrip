import DestinationCard from './DestinationCard'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

export default function Carousel({ destinations, currentIndex, setCurrentIndex }) {
	const [touchStart, setTouchStart] = useState(null)
	const [touchEnd, setTouchEnd] = useState(null)

	// Minimum swipe distance (in px)
	const minSwipeDistance = 50

	const handlePrev = () => {
		setCurrentIndex((prev) => (prev - 1 + destinations.length) % destinations.length)
	}

	const handleNext = () => {
		setCurrentIndex((prev) => (prev + 1) % destinations.length)
	}

	const onTouchStart = (e) => {
		setTouchEnd(null)
		setTouchStart(e.targetTouches[0].clientX)
	}

	const onTouchMove = (e) => {
		setTouchEnd(e.targetTouches[0].clientX)
	}

	const onTouchEnd = () => {
		if (!touchStart || !touchEnd) return
		const distance = touchStart - touchEnd
		const isLeftSwipe = distance > minSwipeDistance
		const isRightSwipe = distance < -minSwipeDistance
		
		if (isLeftSwipe) handleNext()
		if (isRightSwipe) handlePrev()
	}

	const getVisibleCards = () => {
		const indices = [
			currentIndex,
			(currentIndex + 1) % destinations.length,
			(currentIndex + 2) % destinations.length,
		]
		return indices.map((i, idx) => ({ ...destinations[i], position: idx === 0 ? 'left' : idx === 1 ? 'center' : 'right' }))
	}

	return (
		<div className="flex flex-col items-center w-full min-h-[300px] sm:min-h-[400px] justify-end">
			{/* Cards Container */}
			<div 
				className="flex gap-2 sm:gap-3 md:gap-4 lg:gap-6 justify-center mb-3 sm:mb-4 md:mb-6 px-2 sm:px-4 pl-17"
				onTouchStart={onTouchStart}
				onTouchMove={onTouchMove}
				onTouchEnd={onTouchEnd}
			>
				{getVisibleCards().map((card, idx) => {
					const isFirst = idx === 0
					
					return (
						<div 
							key={card.id} 
							className={`transition-all ease-out ${isFirst ? 'scale-100 sm:scale-105 md:scale-110 z-10' : 'scale-75 sm:scale-80 md:scale-90 opacity-60'}`}
						>
							<DestinationCard 
								image={card.image} 
								title={card.title}
								animationDelay={0}
								position={card.position}
							/>
						</div>
					)
				})}
			</div>

			{/* Navigation Buttons Below Cards - Always Visible */}
			<div className="flex gap-3 sm:gap-4 items-center justify-center mt-2 sm:mt-3 md:mt-4 mb-4 sm:mb-6">
				<button
					onClick={handlePrev}
					className="w-14 h-14 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-full bg-white/40 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all duration-300 hover:scale-110 active:scale-95 group shadow-2xl touch-manipulation z-50"
					aria-label="Previous destination"
				>
					<ChevronLeft className="w-7 h-7 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white group-hover:translate-x-[-2px] transition-transform stroke-[3]" />
				</button>

				<button
					onClick={handleNext}
					className="w-14 h-14 sm:w-14 sm:h-14 md:w-12 md:h-12 rounded-full bg-white/40 backdrop-blur-sm border-2 border-white/50 flex items-center justify-center hover:bg-white/50 active:bg-white/60 transition-all duration-300 hover:scale-110 active:scale-95 group shadow-2xl touch-manipulation z-50"
					aria-label="Next destination"
				>
					<ChevronRight className="w-7 h-7 sm:w-7 sm:h-7 md:w-6 md:h-6 text-white group-hover:translate-x-[2px] transition-transform stroke-[3]" />
				</button>
			</div>
		</div>
	)
}

