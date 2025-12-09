export default function CarouselControls({ currentIndex, totalCards, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between mt-4 w-full max-w-sm">
      <button
        onClick={onPrev}
        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 transition flex items-center justify-center shadow-md hover:scale-105"
        style={{ animation: 'arrowFadeIn 0.6s ease-out 1.3s both' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div 
        className="text-white font-bold text-lg"
        style={{ animation: 'pageNumberFade 0.7s ease-out 1.5s both' }}
      >
        {String(currentIndex + 1).padStart(2, '0')} — {String(totalCards).padStart(2, '0')}
      </div>

      <button
        onClick={onNext}
        className="w-12 h-12 rounded-full bg-white/20 hover:bg-white/40 transition flex items-center justify-center shadow-md hover:scale-105"
        style={{ animation: 'arrowFadeIn 0.6s ease-out 1.4s both' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6 text-white">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
