import Localhost from "../models/Host.js";

/* =========================
   Get All Localhosts (Admin)
   ROUTE: GET /api/hosts/admin/all
   ACCESS: Admin only
========================= */
export const getAllLocalhosts = async (req, res) => {
  try {
    const localhosts = await Localhost.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: localhosts.length,
      data: localhosts,
    });
  } catch (error) {
    console.error("Get All Localhosts Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch localhosts",
    });
  }
};

/* =========================
   Get Localhosts by Location
   ROUTE: GET /api/hosts/:locationCode
   ACCESS: Public (used in booking page)
   EXAMPLE: /api/hosts/dha → returns all localhosts with locationCode "dha"
========================= */
export const getLocalhostsByLocation = async (req, res) => {
  try {
    const { locationCode } = req.params;

    console.log(`🔍 Searching localhosts with locationCode: "${locationCode}"`);

    if (!locationCode) {
      return res.status(400).json({
        message: "locationCode is required",
      });
    }

    const normalizedCode = locationCode.toLowerCase();
    const localhosts = await Localhost.find({
      locationCode: normalizedCode,
    }).sort({ createdAt: 1 });

    console.log(`📊 Found ${localhosts.length} localhost(s) for code "${normalizedCode}"`);

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

/* =========================
   Get Single Localhost (Admin)
   ROUTE: GET /api/hosts/admin/:id
   ACCESS: Admin only
========================= */
export const getLocalhostById = async (req, res) => {
  try {
    const { id } = req.params;

    const localhost = await Localhost.findById(id);

    if (!localhost) {
      return res.status(404).json({
        success: false,
        message: "Localhost not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: localhost,
    });
  } catch (error) {
    console.error("Get Localhost Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch localhost",
    });
  }
};

/* =========================
   Create Localhost (Admin)
   ROUTE: POST /api/hosts/admin/create
   ACCESS: Admin only
   
   AUTO ID GENERATION:
   - Takes locationCode (e.g., "Dhaka" → "dha")
   - Finds highest number for that location
   - Creates new ID: locationCode + (lastNumber + 1)
   - Example: "dha101", "dha102", "lon101", "jes101"
========================= */
export const createLocalhost = async (req, res) => {
  try {
    const { name, email, phone, locationCode, locationName } = req.body;

    // Validate required fields
    if (!name || !locationCode || !locationName) {
      return res.status(400).json({
        success: false,
        message: "Name, locationCode, and locationName are required",
      });
    }

    // Normalize locationCode to lowercase, take first 3 letters
    const normalizedLocationCode = locationCode.toLowerCase().substring(0, 3);

    // Find the highest number for this location
    const existingHosts = await Localhost.find({
      _id: { $regex: `^${normalizedLocationCode}` },
    }).sort({ _id: -1 });

    let newNumber = 101; // Start from 101
    if (existingHosts.length > 0) {
      const lastId = existingHosts[0]._id;
      const lastNumber = parseInt(lastId.substring(3));
      newNumber = lastNumber + 1;
    }

    // Generate new ID (e.g., "lon101", "dha101")
    const newId = `${normalizedLocationCode}${newNumber}`;

    // Create localhost
    const localhost = new Localhost({
      _id: newId,
      name,
      email,
      phone,
      locationCode: normalizedLocationCode,
      locationName,
    });

    await localhost.save();

    return res.status(201).json({
      success: true,
      message: "Localhost created successfully",
      data: localhost,
    });
  } catch (error) {
    console.error("Create Localhost Error:", error);
    return res.status(500).json({
      success: false,
      message: error.code === 11000 ? "Localhost ID already exists" : "Failed to create localhost",
    });
  }
};

/* =========================
   Update Localhost (Admin)
   ROUTE: PUT /api/hosts/admin/:id
   ACCESS: Admin only
   NOTE: Cannot change _id or locationCode (immutable)
========================= */
export const updateLocalhost = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, locationName } = req.body;

    const localhost = await Localhost.findById(id);

    if (!localhost) {
      return res.status(404).json({
        success: false,
        message: "Localhost not found",
      });
    }

    // Update fields
    if (name) localhost.name = name;
    if (email !== undefined) localhost.email = email;
    if (phone !== undefined) localhost.phone = phone;
    if (locationName) localhost.locationName = locationName;

    await localhost.save();

    return res.status(200).json({
      success: true,
      message: "Localhost updated successfully",
      data: localhost,
    });
  } catch (error) {
    console.error("Update Localhost Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update localhost",
    });
  }
};

/* =========================
   Delete Localhost (Admin)
   ROUTE: DELETE /api/hosts/admin/:id
   ACCESS: Admin only
========================= */
export const deleteLocalhost = async (req, res) => {
  try {
    const { id } = req.params;

    const localhost = await Localhost.findByIdAndDelete(id);

    if (!localhost) {
      return res.status(404).json({
        success: false,
        message: "Localhost not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Localhost deleted successfully",
    });
  } catch (error) {
    console.error("Delete Localhost Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete localhost",
    });
  }
};
