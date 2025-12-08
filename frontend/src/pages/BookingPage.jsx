import { useState } from 'react';
import { motion } from 'framer-motion';
import MapComponent from '../pages/Home/MapComponent';

export default function BookingPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    destination: '',
    travelDate: '',
    numberOfPeople: 1,
    specialRequests: ''
  });

  const [selectedDestination, setSelectedDestination] = useState(null);

  // Destination coordinates
  const destinations = {
    'Santorini, Greece': { lat: 36.3932, lng: 25.4615 },
    'Bali, Indonesia': { lat: -8.3405, lng: 115.0920 },
    'Kerala, India': { lat: 10.8505, lng: 76.2711 },
    'Maldives': { lat: 3.2028, lng: 73.2207 },
    'Thailand': { lat: 13.7563, lng: 100.5018 },
    'Machu Picchu, Peru': { lat: -13.1631, lng: -72.5450 },
    'Petra, Jordan': { lat: 30.3285, lng: 35.4444 },
    'Capri, Italy': { lat: 40.5508, lng: 14.2417 },
    'Bora Bora, Polynesia': { lat: -16.5004, lng: -151.7415 }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Update map when destination changes
    if (name === 'destination' && destinations[value]) {
      setSelectedDestination(destinations[value]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Booking submitted:', formData);
    alert('Thank you! Your booking request has been submitted. We will contact you soon!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#00C9A7] to-[#00A3E1] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Book Your Dream Journey
          </h1>
          <p className="text-xl text-white/90">
            Fill in your details and let us plan the perfect adventure for you
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Booking Information</h2>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="John Doe"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Destination */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Destination *
                </label>
                <select
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors"
                >
                  <option value="">Select a destination</option>
                  {Object.keys(destinations).map(dest => (
                    <option key={dest} value={dest}>{dest}</option>
                  ))}
                </select>
              </div>

              {/* Travel Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Travel Date *
                </label>
                <input
                  type="date"
                  name="travelDate"
                  value={formData.travelDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Number of People */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Number of Travelers *
                </label>
                <input
                  type="number"
                  name="numberOfPeople"
                  value={formData.numberOfPeople}
                  onChange={handleChange}
                  required
                  min="1"
                  max="20"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Special Requests (Optional)
                </label>
                <textarea
                  name="specialRequests"
                  value={formData.specialRequests}
                  onChange={handleChange}
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-teal-500 focus:outline-none transition-colors resize-none"
                  placeholder="Any special requirements or preferences..."
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Submit Booking Request
              </motion.button>
            </form>
          </motion.div>

          {/* Map Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Destination Map</h2>
            
            <div className="rounded-2xl overflow-hidden shadow-lg h-[600px] lg:h-[calc(100%-4rem)]">
              <MapComponent selectedLocation={selectedDestination} />
            </div>

            {formData.destination && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-blue-50 rounded-xl"
              >
                <p className="text-sm font-semibold text-gray-700">
                  📍 Selected Destination: <span className="text-teal-600">{formData.destination}</span>
                </p>
              </motion.div>
            )}
          </motion.div>

        </div>
      </div>
    </div>
  );
}
