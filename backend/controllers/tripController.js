import Trip from '../models/Trip.js';

export const createTrip = async (req, res, next) => {
  try {
    const { title, preferences, itinerary, totalDays } = req.body;
    const trip = await Trip.create({ user: req.user._id, title, preferences, itinerary, totalDays });
    res.status(201).json(trip);
  } catch (err) {
    next(err);
  }
};

export const getTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find().populate('user', 'name email');
    res.json(trips);
  } catch (err) { next(err); }
};

export const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('user', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });
    res.json(trip);
  } catch (err) { next(err); }
};

export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(trip);
  } catch (err) { next(err); }
};

export const deleteTrip = async (req, res, next) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
};
