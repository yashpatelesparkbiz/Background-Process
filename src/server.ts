import app from "./app.js";
import secret from "./config/index.js";
import pool from "./database/conn.js";

pool
  .getConnection()
  .then(() => console.log("DB Connected"))
  .catch((err: Error) => console.error(err));

app.listen(secret.PORT, () => {
  console.log("PORT : " + secret.PORT);
});
