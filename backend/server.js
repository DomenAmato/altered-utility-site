const express = require('express');
const cors = require('cors');
const path = require('path');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // Permette al frontend di comunicare con il backend
app.use(express.json());

// Servire file statici dal frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Usare le route API
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Server avviato su http://localhost:${PORT}`);
});