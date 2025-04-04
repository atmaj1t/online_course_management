// // import Certificate from "../models/Certificate.js";

// // // const uploadCertificate = async (req, res) => {
// // //     const { name, courseId } = req.body;
// // //     const fileUrl = req.file?.path;

// // //     if (!fileUrl) return res.status(400).json({ message: "File upload failed" });

// // //     const certificate = await Certificate.create({ name, fileUrl, course: courseId, user: req.user._id });
// // //     res.status(201).json(certificate);
// // // };


// // const uploadCertificate = async (req, res) => {
// //     console.log("File received:", req.file); // Log file details
// //     console.log("Request body:", req.body); // Log other fields

// //     const { name, courseId } = req.body;
// //     const fileUrl = req.file?.path;

// //     if (!fileUrl) return res.status(400).json({ message: "File upload failed" });

// //     const certificate = await Certificate.create({
// //         name,
// //         fileUrl,
// //         course: courseId,
// //         user: req.user._id,
// //     });
// //     res.status(201).json(certificate);
// // };

// // const deleteCertificate = async (req, res) => {
// //     try {
// //         const { id } = req.params;

// //         const deletedCertificate = await Certificate.findByIdAndDelete(id);

// //         if (!deletedCertificate) {
// //             return res.status(404).json({ message: "Certificate not found" });
// //         }

// //         res.status(200).json({ message: "Certificate deleted successfully" });
// //     } catch (error) {
// //         console.error("Error deleting certificate:", error.message);
// //         res.status(500).json({ message: "Server error while deleting the certificate" });
// //     }
// // };


// // export { uploadCertificate, deleteCertificate };



// import Certificate from "../models/Certificate.js";
// import fs from "fs";

// // Upload certificate
// const uploadCertificate = async (req, res) => {
//   try {
//     const { name, courseId } = req.body;
//     const fileUrl = req.file?.path;

//     if (!fileUrl) {
//       return res.status(400).json({ message: "File upload failed" });
//     }

//     const certificate = await Certificate.create({
//       name,
//       fileUrl,
//       course: courseId,
//       user: req.user._id,
//     });

//     res.status(201).json(certificate);
//   } catch (error) {
//     console.error("Error uploading certificate:", error.message);
//     res.status(500).json({ message: "Server error while uploading certificate" });
//   }
// };


import Certificate from "../models/Certificate.js";
import fs from "fs";
// Delete certificate
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;

    const certificate = await Certificate.findById(id);
    if (!certificate) {
      return res.status(404).json({ message: "Certificate not found" });
    }

    // Delete file from the filesystem
    if (fs.existsSync(certificate.fileUrl)) {
      fs.unlinkSync(certificate.fileUrl);
    }

    await Certificate.findByIdAndDelete(id);

    res.status(200).json({ message: "Certificate deleted successfully" });
  } catch (error) {
    console.error("Error deleting certificate:", error.message);
    res.status(500).json({ message: "Server error while deleting the certificate" });
  }
};

const uploadCertificate = async (req, res) => {
  try {
    const { name, courseId, certificateLink } = req.body;
    //const fileUrl = req.file?.path;
    // When creating certificate
    const fileUrl = req.file?.path.replace(/\\/g, '/'); // Convert backslashes to forward slashes

    if (!fileUrl && !certificateLink) {
      return res.status(400).json({ message: "Provide either file or URL" });
    }

    const certificate = await Certificate.create({
      name,
      fileUrl: fileUrl || certificateLink,
      course: courseId,
      user: req.user._id,
    });

    // Return the full certificate data with population
    const populatedCert = await Certificate.findById(certificate._id)
      .populate('course')
      .populate('user', '-password');

    res.status(201).json(populatedCert);
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Server error during upload" });
  }
};

export { uploadCertificate, deleteCertificate };
