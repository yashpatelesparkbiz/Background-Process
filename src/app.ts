import express, {
  type Application,
  type Request,
  type Response,
} from "express";
import fs from "fs/promises";
import pool from "./database/conn.js";
import getUsers from "./utils/fakeData/faker.js";
import type { IUser } from "./modules/users/user.type.js";
import type {
  FieldPacket,
  QueryResult,
  ResultSetHeader,
  RowDataPacket,
} from "mysql2";
import {
  CHUNK_SIZE,
  DATA_GENERATION_SIZE,
  INSERT_INTERVAL,
  RECORDS_PER_PAGE,
} from "./common/constants/constant.js";

const app: Application = express();

app.set("view engine", "ejs");

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.render("index");
});

app.get("/generate", async (req: Request, res: Response) => {
  const users: IUser[] = getUsers(DATA_GENERATION_SIZE);
  await fs.writeFile("./public/data.txt", JSON.stringify(users), "utf-8");
  res.status(200).json({ message: "Data Generated Successfully", users });
});

app.post("/insert", async (req: Request, res: Response) => {
  const conn = await pool.getConnection();
  try {
    const data: string = await fs.readFile("./public/data.txt", "utf-8");
    const users: IUser[] = JSON.parse(data);
    let e: number = 1;

    const interval = setInterval(async () => {
      const usersChunk: IUser[] = users.slice(
        (e - 1) * CHUNK_SIZE,
        e * CHUNK_SIZE,
      );
      console.log(e);
      for (let i = 0; i < usersChunk.length; i++) {
        const fullName: string = usersChunk[i]?.fullName as string;
        const email: string = usersChunk[i]?.email as string;
        const info = usersChunk[i]?.info;
        if (info) {
          await pool.execute<ResultSetHeader>(
            "insert into users (full_name, email, info) values (?, ?, ?)",
            [fullName, email, info],
          );
        }
      }
      e++;
      console.log(e * CHUNK_SIZE);
      if (e * CHUNK_SIZE > users.length) {
        clearInterval(interval);
        res.status(201).json({ message: "Data Inserted Successfully" });
        console.log("hello");
        return;
      }
    }, INSERT_INTERVAL);
  } catch (error) {
  } finally {
    conn.release();
  }
});

app.get("/view", async (req: Request, res: Response) => {
  const page: number = parseInt(req.query.page as string) || 1;
  const offset: number = (page - 1) * RECORDS_PER_PAGE;

  try {
    const [users] = await pool.execute<RowDataPacket[]>(
      `select * from users limit ${offset}, ${RECORDS_PER_PAGE}`,
    );

    res.render("view", { users: users as IUser[], page });
  } catch (error) {
    console.error(error);
  }
});

export default app;
