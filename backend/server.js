import express from "express";
import mongoose from "mongoose";
import path from "path";
import fs from "fs";
import cors from "cors";

const app = express();

/* ============ Middleware ============ */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ============ View Engine ============ */
app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

/* ============ MongoDB ============ */
const MONGO_URI =
  "mongodb+srv://vsowndharya2000_db_user:PDUJ5GD59QAgUHQB@cluster0.tua5tj5.mongodb.net/jobPortal?retryWrites=true&w=majority";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

/* ============ Schemas ============ */
const JobSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    location: String,
    type: String,
    salary: String
  },
  { timestamps: true }
);

const ApplicationSchema = new mongoose.Schema(
  {
    jobId: String,
    name: String,
    email: String,
    resumePath: String, // only filename
    appliedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", JobSchema);
const Application = mongoose.model("Application", ApplicationSchema);

/* ============ Uploads ============ */
const UPLOADS_FOLDER = path.join(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER);
}
app.use("/uploads", express.static(UPLOADS_FOLDER));

/* ============ Admin Dashboard ============ */
app.get("/admin", async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments();          // shows 10
    const totalApplications = await Application.countDocuments();

    const jobs = await Job.find().sort({ createdAt: -1 });
    const applications = await Application.find().sort({ appliedAt: -1 });

    res.render("adminDashboard", {
      stats: {
        totalJobs,
        totalApplications
      },
      jobs,
      applications
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Admin Dashboard Error");
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

