require("dotenv").config();
const { Client } = require("pg");
const express = require("express");

const app = express();
const PORT = 8080;

// Database connection configuration
// You'll need to update these values with your actual database credentials
const client = new Client({
  user: process.env.DB_USER || "your_username",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "your_database",
  password: process.env.DB_PASSWORD || "your_password",
  port: process.env.DB_PORT || 5432,
});

// Health check endpoint
app.get("/healthz", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    service: "postgres-test-server",
  });
});

// Start the HTTP server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/healthz`);

  // Run the database query after server starts
  connectAndQuery();
});

async function connectAndQuery() {
  try {
    // Connect to the database
    console.log("Connecting to PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    // Run SELECT query on testtable
    console.log("Querying testtable...");
    const result = await client.query("SELECT * FROM testtable");

    // Output all results
    console.log("Results from testtable:");
    console.log("Number of rows:", result.rows.length);

    if (result.rows.length > 0) {
      // Print column headers
      console.log("\nColumns:", Object.keys(result.rows[0]).join(" | "));
      console.log("-".repeat(50));

      // Print each row
      result.rows.forEach((row, index) => {
        console.log(`Row ${index + 1}:`, row);
      });
    } else {
      console.log("No rows found in testtable");
    }
  } catch (error) {
    console.error("Error:", error.message);

    // Provide helpful error messages for common issues
    if (error.code === "ECONNREFUSED") {
      console.error(
        "Could not connect to database. Make sure PostgreSQL is running and the connection details are correct."
      );
    } else if (error.code === "42P01") {
      console.error(
        'Table "testtable" does not exist. Please create the table first.'
      );
    } else if (error.code === "28P01") {
      console.error(
        "Authentication failed. Please check your username and password."
      );
    }
  } finally {
    // Close the database connection
    await client.end();
    console.log("Database connection closed.");
  }
}
