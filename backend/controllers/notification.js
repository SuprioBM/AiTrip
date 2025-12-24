import { Notification } from "../models/Notification.js";

export const createNotification = async ({ recipient, actor, type, data }) => {
  try {
    const n = await Notification.create({ recipient, actor, type, data });
    return n;
  } catch (err) {
    console.error("Create Notification Error:", err);
    throw err;
  }
};

export const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const notifs = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .populate("actor", "name profilePic");

    return res.status(200).json({ count: notifs.length, data: notifs });
  } catch (err) {
    console.error("Get Notifications Error:", err);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
    if (!n) return res.status(404).json({ message: "Notification not found" });
    return res.status(200).json({ data: n });
  } catch (err) {
    console.error("Mark Notification Read Error:", err);
    return res.status(500).json({ message: "Failed to update notification" });
  }
};
