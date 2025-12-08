import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-[#00C9A7] to-[#00A3E1] text-[#1F2937]">
      
      {/* BENTO CARD ROW */}
      <section className="px-30 py-20 flex justify-evenly gap-6">
        
        {[ 
          { color: "#34D399", image: "/santorini-greece-sunset.jpg" },
          { color: "#60A5FA", image: "/broken-beach-bali.jpg" },
          { color: "#C4B5FD", image: "/kerala-backwaters-india.jpg" },
          { color: "#FDE047", image: "/maldives-islands-resort.jpg" },
          { color: "#F87171", image: "/buddhist-temple-thailand.jpg" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: i * 0.1,
              ease: "easeOut"
            }}
            whileHover={{ y: -8, scale: 1.03 }}
            className={`w-64 h-96 rounded-2xl shadow-md overflow-hidden relative ${
              i === 1 ? 'mt-13' : i === 3 ? 'mt-13' : ''
            }`}
          >
            <img 
              src={item.image} 
              alt={`Feature ${i + 1}`}
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent p-6 flex flex-col justify-end text-white">
              <div className="text-xl font-semibold">Feature {i + 1}</div>
              <p className="text-sm opacity-90">
                Explore unique travel experiences designed for you.
              </p>
            </div>
          </motion.div>
        ))}

      </section>

      {/* DEFINITION SECTION */}
      <section className="px-8 py-12 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Our Mission</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Image Grid */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="grid grid-rows-2 gap-4 h-[600px] w-full"
          >
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img src="/buddhist-temple-thailand.jpg" alt="Photo 1" className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img src="/bora-bora-polynesia-lagoon.jpg" alt="Photo 2" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img src="/capri-italy-coast.jpg" alt="Photo 3" className="w-full h-full object-cover" />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img src="/petra-jordan-ancient.jpg" alt="Photo 4" className="w-full h-full object-cover" />
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Discover Your Next Adventure
              </h3>
              <p className="text-lg text-gray-700 leading-relaxed">
                We believe travel is more than just visiting new places—it's about creating unforgettable memories, experiencing diverse cultures, and discovering the beauty our world has to offer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                Our expertly curated destinations combine breathtaking landscapes, rich heritage, and authentic local experiences to ensure every journey with us becomes a story worth sharing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                From ancient temples to pristine beaches, from mountain peaks to vibrant cities—let us guide you to extraordinary places that will inspire and transform you.
              </p>
            </motion.div>

            <Link to="/booking">
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1 }}
                whileHover={{ scale: 1.05 }}
                className="mt-8 bg-gradient-to-r from-teal-500 to-blue-500 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Start Your Journey
              </motion.button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="px-17 py-15">
        <h2 className="text-2xl font-bold mb-6">Testimonials</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              whileHover={{ y: -6, scale: 1.02, rotate: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl p-10 min-h-[320px] relative overflow-hidden"
              style={{
                border: '2px solid rgba(255, 255, 255, 0.5)',
                borderRadius: '3rem 0.5rem 3rem 0.5rem',
              }}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-400/20 to-blue-400/20 rounded-full blur-2xl -mr-16 -mt-16"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-cyan-400/20 to-teal-400/20 rounded-full blur-xl -ml-12 -mb-12"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-br from-yellow-400 to-orange-400 p-2 rounded-full">
                    <StarIcon className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="text-xl font-semibold">User {i}</h4>
                </div>
                <p className="text-gray-700 text-base leading-relaxed">
                  "This service made my trip amazing! Highly recommended. The experience was unforgettable and exceeded all my expectations."
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-8 py-12 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
        
        <div className="space-y-4">
          {[
            { q: "What destinations do you offer?", a: "We offer a wide range of exotic destinations including Thailand, Bali, Greece, Peru, and many more beautiful locations around the world." },
            { q: "How do I book a trip?", a: "Simply click the 'Explore' button on any destination card, fill out your travel details, and our team will get back to you within 24 hours." },
            { q: "Are the trips customizable?", a: "Yes! We offer fully customizable travel packages tailored to your preferences, budget, and timeline." },
            { q: "What's included in the package?", a: "Our packages typically include accommodation, guided tours, transportation, and selected meals. Specifics vary by destination." },
          ].map((item, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm p-5 rounded-2xl shadow-lg cursor-pointer border-2 border-white/50 hover:shadow-xl transition-all duration-300"
            >
              <summary className="text-lg font-semibold flex items-center justify-between gap-3 list-none">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-400 to-blue-500 p-2 rounded-lg">
                    <QuestionMarkCircleIcon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-gray-800">{item.q}</span>
                </div>
                <motion.svg 
                  className="w-6 h-6 text-teal-500 group-open:rotate-180 transition-transform duration-300"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </summary>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <p className="mt-4 ml-11 text-gray-700 leading-relaxed">
                  {item.a}
                </p>
              </motion.div>
            </motion.details>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            
            {/* Brand Section */}
            <div className="md:col-span-1">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                TravelHub
              </h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                Discover the world's most amazing destinations with expertly crafted travel experiences.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-teal-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-teal-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 hover:bg-teal-500 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-teal-400">Quick Links</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Home</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Destinations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">About Us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Blog</a></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-teal-400">Support</h4>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Help Center</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">FAQs</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Terms of Service</a></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-lg font-semibold mb-6 text-teal-400">Contact Us</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-400">support@travelhub.com</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
                <li className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-teal-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-gray-400">123 Travel Street, NY 10001</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © 2025 TravelHub. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Terms</a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Privacy</a>
              <a href="#" className="text-gray-400 hover:text-teal-400 transition-colors duration-200">Cookies</a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
