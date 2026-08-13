const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());

// Serve static frontend files from current directory
app.use(express.static(__dirname));

// (Fallback route removed)

// Start Express Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Node Express Server running locally on port ${PORT}`);
});
