import Localhost from '../models/Host.js'

/**
 * Get all Localhost documents (Admin use)
 * - Route: GET /api/hosts/admin/all
 * - Access: Admin only
 *
 * Returns all hosts sorted by `createdAt` descending.
 * Responds with `{ success, count, data }` on success
 * and a 500 error when something goes wrong.
 */
export const getAllLocalhosts = async (req, res) => {
  try {
    const localhosts = await Localhost.find().sort({ createdAt: -1 })

    return res.status(200).json({
      success: true,
      count: localhosts.length,
      data: localhosts,
    })
  } catch (error) {
    console.error('Get All Localhosts Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch localhosts',
    })
  }
}

/**
 * Get all Localhosts for a specific `locationCode` (public)
 * - Route: GET /api/hosts/:locationCode
 * - Access: Public (used in booking page)
 *
 * Behavior:
 * - Reads `locationCode` from `req.params`.
 * - Normalizes it to lowercase before querying.
 * - Returns hosts sorted by `createdAt` ascending.
 *
 * Example: GET /api/hosts/dha returns hosts with `locationCode: 'dha'`.
 */
export const getLocalhostsByLocation = async (req, res) => {
  try {
    const { locationCode } = req.params

    console.log(`🔍 Searching localhosts with locationCode: "${locationCode}"`)

    if (!locationCode) {
      return res.status(400).json({
        message: 'locationCode is required',
      })
    }

    const normalizedCode = locationCode.toLowerCase()
    const localhosts = await Localhost.find({
      locationCode: normalizedCode,
    }).sort({ createdAt: 1 })

    console.log(
      `📊 Found ${localhosts.length} localhost(s) for code "${normalizedCode}"`
    )

    return res.status(200).json({
      count: localhosts.length,
      data: localhosts,
    })
  } catch (error) {
    console.error('Get Localhosts Error:', error)
    return res.status(500).json({
      message: 'Failed to fetch localhosts',
    })
  }
}

/**
 * Get a single Localhost by its `_id` (Admin use)
 * - Route: GET /api/hosts/admin/:id
 * - Access: Admin only
 *
 * Returns 404 when not found, or the localhost document on success.
 */
export const getLocalhostById = async (req, res) => {
  try {
    const { id } = req.params

    const localhost = await Localhost.findById(id)

    if (!localhost) {
      return res.status(404).json({
        success: false,
        message: 'Localhost not found',
      })
    }

    return res.status(200).json({
      success: true,
      data: localhost,
    })
  } catch (error) {
    console.error('Get Localhost Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch localhost',
    })
  }
}

/**
 * Create a new Localhost (Admin use)
 * - Route: POST /api/hosts/admin/create
 * - Access: Admin only
 *
 * Expected body: `{ name, email, phone, locationCode, locationName }`.
 * Validation: `name`, `locationCode`, and `locationName` are required.
 *
 * ID generation strategy (auto-generated `_id`):
 * - Normalize `locationCode` to lowercase and use the first 3 chars.
 * - Search existing hosts whose `_id` starts with that code.
 * - If none exist, start numbering at 101 (e.g., `dha101`).
 * - Otherwise increment the numeric suffix of the highest existing `_id`.
 *
 * On success returns 201 with the created document. Handles duplicate
 * key errors (MongoDB 11000) and returns an explanatory message.
 */
export const createLocalhost = async (req, res) => {
  try {
    const { name, email, phone, locationCode, locationName } = req.body

    // Validate required fields
    if (!name || !locationCode || !locationName) {
      return res.status(400).json({
        success: false,
        message: 'Name, locationCode, and locationName are required',
      })
    }

    // Normalize `locationCode` and use its first 3 characters as prefix
    const normalizedLocationCode = locationCode.toLowerCase().substring(0, 3)

    // Find existing hosts with IDs starting with the prefix and pick the
    // one with the highest `_id` so we can increment its numeric suffix.
    const existingHosts = await Localhost.find({
      _id: { $regex: `^${normalizedLocationCode}` },
    }).sort({ _id: -1 })

    // Default numeric suffix when no hosts exist yet for this location
    let newNumber = 101
    if (existingHosts.length > 0) {
      const lastId = existingHosts[0]._id // e.g., 'dha105'
      const lastNumber = parseInt(lastId.substring(3)) // parse '105'
      newNumber = lastNumber + 1 // next id number (e.g., 106)
    }

    // Compose new id like 'dha106'
    const newId = `${normalizedLocationCode}${newNumber}`

    // Create and persist the new localhost document
    const localhost = new Localhost({
      _id: newId,
      name,
      email,
      phone,
      locationCode: normalizedLocationCode,
      locationName,
    })

    await localhost.save()

    return res.status(201).json({
      success: true,
      message: 'Localhost created successfully',
      data: localhost,
    })
  } catch (error) {
    console.error('Create Localhost Error:', error)
    return res.status(500).json({
      success: false,
      message:
        error.code === 11000
          ? 'Localhost ID already exists'
          : 'Failed to create localhost',
    })
  }
}

/**
 * Update an existing Localhost (Admin use)
 * - Route: PUT /api/hosts/admin/:id
 * - Access: Admin only
 *
 * Behavior:
 * - Finds the localhost by `_id`.
 * - Updates mutable fields (`name`, `email`, `phone`, `locationName`).
 * - `_id` and `locationCode` are intentionally not modified here.
 */
export const updateLocalhost = async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, phone, locationName } = req.body

    const localhost = await Localhost.findById(id)

    if (!localhost) {
      return res.status(404).json({
        success: false,
        message: 'Localhost not found',
      })
    }

    // Update fields
    if (name) localhost.name = name
    if (email !== undefined) localhost.email = email
    if (phone !== undefined) localhost.phone = phone
    if (locationName) localhost.locationName = locationName

    await localhost.save()

    return res.status(200).json({
      success: true,
      message: 'Localhost updated successfully',
      data: localhost,
    })
  } catch (error) {
    console.error('Update Localhost Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to update localhost',
    })
  }
}

/**
 * Delete a Localhost by `_id` (Admin use)
 * - Route: DELETE /api/hosts/admin/:id
 * - Access: Admin only
 *
 * Removes the document from the database and returns a success message.
 */
export const deleteLocalhost = async (req, res) => {
  try {
    const { id } = req.params

    const localhost = await Localhost.findByIdAndDelete(id)

    if (!localhost) {
      return res.status(404).json({
        success: false,
        message: 'Localhost not found',
      })
    }

    return res.status(200).json({
      success: true,
      message: 'Localhost deleted successfully',
    })
  } catch (error) {
    console.error('Delete Localhost Error:', error)
    return res.status(500).json({
      success: false,
      message: 'Failed to delete localhost',
    })
  }
}
