const Inclusion = require("../models/inclusion");

exports.createInclusion = async (req, res) => {
  try {
    const { itemList } = req.body;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ message: "No images uploaded." });
    }

    const imageUrls = files.map((file) => file.location);

    let parsedItemList;
    try {
      parsedItemList = JSON.parse(itemList);
    } catch (err) {
      return res.status(400).json({ message: "Invalid item list format." });
    }

    const newInclusion = await Inclusion.create({
      itemList: parsedItemList,
      images: imageUrls,
    });

    return res.status(201).json({
      message: "Inclusion created successfully",
      data: newInclusion,
    });
  } catch (err) {
    console.error("Error creating inclusion:", err);
    return res.status(500).json({
      message: "Error creating inclusion",
      error: err.message,
    });
  }
};

exports.getAllInclusions = async (req, res) => {
  try {
    const inclusions = await Inclusion.find();

    if (!inclusions || inclusions.length === 0) {
      return res.status(404).json({
        message: "No inclusions found",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Inclusions retrieved successfully",
      data: inclusions,
    });
  } catch (err) {
    console.error("Error retrieving inclusions:", err);
    return res.status(500).json({
      message: "Error retrieving inclusions",
      error: err.message,
    });
  }
};

exports.getInclusionByDestination = async (req, res) => {
  try {
    const { destination } = req.params; // Get destination from request parameters

    if (!destination) {
      return res.status(400).json({ message: "Destination is required." });
    }

    const inclusions = await Inclusion.findOne({ destination });

    if (inclusions.length === 0) {
      return res
        .status(404)
        .json({ message: "No inclusions found for this destination." });
    }

    return res.status(200).json({
      message: "Inclusions retrieved successfully",
      data: inclusions,
    });
  } catch (err) {
    console.error("Error retrieving inclusions:", err);
    return res.status(500).json({
      message: "Error retrieving inclusions",
      error: err.message,
    });
  }
};
