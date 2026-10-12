import express from "express";
import cors from "cors";
import "./db/database";
import taskRoutes from "./routes/task.routes";
import { USERS } from "./constants/users";

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Mini Task Manager API is running"
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

app.get("/users", (req, res) => {
  return res.status(200).json(USERS);
});