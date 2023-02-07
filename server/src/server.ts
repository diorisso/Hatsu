import express from 'express';

import { syncDatabase } from './database';

const PORT = 8080;

const app = express();

app.get('/', (_, res) => {
    res.json({message: "é o gremio"})
});

syncDatabase();

app.listen(PORT, () => console.log("server running on port " + PORT));
