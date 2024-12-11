import cors from 'cors';
import express from 'express';
import mainRouter from "./routes/main-route.js";
const app = express();
app.use(express.json());
app.use(cors());
app.use('/', mainRouter);
export default app;
//# sourceMappingURL=server.js.map