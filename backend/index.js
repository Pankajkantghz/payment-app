import express from 'express';
import cors from 'cors';
import rootRouter from './routes/index.js';
import { PORT } from './config.js';
import { connectDatabase } from './db.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "10kb" }));
app.use("/api/v1", rootRouter);
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: "An unexpected server error occurred" });
});

connectDatabase()
    .then(() => app.listen(PORT, () => console.log(`Server is running on port ${PORT}`)))
    .catch((error) => {
        console.error("Database startup failed:", error.message);
        process.exit(1);
    });
