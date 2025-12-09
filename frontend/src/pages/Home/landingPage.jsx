import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ChatBubbleLeftEllipsisIcon,
  StarIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/solid";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-[#1F2937]">
      {/* BENTO CARD ROW */}
      <motion.h1
        className="text-black text-4xl font-bold text-center flex items-center justify-center mt-20 mb-10"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Your Next Adventure Awaits
      </motion.h1>
      <section className="px-30 py-15 flex justify-evenly gap-6">
        {[
          { color: "#34D399", image: "/santorini-greece-sunset.jpg" },
          { color: "#60A5FA", image: "/broken-beach-bali.jpg" },
          { color: "#C4B5FD", image: "/kerala-backwaters-india.jpg" },
          { color: "#FDE047", image: "/maldives-islands-resort.jpg" },
          { color: "#F87171", image: "/buddhist-temple-thailand.jpg" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: i * 0.1,
              ease: "easeOut",
            }}
            whileHover={{ y: -8, scale: 1.03 }}
            className={`w-64 h-96 rounded-2xl shadow-md overflow-hidden relative ${
              i === 1 ? "mt-13" : i === 3 ? "mt-13" : ""
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
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="grid grid-rows-2 gap-4 h-[600px] w-full"
          >
            <div className="rounded-xl overflow-hidden shadow-lg">
              <img
                src="/buddhist-temple-thailand.jpg"
                alt="Photo 1"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/bora-bora-polynesia-lagoon.jpg"
                  alt="Photo 2"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/capri-italy-coast.jpg"
                  alt="Photo 3"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src="/petra-jordan-ancient.jpg"
                  alt="Photo 4"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
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
                We believe travel is more than just visiting new places—it's
                about creating unforgettable memories, experiencing diverse
                cultures, and discovering the beauty our world has to offer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                Our expertly curated destinations combine breathtaking
                landscapes, rich heritage, and authentic local experiences to
                ensure every journey with us becomes a story worth sharing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <p className="text-lg text-gray-700 leading-relaxed">
                From ancient temples to pristine beaches, from mountain peaks to
                vibrant cities—let us guide you to extraordinary places that
                will inspire and transform you.
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
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm shadow-xl p-10 min-h-[320px] relative overflow-hidden"
              style={{
                border: "2px solid rgba(255, 255, 255, 0.5)",
                borderRadius: "3rem 0.5rem 3rem 0.5rem",
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
                  "This service made my trip amazing! Highly recommended. The
                  experience was unforgettable and exceeded all my
                  expectations."
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="px-8 py-12 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {[
            {
              q: "What destinations do you offer?",
              a: "We offer a wide range of exotic destinations including Thailand, Bali, Greece, Peru, and many more beautiful locations around the world.",
            },
            {
              q: "How do I book a trip?",
              a: "Simply click the 'Explore' button on any destination card, fill out your travel details, and our team will get back to you within 24 hours.",
            },
            {
              q: "Are the trips customizable?",
              a: "Yes! We offer fully customizable travel packages tailored to your preferences, budget, and timeline.",
            },
            {
              q: "What's included in the package?",
              a: "Our packages typically include accommodation, guided tours, transportation, and selected meals. Specifics vary by destination.",
            },
          ].map((item, i) => (
            <motion.details
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
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
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
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
    </div>
  );
}
