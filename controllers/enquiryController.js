const mongoose = require("mongoose");
const Enquiry = require("../models/Enquiry");

// ==========================================
// OBJECT ID VALIDATION
// ==========================================

const validateObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

// ==========================================
// EMAIL VALIDATION
// ==========================================

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
};

// ==========================================
// PUBLIC - CREATE ENQUIRY
// ==========================================

const createEnquiry = async (
  req,
  res,
  next
) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      subject,
      service,
      message,
      budget,
      source,
    } = req.body;

    // ----------------------------------------
    // NAME
    // ----------------------------------------

    if (
      !name ||
      typeof name !== "string" ||
      !name.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
      });
    }

    // ----------------------------------------
    // EMAIL
    // ----------------------------------------

    if (
      !email ||
      typeof email !== "string" ||
      !email.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email address",
      });
    }

    // ----------------------------------------
    // MESSAGE
    // ----------------------------------------

    if (
      !message ||
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ----------------------------------------
    // SOURCE
    // ----------------------------------------

    const allowedSources = [
      "contact",
      "get_quote",
      "consultation",
      "website",
      "other",
    ];

    const finalSource =
      source || "contact";

    if (
      !allowedSources.includes(
        finalSource
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry source",
      });
    }

    // ----------------------------------------
    // CREATE
    // ----------------------------------------

    const enquiry =
      await Enquiry.create({
        name: name.trim(),

        email: normalizedEmail,

        phone:
          typeof phone === "string"
            ? phone.trim()
            : "",

        company:
          typeof company === "string"
            ? company.trim()
            : "",

        subject:
          typeof subject === "string"
            ? subject.trim()
            : "",

        service:
          typeof service === "string"
            ? service.trim()
            : "",

        message: message.trim(),

        budget:
          typeof budget === "string"
            ? budget.trim()
            : "",

        source: finalSource,

        status: "new",

        priority: "medium",
      });

    return res.status(201).json({
      success: true,
      message:
        "Your enquiry has been submitted successfully. Our team will contact you soon.",
      enquiryId: enquiry._id,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET ALL ENQUIRIES
// ==========================================

const getAllEnquiries = async (
  req,
  res,
  next
) => {
  try {
    const filter = {};

    // ----------------------------------------
    // FILTER BY STATUS
    // ----------------------------------------

    if (req.query.status) {
      const allowedStatuses = [
        "new",
        "contacted",
        "in_progress",
        "converted",
        "rejected",
      ];

      if (
        !allowedStatuses.includes(
          req.query.status
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid status filter",
        });
      }

      filter.status = req.query.status;
    }

    // ----------------------------------------
    // FILTER BY PRIORITY
    // ----------------------------------------

    if (req.query.priority) {
      const allowedPriorities = [
        "low",
        "medium",
        "high",
        "urgent",
      ];

      if (
        !allowedPriorities.includes(
          req.query.priority
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid priority filter",
        });
      }

      filter.priority =
        req.query.priority;
    }

    // ----------------------------------------
    // FILTER BY SOURCE
    // ----------------------------------------

    if (req.query.source) {
      filter.source = req.query.source;
    }

    // ----------------------------------------
    // SEARCH
    // ----------------------------------------

    if (req.query.search) {
      const search =
        req.query.search.trim();

      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          email: {
            $regex: search,
            $options: "i",
          },
        },
        {
          company: {
            $regex: search,
            $options: "i",
          },
        },
        {
          subject: {
            $regex: search,
            $options: "i",
          },
        },
        {
          service: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const enquiries =
      await Enquiry.find(filter)
        .populate(
          "assignedTo",
          "name email role"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - GET SINGLE ENQUIRY
// ==========================================

const getEnquiryById = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID",
      });
    }

    const enquiry =
      await Enquiry.findById(id)
        .populate(
          "assignedTo",
          "name email role"
        )
        .lean();

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    return res.status(200).json({
      success: true,
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE ENQUIRY
// ==========================================

const updateEnquiry = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID",
      });
    }

    const enquiry =
      await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    const {
      name,
      email,
      phone,
      company,
      subject,
      service,
      message,
      budget,
      source,
      status,
      priority,
      assignedTo,
      adminNotes,
      followUpDate,
    } = req.body;

    // ----------------------------------------
    // NAME
    // ----------------------------------------

    if (name !== undefined) {
      if (
        typeof name !== "string" ||
        !name.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty",
        });
      }

      enquiry.name = name.trim();
    }

    // ----------------------------------------
    // EMAIL
    // ----------------------------------------

    if (email !== undefined) {
      if (
        typeof email !== "string" ||
        !email.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Email cannot be empty",
        });
      }

      const normalizedEmail =
        email.trim().toLowerCase();

      if (
        !isValidEmail(normalizedEmail)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid email address",
        });
      }

      enquiry.email =
        normalizedEmail;
    }

    // ----------------------------------------
    // PHONE
    // ----------------------------------------

    if (phone !== undefined) {
      enquiry.phone =
        typeof phone === "string"
          ? phone.trim()
          : "";
    }

    // ----------------------------------------
    // COMPANY
    // ----------------------------------------

    if (company !== undefined) {
      enquiry.company =
        typeof company === "string"
          ? company.trim()
          : "";
    }

    // ----------------------------------------
    // SUBJECT
    // ----------------------------------------

    if (subject !== undefined) {
      enquiry.subject =
        typeof subject === "string"
          ? subject.trim()
          : "";
    }

    // ----------------------------------------
    // SERVICE
    // ----------------------------------------

    if (service !== undefined) {
      enquiry.service =
        typeof service === "string"
          ? service.trim()
          : "";
    }

    // ----------------------------------------
    // MESSAGE
    // ----------------------------------------

    if (message !== undefined) {
      if (
        typeof message !== "string" ||
        !message.trim()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Message cannot be empty",
        });
      }

      enquiry.message =
        message.trim();
    }

    // ----------------------------------------
    // BUDGET
    // ----------------------------------------

    if (budget !== undefined) {
      enquiry.budget =
        typeof budget === "string"
          ? budget.trim()
          : "";
    }

    // ----------------------------------------
    // SOURCE
    // ----------------------------------------

    if (source !== undefined) {
      const allowedSources = [
        "contact",
        "get_quote",
        "consultation",
        "website",
        "other",
      ];

      if (
        !allowedSources.includes(source)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry source",
        });
      }

      enquiry.source = source;
    }

    // ----------------------------------------
    // STATUS
    // ----------------------------------------

    if (status !== undefined) {
      const allowedStatuses = [
        "new",
        "contacted",
        "in_progress",
        "converted",
        "rejected",
      ];

      if (
        !allowedStatuses.includes(status)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid enquiry status",
        });
      }

      enquiry.status = status;

      if (status === "contacted") {
        if (!enquiry.contactedAt) {
          enquiry.contactedAt =
            new Date();
        }
      }

      if (status === "converted") {
        if (!enquiry.convertedAt) {
          enquiry.convertedAt =
            new Date();
        }
      }

      if (status === "rejected") {
        if (!enquiry.rejectedAt) {
          enquiry.rejectedAt =
            new Date();
        }
      }
    }

    // ----------------------------------------
    // PRIORITY
    // ----------------------------------------

    if (priority !== undefined) {
      const allowedPriorities = [
        "low",
        "medium",
        "high",
        "urgent",
      ];

      if (
        !allowedPriorities.includes(
          priority
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid enquiry priority",
        });
      }

      enquiry.priority =
        priority;
    }

    // ----------------------------------------
    // ASSIGN STAFF
    // ----------------------------------------

    if (assignedTo !== undefined) {
      if (
        assignedTo !== null &&
        !validateObjectId(assignedTo)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid assigned user ID",
        });
      }

      enquiry.assignedTo =
        assignedTo || null;
    }

    // ----------------------------------------
    // ADMIN NOTES
    // ----------------------------------------

    if (adminNotes !== undefined) {
      enquiry.adminNotes =
        typeof adminNotes === "string"
          ? adminNotes.trim()
          : "";
    }

    // ----------------------------------------
    // FOLLOW UP
    // ----------------------------------------

    if (followUpDate !== undefined) {
      if (!followUpDate) {
        enquiry.followUpDate = null;
      } else {
        const parsedDate =
          new Date(followUpDate);

        if (
          Number.isNaN(
            parsedDate.getTime()
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid follow-up date",
          });
        }

        enquiry.followUpDate =
          parsedDate;
      }
    }

    await enquiry.save();

    const updatedEnquiry =
      await Enquiry.findById(id)
        .populate(
          "assignedTo",
          "name email role"
        )
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "Enquiry updated successfully",
      enquiry: updatedEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - UPDATE STATUS
