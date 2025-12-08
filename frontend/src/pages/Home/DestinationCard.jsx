export default function DestinationCard({ image, title, dots = 5, animationDelay = 0, position = 'center' }) {
  const onImgError = (e) => {
    if (e.currentTarget.dataset.fallback !== '1') {
      e.currentTarget.src = '/placeholder.svg'
      e.currentTarget.dataset.fallback = '1'
    }
  }

  return (
    <div 
      className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 h-64 w-36 sm:h-80 sm:w-44 md:h-96 md:w-56 group hover:-translate-y-2"
    >
      <div className="relative h-full w-full overflow-hidden">
        <img
          src={image || '/placeholder.svg'}
          alt={title}
          onError={onImgError}
          className="w-full h-full object-cover group-hover:scale-103 transition-all duration-500"
          style={{ animation: `imageFadeIn 0.6s ease-out ${animationDelay + 0.2}s both` }}
        />
        
        <button 
          className="absolute top-3 right-3 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 rounded-full shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center hover:scale-115 hover:-translate-y-0.5"
          style={{ animation: `bookmarkPop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${animationDelay + 0.3}s both` }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v16l7-3 7 3V5c0-1.1.89-2 2-2z" />
          </svg>
        </button>
      </div>
    </div>
  )
}
