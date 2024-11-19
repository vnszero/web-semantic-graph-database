const fs = require('fs');
const path = require('path');
const neo4j = require('neo4j-driver');
const express = require('express');
const startApi = require('./api');
const { importAllCsvFiles } = require('./importCsv');

// Connect to Neo4j
const driver = neo4j.driver(
  'bolt://localhost:7687',
  neo4j.auth.basic('neo4j', 'strongpassword123')
);

// Initialize Express app
const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Start API routes by passing the Express app and Neo4j driver
startApi(app, driver);

// Start the Express server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);

  // Only import CSV files if needed (e.g., skip if data is already in Neo4j)
  // importAllCsvFiles(driver).catch(console.error);
});