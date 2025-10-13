const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// --- ADD THIS DEBUGGING BLOCK ---
console.log("--- Cloudinary Config Check ---");
console.log("CLOUDINARY_CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  "CLOUDINARY_API_KEY (first 5 chars):",
  process.env.CLOUDINARY_API_KEY
    ? process.env.CLOUDINARY_API_KEY.substring(0, 5) + "..."
    : "NOT SET"
);
console.log(
  "CLOUDINARY_API_SECRET (first 5 chars):",
  process.env.CLOUDINARY_API_SECRET
    ? process.env.CLOUDINARY_API_SECRET.substring(0, 5) + "..."
    : "NOT SET"
);

// Attempt a tiny base64 image upload to verify configuration
cloudinary.uploader
  .upload(
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
    { public_id: "test_image_delete_me" } // Use a unique public_id
  )
  .then((result) => {
    console.log("Cloudinary test upload successful! URL:", result.secure_url);
    // You can delete this test image later from your Cloudinary dashboard
  })
  .catch((error) => {
    console.error("Cloudinary test upload FAILED! Error:", error.message);
    console.error(
      "Please double-check your CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, and CLOUDINARY_CLOUD_NAME in your .env file."
    );
  });
console.log("--- End Cloudinary Config Check ---");
// --- END DEBUGGING BLOCK ---

module.exports = cloudinary;
