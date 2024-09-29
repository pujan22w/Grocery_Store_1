import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

import { app } from "./app.js";

import connectDB from "./db/index.js";


connectDB()
  .then(() => {
    app.listen(process.env.PORT || 3000, () => {
      console.log(`server is running at port :${process.env.PORT}`);
    });
    app.on("error : ", (error) => {
      console.log("error:", error);
      throw error;
      
    });
  })
  .catch((err) => {
    console.log("Mongo db conettion failede ", err);
  });

/*
(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}`);
    app.no("error", (error) => {
      console.log("Error: ", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`app is listening on port
            ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("ERROR :", error);
  }
})();
*/
