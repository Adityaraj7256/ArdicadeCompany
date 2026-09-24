require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log("======================================");
      console.log(" ARDICADE BACKEND");
      console.log("======================================");
      console.log(`Port:   ${PORT}`);
      console.log(`API:    /api`);
      console.log(`Health: /api/health`);
      console.log("======================================");
    });
  } catch (error) {
    console.error(
      "Server startup failed:",
      error.message
    );

    process.exit(1);
  }
};

startServer();




// require("dotenv").config();

// const app = require("./app");
// const connectDB = require("./config/db");

// const PORT = process.env.PORT || 5000;

// const startServer = async () => {
//   try {
//     await connectDB();

//     app.listen(PORT, () => {
//       console.log("======================================");
//       console.log(" ARDICADE BACKEND");
//       console.log("======================================");
//       console.log(`Server: http://localhost:${PORT}`);
//       console.log(`API:    http://localhost:${PORT}/api`);
//       console.log(
//         `Health: http://localhost:${PORT}/api/health`
//       );
//       console.log("======================================");
//     });
//   } catch (error) {
//     console.error(
//       "Server startup failed:",
//       error.message
//     );

//     process.exit(1);
//   }
// };

// startServer();