// ==========================================

const updateEnquiryStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID",
      });
    }

    const allowedStatuses = [
      "new",
      "contacted",
      "in_progress",
      "converted",
      "rejected",
    ];

    if (
      !allowedStatuses.includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry status",
      });
    }

    const enquiry =
      await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    enquiry.status = status;

    if (status === "contacted") {
      enquiry.contactedAt =
        enquiry.contactedAt ||
        new Date();
    }

    if (status === "converted") {
      enquiry.convertedAt =
        enquiry.convertedAt ||
        new Date();
    }

    if (status === "rejected") {
      enquiry.rejectedAt =
        enquiry.rejectedAt ||
        new Date();
    }

    await enquiry.save();

    return res.status(200).json({
      success: true,
      message:
        "Enquiry status updated successfully",
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADMIN - DELETE ENQUIRY
// ==========================================

const deleteEnquiry = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!validateObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid enquiry ID",
      });
    }

    const enquiry =
      await Enquiry.findById(id);

    if (!enquiry) {
      return res.status(404).json({
        success: false,
        message: "Enquiry not found",
      });
    }

    await Enquiry.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Enquiry deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnquiry,
  getAllEnquiries,
  getEnquiryById,
  updateEnquiry,
  updateEnquiryStatus,
  deleteEnquiry,
};