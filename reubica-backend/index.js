import express from 'express';
import cors from 'cors';
import router from './src/routes/routes.js';
import { supabase, port } from './src/config/config.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', router);


app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
