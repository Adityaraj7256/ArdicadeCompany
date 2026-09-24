const mongoose = require("mongoose");

// ==========================================
// PAYMENT HISTORY SCHEMA
// ==========================================

const paymentSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Payment amount is required"],
      min: [0, "Payment amount cannot be negative"],
    },

    paymentDate: {
      type: Date,
      required: [true, "Payment date is required"],
    },

    paymentMethod: {
      type: String,
      enum: [
        "cash",
        "upi",
        "bank_transfer",
        "cheque",
        "card",
        "razorpay",
        "other",
      ],
      default: "bank_transfer",
    },

    transactionId: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    referenceNumber: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    note: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    receiptUrl: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
    timestamps: true,
  }
);

// ==========================================
// CLIENT SCHEMA
// ==========================================

const clientSchema = new mongoose.Schema(
  {
    // ==========================================
    // BASIC CLIENT INFORMATION
    // ==========================================

    clientName: {
      type: String,
      required: [true, "Client name is required"],
      trim: true,
      maxlength: 200,
    },

    companyName: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    contactPerson: {
      type: String,
      trim: true,
      maxlength: 200,
      default: "",
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      maxlength: 200,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    alternatePhone: {
      type: String,
      trim: true,
      maxlength: 30,
      default: "",
    },

    // ==========================================
    // CLIENT TYPE
    // ==========================================

    clientType: {
      type: String,
      enum: [
        "it",
        "construction",
        "infrastructure",
        "real_estate",
        "other",
      ],
      default: "it",
    },

    // ==========================================
    // ADDRESS
    // ==========================================

    address: {
      street: {
        type: String,
        trim: true,
        default: "",
      },

      city: {
        type: String,
        trim: true,
        default: "",
      },

      state: {
        type: String,
        trim: true,
        default: "",
      },

      country: {
        type: String,
        trim: true,
        default: "India",
      },

      pincode: {
        type: String,
        trim: true,
        default: "",
      },

      mapUrl: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // ==========================================
    // PROJECT INFORMATION
    // ==========================================

    project: {
      projectName: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },

      description: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },

      category: {
        type: String,
        enum: [
          "website",
          "software",
          "mobile_app",
          "hosting",
          "domain",
          "it_services",
          "construction",
          "infrastructure",
          "real_estate",
          "maintenance",
          "other",
        ],
        default: "website",
      },

      startDate: {
        type: Date,
        default: null,
      },

      expectedCompletionDate: {
        type: Date,
        default: null,
      },

      actualCompletionDate: {
        type: Date,
        default: null,
      },

      status: {
        type: String,
        enum: [
          "planning",
          "ongoing",
          "completed",
          "on_hold",
          "cancelled",
        ],
        default: "planning",
      },

      location: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      totalValue: {
        type: Number,
        min: 0,
        default: 0,
      },
    },

    // ==========================================
    // PAYMENT INFORMATION
    // ==========================================

    payments: {
      type: [paymentSchema],
      default: [],
    },

    // ==========================================
    // WEBSITE INFORMATION
    // ==========================================

    website: {
      hasWebsite: {
        type: Boolean,
        default: false,
      },

      url: {
        type: String,
        trim: true,
        default: "",
      },

      domainName: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },

      domainProvider: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      domainPurchaseDate: {
        type: Date,
        default: null,
      },

      domainExpiryDate: {
        type: Date,
        default: null,
      },

      domainCost: {
        type: Number,
        min: 0,
        default: 0,
      },

      autoRenewal: {
        type: Boolean,
        default: false,
      },

      sslExpiryDate: {
        type: Date,
        default: null,
      },

      businessEmail: {
        type: String,
        trim: true,
        default: "",
      },
    },

    // ==========================================
    // HOSTING INFORMATION
    // ==========================================

    hosting: {
      hasHosting: {
        type: Boolean,
        default: false,
      },

      provider: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      plan: {
        type: String,
        trim: true,
        maxlength: 200,
        default: "",
      },

      startDate: {
        type: Date,
        default: null,
      },

      expiryDate: {
        type: Date,
        default: null,
      },

      cost: {
        type: Number,
        min: 0,
        default: 0,
      },

      autoRenewal: {
        type: Boolean,
        default: false,
      },

      serverDetails: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: "",
      },

      backupEnabled: {
        type: Boolean,
        default: false,
      },
    },

    // ==========================================
    // CONSTRUCTION INFORMATION
    // ==========================================

    construction: {
      siteName: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },

      siteLocation: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
      },

      constructionType: {
        type: String,
        trim: true,
        maxlength: 300,
        default: "",
      },

      area: {
        value: {
          type: Number,
          min: 0,
          default: 0,
        },

        unit: {
          type: String,
          enum: [
            "sqft",
            "sqm",
            "sqyd",
            "acre",
            "hectare",
            "other",
          ],
          default: "sqft",
        },
      },

      contractValue: {
        type: Number,
        min: 0,
        default: 0,
      },

      materialResponsibility: {
        type: String,
        enum: [
          "client",
          "ardicade",
          "shared",
          "other",
        ],
        default: "client",
      },

      workProgress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      siteStatus: {
        type: String,
        enum: [
          "not_started",
          "in_progress",
          "paused",
          "completed",
        ],
        default: "not_started",
      },

      completionDate: {
        type: Date,
        default: null,
      },

      additionalExpenses: {
        type: Number,
        min: 0,
        default: 0,
      },

      notes: {
        type: String,
        trim: true,
        maxlength: 5000,
        default: "",
      },
    },

    // ==========================================
    // INTERNAL NOTES
    // ==========================================

    notes: {
      type: String,
      trim: true,
      maxlength: 5000,
      default: "",
    },

    // ==========================================
    // CLIENT STATUS
    // ==========================================

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "completed",
        "blacklisted",
      ],
      default: "active",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// ==========================================
// CALCULATED PAYMENT HELPERS
// ==========================================

clientSchema.virtual("totalPaid").get(function () {
  return this.payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );
});

clientSchema.virtual("remainingAmount").get(function () {
  const totalValue = Number(
    this.project?.totalValue || 0
  );

  const totalPaid = this.payments.reduce(
    (total, payment) => total + Number(payment.amount || 0),
    0
  );

  return Math.max(totalValue - totalPaid, 0);
});

clientSchema.virtual("paymentCount").get(function () {
  return this.payments.length;
});

// ==========================================
// JSON VIRTUALS
// ==========================================

clientSchema.set("toJSON", {
  virtuals: true,
});

clientSchema.set("toObject", {
  virtuals: true,
});

// ==========================================
// INDEXES
// ==========================================

clientSchema.index({
  clientName: 1,
});

clientSchema.index({
  companyName: 1,
});

clientSchema.index({
  email: 1,
});

clientSchema.index({
  clientType: 1,
});

clientSchema.index({
  status: 1,
});

clientSchema.index({
  "project.status": 1,
});

clientSchema.index({
  "website.domainExpiryDate": 1,
});

clientSchema.index({
  "hosting.expiryDate": 1,
});

// ==========================================
// MODEL
// ==========================================

const Client =
  mongoose.models.Client ||
  mongoose.model("Client", clientSchema);

module.exports = Client;