const mongoose = require("mongoose");
const Client = require("../models/Client");

// ==========================================
// HELPERS
// ==========================================

const isValidObjectId = (id) => {
  return mongoose.isValidObjectId(id);
};

const calculatePaymentSummary = (client) => {
  const payments = Array.isArray(client.payments)
    ? client.payments
    : [];

  const totalPaid = payments.reduce(
    (total, payment) =>
      total + Number(payment.amount || 0),
    0
  );

  const projectValue = Number(
    client.project?.totalValue || 0
  );

  const remainingAmount = Math.max(
    projectValue - totalPaid,
    0
  );

  return {
    totalValue: projectValue,
    totalPaid,
    remainingAmount,
    paymentCount: payments.length,
  };
};

// ==========================================
// GET ALL CLIENTS
// ==========================================

const getAllClients = async (req, res, next) => {
  try {
    const {
      search = "",
      clientType,
      status,
      projectStatus,
      page = 1,
      limit = 10,
    } = req.query;

    const currentPage = Math.max(
      parseInt(page, 10) || 1,
      1
    );

    const perPage = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );

    const filter = {};

    // ==========================================
    // SEARCH
    // ==========================================

    if (search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$or = [
        { clientName: searchRegex },
        { companyName: searchRegex },
        { contactPerson: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { "project.projectName": searchRegex },
      ];
    }

    // ==========================================
    // FILTERS
    // ==========================================

    if (clientType) {
      filter.clientType = clientType;
    }

    if (status) {
      filter.status = status;
    }

    if (projectStatus) {
      filter["project.status"] = projectStatus;
    }

    const skip = (currentPage - 1) * perPage;

    const [clients, total] = await Promise.all([
      Client.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage)
        .lean(),

      Client.countDocuments(filter),
    ]);

    const formattedClients = clients.map((client) => {
      const summary = calculatePaymentSummary(client);

      return {
        ...client,
        paymentSummary: summary,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Clients fetched successfully",

      data: formattedClients,

      pagination: {
        currentPage,
        totalPages: Math.ceil(total / perPage),
        totalItems: total,
        itemsPerPage: perPage,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET SINGLE CLIENT
// ==========================================

const getClientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID.",
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    const summary = calculatePaymentSummary(
      client.toObject()
    );

    return res.status(200).json({
      success: true,
      message: "Client fetched successfully",

      data: {
        ...client.toObject(),
        paymentSummary: summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CREATE CLIENT
// ==========================================

const createClient = async (req, res, next) => {
  try {
    const data = req.body || {};

    if (
      !data.clientName ||
      typeof data.clientName !== "string" ||
      !data.clientName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Client name is required.",
      });
    }

    // ==========================================
    // NORMALIZE PAYMENTS
    // ==========================================

    if (!Array.isArray(data.payments)) {
      data.payments = [];
    }

    // ==========================================
    // CREATE CLIENT
    // ==========================================

    const client = await Client.create({
      ...data,
      clientName: data.clientName.trim(),
    });

    const summary = calculatePaymentSummary(
      client.toObject()
    );

    return res.status(201).json({
      success: true,
      message: "Client created successfully",

      data: {
        ...client.toObject(),
        paymentSummary: summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE CLIENT
// ==========================================

const updateClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID.",
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    const data = req.body || {};

    // ==========================================
    // PROTECTED PAYMENT FIELD
    // ==========================================
    // Payment history ko normal client update se
    // overwrite nahi karenge.

    delete data.payments;

    // ==========================================
    // UPDATE BASIC FIELDS
    // ==========================================

    Object.keys(data).forEach((key) => {
      if (
        data[key] !== undefined &&
        key !== "_id"
      ) {
        if (
          data[key] &&
          typeof data[key] === "object" &&
          !Array.isArray(data[key]) &&
          client[key] &&
          typeof client[key] === "object"
        ) {
          Object.keys(data[key]).forEach(
            (nestedKey) => {
              client[key][nestedKey] =
                data[key][nestedKey];
            }
          );
        } else {
          client[key] = data[key];
        }
      }
    });

    await client.save();

    const summary = calculatePaymentSummary(
      client.toObject()
    );

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",

      data: {
        ...client.toObject(),
        paymentSummary: summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE CLIENT
// ==========================================

const deleteClient = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID.",
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    await Client.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// ADD PAYMENT
// ==========================================

const addPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID.",
      });
    }

    const {
      amount,
      paymentDate,
      paymentMethod,
      transactionId,
      referenceNumber,
      note,
      receiptUrl,
    } = req.body;

    // ==========================================
    // VALIDATE AMOUNT
    // ==========================================

    if (
      amount === undefined ||
      amount === null ||
      Number.isNaN(Number(amount)) ||
      Number(amount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "A valid payment amount greater than zero is required.",
      });
    }

    // ==========================================
    // VALIDATE DATE
    // ==========================================

    if (!paymentDate) {
      return res.status(400).json({
        success: false,
        message: "Payment date is required.",
      });
    }

    const parsedDate = new Date(paymentDate);

    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment date.",
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    // ==========================================
    // CHECK REMAINING AMOUNT
    // ==========================================

    const currentSummary =
      calculatePaymentSummary(client.toObject());

    const paymentAmount = Number(amount);

    if (
      currentSummary.totalValue > 0 &&
      paymentAmount > currentSummary.remainingAmount
    ) {
      return res.status(400).json({
        success: false,
        message: `Payment cannot exceed remaining amount of ₹${currentSummary.remainingAmount.toLocaleString(
          "en-IN"
        )}.`,
      });
    }

    // ==========================================
    // ADD PAYMENT
    // ==========================================

    client.payments.push({
      amount: paymentAmount,
      paymentDate: parsedDate,
      paymentMethod:
        paymentMethod || "bank_transfer",
      transactionId:
        transactionId?.trim() || "",
      referenceNumber:
        referenceNumber?.trim() || "",
      note: note?.trim() || "",
      receiptUrl:
        receiptUrl?.trim() || "",
    });

    await client.save();

    const summary = calculatePaymentSummary(
      client.toObject()
    );

    return res.status(201).json({
      success: true,
      message: "Payment added successfully",

      data: {
        ...client.toObject(),
        paymentSummary: summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE PAYMENT
// ==========================================

const updatePayment = async (req, res, next) => {
  try {
    const { id, paymentId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(paymentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid client or payment ID.",
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    const payment = client.payments.id(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    const {
      amount,
      paymentDate,
      paymentMethod,
      transactionId,
      referenceNumber,
      note,
      receiptUrl,
    } = req.body;

    // ==========================================
    // UPDATE AMOUNT
    // ==========================================

    if (amount !== undefined) {
      if (
        Number.isNaN(Number(amount)) ||
        Number(amount) <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Payment amount must be greater than zero.",
        });
      }

      payment.amount = Number(amount);
    }

    // ==========================================
    // UPDATE DATE
    // ==========================================

    if (paymentDate !== undefined) {
      const parsedDate = new Date(paymentDate);

      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment date.",
        });
      }

      payment.paymentDate = parsedDate;
    }

    // ==========================================
    // OTHER PAYMENT DETAILS
    // ==========================================

    if (paymentMethod !== undefined) {
      payment.paymentMethod = paymentMethod;
    }

    if (transactionId !== undefined) {
      payment.transactionId =
        transactionId.trim();
    }

    if (referenceNumber !== undefined) {
      payment.referenceNumber =
        referenceNumber.trim();
    }

    if (note !== undefined) {
      payment.note = note.trim();
    }

    if (receiptUrl !== undefined) {
      payment.receiptUrl =
        receiptUrl.trim();
    }

    // ==========================================
    // CHECK TOTAL
    // ==========================================

    const totalPaid = client.payments.reduce(
      (total, item) =>
        total + Number(item.amount || 0),
      0
    );

    const projectValue = Number(
      client.project?.totalValue || 0
    );

    if (
      projectValue > 0 &&
      totalPaid > projectValue
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Total payments cannot exceed the project value.",
      });
    }

    await client.save();

    const summary = calculatePaymentSummary(
      client.toObject()
    );

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",

      data: {
        ...client.toObject(),
        paymentSummary: summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// DELETE PAYMENT
// ==========================================

const deletePayment = async (req, res, next) => {
  try {
    const { id, paymentId } = req.params;

    if (
      !isValidObjectId(id) ||
      !isValidObjectId(paymentId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid client or payment ID.",
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    const payment = client.payments.id(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found.",
      });
    }

    payment.deleteOne();

    await client.save();

    const summary = calculatePaymentSummary(
      client.toObject()
    );

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",

      data: {
        ...client.toObject(),
        paymentSummary: summary,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GET PAYMENT HISTORY
// ==========================================

const getPaymentHistory = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID.",
      });
    }

    const client = await Client.findById(id)
      .select(
        "clientName companyName project.totalValue payments"
      )
      .lean();

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    const payments = [...(client.payments || [])].sort(
      (a, b) =>
        new Date(b.paymentDate) -
        new Date(a.paymentDate)
    );

    const summary = calculatePaymentSummary(client);

    return res.status(200).json({
      success: true,
      message: "Payment history fetched successfully",

      data: {
        clientName: client.clientName,
        companyName: client.companyName,
        totalValue: summary.totalValue,
        totalPaid: summary.totalPaid,
        remainingAmount:
          summary.remainingAmount,
        paymentCount: summary.paymentCount,
        payments,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// CLIENT STATISTICS
// ==========================================

const getClientStats = async (req, res, next) => {
  try {
    const [
      totalClients,
      activeClients,
      completedClients,
      ongoingProjects,
      clients,
    ] = await Promise.all([
      Client.countDocuments(),

      Client.countDocuments({
        status: "active",
      }),

      Client.countDocuments({
        status: "completed",
      }),

      Client.countDocuments({
        "project.status": "ongoing",
      }),

      Client.find({})
        .select(
          "project.totalValue payments website hosting"
        )
        .lean(),
    ]);

    let totalProjectValue = 0;
    let totalPaid = 0;
    let totalPending = 0;

    let domainExpiringSoon = 0;
    let hostingExpiringSoon = 0;

    const today = new Date();

    const thirtyDaysLater = new Date();
    thirtyDaysLater.setDate(
      thirtyDaysLater.getDate() + 30
    );

    clients.forEach((client) => {
      const projectValue = Number(
        client.project?.totalValue || 0
      );

      const paid = (client.payments || []).reduce(
        (total, payment) =>
          total + Number(payment.amount || 0),
        0
      );

      const pending = Math.max(
        projectValue - paid,
        0
      );

      totalProjectValue += projectValue;
      totalPaid += paid;
      totalPending += pending;

      // ==========================================
      // DOMAIN EXPIRY
      // ==========================================

      if (client.website?.domainExpiryDate) {
        const expiry = new Date(
          client.website.domainExpiryDate
        );

        if (
          expiry >= today &&
          expiry <= thirtyDaysLater
        ) {
          domainExpiringSoon++;
        }
      }

      // ==========================================
      // HOSTING EXPIRY
      // ==========================================

      if (client.hosting?.expiryDate) {
        const expiry = new Date(
          client.hosting.expiryDate
        );

        if (
          expiry >= today &&
          expiry <= thirtyDaysLater
        ) {
          hostingExpiringSoon++;
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: "Client statistics fetched successfully",

      data: {
        totalClients,
        activeClients,
        completedClients,
        ongoingProjects,

        totalProjectValue,
        totalPaid,
        totalPending,

        domainExpiringSoon,
        hostingExpiringSoon,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPCOMING EXPIRIES
// ==========================================

const getUpcomingExpiries = async (
  req,
  res,
  next
) => {
  try {
    const days = Math.min(
      Math.max(
        parseInt(req.query.days, 10) || 30,
        1
      ),
      365
    );

    const today = new Date();

    const futureDate = new Date();
    futureDate.setDate(
      futureDate.getDate() + days
    );

    const clients = await Client.find({
      $or: [
        {
          "website.domainExpiryDate": {
            $gte: today,
            $lte: futureDate,
          },
        },
        {
          "website.sslExpiryDate": {
            $gte: today,
            $lte: futureDate,
          },
        },
        {
          "hosting.expiryDate": {
            $gte: today,
            $lte: futureDate,
          },
        },
      ],
    })
      .select(
        "clientName companyName website hosting"
      )
      .sort({
        "website.domainExpiryDate": 1,
        "hosting.expiryDate": 1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message: "Upcoming expiries fetched successfully",

      data: clients,
      days,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// UPDATE CLIENT STATUS
// ==========================================

const updateClientStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const { status, isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid client ID.",
      });
    }

    const client = await Client.findById(id);

    if (!client) {
      return res.status(404).json({
        success: false,
        message: "Client not found.",
      });
    }

    if (status !== undefined) {
      const allowedStatuses = [
        "active",
        "inactive",
        "completed",
        "blacklisted",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid client status.",
        });
      }

      client.status = status;
    }

    if (isActive !== undefined) {
      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be a boolean.",
        });
      }

      client.isActive = isActive;
    }

    await client.save();

    return res.status(200).json({
      success: true,
      message: "Client status updated successfully",
      data: client,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,

  addPayment,
  updatePayment,
  deletePayment,
  getPaymentHistory,

  getClientStats,
  getUpcomingExpiries,

  updateClientStatus,
};