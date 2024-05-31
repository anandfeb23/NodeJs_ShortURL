const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {
    shortId: {
      type: String,
      required: true,
      unique: true,
    },
    redirectURL: {
      type: String,
      required: true,
    },
    visitHistory: [{ 
      timestamp: { 
        type: Number,
        required: true, // Ensuring each timestamp is required
      } 
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
    }
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

const URL = mongoose.model("URL", urlSchema); // Use uppercase for the model name

module.exports = URL;
