import mysql, { type Pool } from "mysql2/promise";
import secret from "../config/index.js";

const pool: Pool = await mysql.createPool({
  user: secret.DB_USER as string,
  host: secret.DB_HOST as string,
  password: secret.DB_PASSWORD as string,
  database: secret.DB_NAME as string,
});

export default pool;
