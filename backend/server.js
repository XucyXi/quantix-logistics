import dotenv from 'dotenv';
import {createApp} from './app.js';

// Use PORT from .env as well
dotenv.config();
const app = createApp();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
