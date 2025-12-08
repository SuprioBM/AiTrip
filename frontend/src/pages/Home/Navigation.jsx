export default function Navigation() {
	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
			<nav className="flex gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-white font-medium text-sm sm:text-base">
				{['News', 'Destinations', 'Blog', 'Contact'].map((item, idx) => (
					<a 
						key={item}
						href={`#${item.toLowerCase()}`} 
						className="hover:text-blue-200 transition whitespace-nowrap"
						style={{
							animation: `navItemSlideDown 0.5s ease-out ${0.1 + idx * 0.06}s both`
						}}
					>
						{item}
					</a>
				))}
			</nav>

			<div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-center">
				<div className="hidden lg:flex items-center bg-white/20 backdrop-blur-sm border border-white/30 rounded-full px-4 py-2 w-48 xl:w-72" style={{
					animation: 'navItemSlideDown 0.5s ease-out 0.2s both'
				}}>
					<input
						type="text"
						placeholder="Search..."
						className="flex-1 outline-none text-white bg-transparent placeholder-gray-300 text-sm"
					/>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-teal-400">
						<circle cx="11" cy="11" r="8"></circle>
						<path d="m21 21-4.35-4.35"></path>
					</svg>
				</div>

				<button 
					className="flex items-center gap-1 sm:gap-2 bg-teal-500/80 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full hover:bg-teal-600 transition shadow-md"
					style={{
						animation: 'iconPopScale 0.6s ease-out 0.25s both'
					}}
				>
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5">
						<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
					</svg>
					<span className="font-medium text-sm sm:text-base hidden sm:inline">Hello, Anney!</span>
				</button>
			</div>
		</div>
	);
}
 
