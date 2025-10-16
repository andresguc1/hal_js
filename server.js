/**
 * server.js - servidor estático mínimo para desarrollo
 */
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

// fallback al index (útil para SPAs)
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor estático corriendo en http://localhost:${PORT}`);
});
