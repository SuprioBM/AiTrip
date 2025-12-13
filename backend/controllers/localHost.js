import Localhost from "../models/Host.js";

/* =========================
   Get Localhosts by Location
========================= */

export const getLocalhostsByLocation = async (req, res) => {
  try {
    const { locationCode } = req.params;

    if (!locationCode) {
      return res.status(400).json({
        message: "locationCode is required",
      });
    }

    const localhosts = await Localhost.find({
      locationCode: locationCode.toLowerCase(),
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      count: localhosts.length,
      data: localhosts,
    });
  } catch (error) {
    console.error("Get Localhosts Error:", error);
    return res.status(500).json({
      message: "Failed to fetch localhosts",
    });
  }
};
