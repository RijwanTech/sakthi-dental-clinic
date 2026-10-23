
import express from "express";
import mongoose from "mongoose";
import Appointment from "../models/Appointment.js";
import { requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/appointments
// Only authenticated admins can view appointments.
router.get("/", requireAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .sort({ createdAt: -1 })
      .limit(100);

    return res.status(200).json({
      success: true,
      count: appointments.length,
      appointments,
    });
  } catch (error) {
    console.error("Fetching appointments failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve appointments.",
    });
  }
});

// POST /api/appointments
// Patients can submit appointment requests without logging in.
router.post("/", async (req, res) => {
  try {
    const {
      patientName,
      phone,
      email,
      treatment,
      appointmentDate,
      message,
    } = req.body;

    if (
      typeof patientName !== "string" ||
      !patientName.trim() ||
      typeof phone !== "string" ||
      !phone.trim() ||
      typeof treatment !== "string" ||
      !treatment.trim() ||
      !appointmentDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide name, phone, treatment and appointment date.",
      });
    }

    const date = new Date(appointmentDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid appointment date.",
      });
    }

    const appointment = await Appointment.create({
      patientName: patientName.trim(),
      phone: phone.trim(),
      email: typeof email === "string" ? email.trim() : "",
      treatment: treatment.trim(),
      appointmentDate: date,
      message: typeof message === "string" ? message.trim() : "",
    });

    return res.status(201).json({
      success: true,
      message: "Appointment request submitted successfully.",
      appointmentId: appointment._id,
    });
  } catch (error) {
    console.error("Appointment creation failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to submit appointment. Please try again.",
    });
  }
});

// PATCH /api/appointments/:id/status
// Only authenticated admins can update appointment status.
router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment ID.",
      });
    }

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Completed",
      "Cancelled",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid appointment status.",
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Appointment status updated successfully.",
      appointment,
    });
  } catch (error) {
    console.error("Status update failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to update appointment status.",
    });
  }
});

export default router;
