import { useState } from "react";
import HeroContent from "../../components/HeroContent";
import LandingPage from "./landingPage";
import Carousel from "../../components/Carousel";

export default function HomePage() {
  const destinations = [
    {
      id: 1,
      title: "Buddha Temple, Thailand",
      image: "/buddhist-temple-thailand.jpg",
      description:
        "Experience the serenity of ancient Buddhist temples in Thailand, where golden spires rise against clear blue skies. Discover centuries of spiritual heritage, intricate architecture, and peaceful meditation gardens that offer a tranquil escape from the modern world.",
    },
    {
      id: 2,
      title: "Broken Beach, Bali",
      image: "/broken-beach-bali.jpg",
      description:
        "Witness the stunning natural archway at Broken Beach, where turquoise waters flow through dramatic cliff formations. This geological wonder on Nusa Penida island offers breathtaking views and showcases the raw beauty of Bali's coastline.",
    },
    {
      id: 3,
      title: "Kerala Backwaters",
      image: "/kerala-backwaters-india.jpg",
      description:
        "Drift through the enchanting backwaters of Kerala, where palm-fringed canals weave through lush landscapes. Experience traditional houseboat living, vibrant local culture, and the peaceful rhythm of life along India's most scenic waterways.",
    },
    {
      id: 4,
      title: "Santorini, Greece",
      image: "/santorini-greece-sunset.jpg",
      description:
        "Marvel at the iconic white-washed buildings and blue-domed churches perched on volcanic cliffs. Santorini offers spectacular sunsets, pristine beaches, and a romantic atmosphere that makes it one of the Mediterranean's most beloved destinations.",
    },
    {
      id: 5,
      title: "Bora Bora, Polynesia",
      image: "/bora-bora-polynesia-lagoon.jpg",
      description:
        "Immerse yourself in the crystal-clear lagoons and overwater bungalows of Bora Bora. This Pacific paradise features vibrant coral reefs, turquoise waters, and Mount Otemanu rising dramatically from the island's center.",
    },
    {
      id: 6,
      title: "Machu Picchu, Peru",
      image: "/img.webp",
      description:
        "Explore the ancient Incan citadel nestled high in the Andes Mountains. Machu Picchu's mysterious ruins, breathtaking mountain vistas, and rich archaeological heritage make it one of the world's most awe-inspiring destinations.",
    },
    {
      id: 7,
      title: "Maldives Islands",
      image: "/maldives-islands-resort.jpg",
      description:
        "Escape to pristine white sand beaches and crystal-clear waters in this tropical paradise. The Maldives offers world-class diving, luxurious resorts, and some of the most beautiful coral atolls on Earth.",
    },
    {
      id: 8,
      title: "Capri, Italy",
      image: "/capri-italy-coast.jpg",
      description:
        "Discover the glamorous Mediterranean island of Capri, with its dramatic cliffs, designer boutiques, and the famous Blue Grotto. This Italian gem has captivated visitors for centuries with its natural beauty and sophisticated charm.",
    },
    {
      id: 9,
      title: "Petra, Jordan",
      image: "/petra-jordan-ancient.jpg",
      description:
        "Journey to the rose-red city carved into sandstone cliffs over 2,000 years ago. Petra's magnificent Treasury, ancient tombs, and archaeological wonders make it one of the New Seven Wonders of the World.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Background always shows the first card's image
  const currentBackground =
    destinations[currentIndex]?.image || "/placeholder.svg";

  return (
    <div className="bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="relative w-full h-screen overflow-hidden"
          style={{
            backgroundImage: `url(${currentBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            animation:
              "bgHeroEntrance 1.2s cubic-bezier(0.22, 1, 0.36, 1) both, bgIdleFloat 9s ease-in-out 1.2s infinite",
            willChange: "transform, opacity",
            transition: "background-image 0.6s ease-in-out",
          }}
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-800/40 to-slate-900/30"
            style={{
              animation: "containerFadeIn 0.9s ease-out 0.5s both",
            }}
          />

          <div className="relative z-10 h-screen flex flex-col p-4 sm:p-6 md:p-8 lg:p-12">

            <div className="flex-1 flex flex-col lg:flex-row gap-6 sm:gap-8 md:gap-10 lg:gap-16 relative items-start justify-between pt-8 sm:pt-12 md:pt-16 lg:pt-20 pb-20 sm:pb-24">
              <div className="w-full lg:w-1/2 flex flex-col justify-center relative z-20 pr-0 lg:pr-8 mt-8 sm:mt-12 md:mt-16 lg:mt-20">
                <HeroContent destination={destinations[currentIndex]} />
              </div>
              <div className="w-full lg:w-1/2 flex flex-col justify-end items-center lg:items-start z-10 pl-0 lg:pl-8 pb-2 sm:pb-4">
                <Carousel
                  destinations={destinations}
                  currentIndex={currentIndex}
                  setCurrentIndex={setCurrentIndex}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <LandingPage />
    </div>
  );
}
