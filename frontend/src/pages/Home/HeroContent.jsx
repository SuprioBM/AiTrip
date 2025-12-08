import { Link } from 'react-router-dom';

export default function HeroContent({ destination }) {
	return (
		<div className="flex flex-col justify-center h-full">
			<div className="mb-8">
				<h1 
					className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 md:mb-6 leading-tight tracking-tighter"
					style={{
						animation: 'titleSlideUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.7s both'
					}}
				>
					{destination.title.toUpperCase()}
				</h1>
        
				<p 
					className="text-white/80 max-w-lg leading-relaxed text-sm sm:text-base font-light line-clamp-3 sm:line-clamp-none"
					style={{
						animation: 'contentSlideUp 0.8s ease-out 0.85s both'
					}}
				>
					{destination.description}
				</p>
			</div>

			<div className="mt-4 sm:mt-6 md:mt-8">
				<Link 
					to="/booking"
					className="inline-flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-5 py-2 sm:px-8 sm:py-3 rounded-lg font-bold hover:shadow-lg transition duration-300 shadow-md hover:scale-105 text-sm sm:text-base"
					style={{
						animation: 'buttonFadeUp 0.7s ease-out 1s both'
					}}
				>
					Explore
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5">
						<path d="M5 12h14M12 5l7 7-7 7" />
					</svg>
				</Link>
			</div>
		</div>
	);
}

 
