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
        
      </div>
    </div>
  )
}
