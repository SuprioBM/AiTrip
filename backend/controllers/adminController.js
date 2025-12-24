import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Review from "../models/Review.js";
import {PartnerUp, PartnerUpMember} from "../models/Partner.js";
import Location from "../models/Location.js";
import Host from "../models/Host.js";
import Booking from "../models/Booking.js";

// Utility to get model by name
const models = { User, Trip, Review, PartnerUp, Location, Host, Booking };
const getModel = (name) => models[name];



export const getAllDashboardData = async (req, res, next) => {
  try {
    const [users, trips, reviews, partners, locations, hosts, bookings] =
      await Promise.all([
        User.find({ role: { $ne: "admin" } }),
        Trip.find().populate('user', 'name email phone age'),
        Review.find(),
        PartnerUp.find().populate('createdBy', 'name email phone age'),
        Location.find(),
        Host.find(),
        Booking.find(),
      ]);

    // Get members for each partner-up
    const partnersWithMembers = await Promise.all(
      partners.map(async (partner) => {
        const members = await PartnerUpMember.find({ 
          partnerUp: partner._id,
          status: 'accepted'
        }).populate('user', 'name email phone age');
        
        return {
          ...partner.toObject(),
          members: members.map(m => m.user),
          acceptedMembers: members
        };
      })
    );

    res.json({
      users,
      trips,
      reviews,
      partners: partnersWithMembers,
      locations,
      hosts,
      bookings,
    });
  } catch (err) {
    next(err);
  }
};


// GET all documents of a collection
export const getAll = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const Model = getModel(collection);
    if (!Model) return res.status(400).json({ message: "Invalid collection" });

    let query = {};
    if (collection === "User") query.role = { $ne: "admin" }; // exclude admin users
    const data = await Model.find(query);
    res.json(data);
  } catch (err) {
    next(err);
  }
};

// GET single document by ID
export const getOne = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const Model = getModel(collection);
    if (!Model) return res.status(400).json({ message: "Invalid collection" });

    const doc = await Model.findById(id);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

// CREATE new document
export const createOne = async (req, res, next) => {
  try {
    const { collection } = req.params;
    const Model = getModel(collection);
    if (!Model) return res.status(400).json({ message: "Invalid collection" });

    const newDoc = await Model.create(req.body);
    res.status(201).json(newDoc);
  } catch (err) {
    next(err);
  }
};

// UPDATE document by ID
export const updateOne = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const Model = getModel(collection);
    if (!Model) return res.status(400).json({ message: "Invalid collection" });

    const updatedDoc = await Model.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedDoc);
  } catch (err) {
    next(err);
  }
};

// DELETE document by ID
export const deleteOne = async (req, res, next) => {
  try {
    const { collection, id } = req.params;
    const Model = getModel(collection);
    
    if (!Model) return res.status(400).json({ message: "Invalid collection" });

    await Model.findByIdAndDelete(id);
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    next(err);
  }
};
