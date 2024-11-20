const neo4j = require('neo4j-driver');

// Create a driver instance
const driver = neo4j.driver(
  'bolt://localhost:7687',  // Bolt protocol address
  neo4j.auth.basic('neo4j', 'strongpassword123') // Username and password
);

async function connectToDB() {
  const session = driver.session();
  try {
    // Test the connection by running a simple query
    const result = await session.run('RETURN "Connected to Neo4j" AS message');
    console.log(result.records[0].get('message'));
  } catch (error) {
    console.error('Connection error:', error);
  } finally {
    await session.close();
  }
}

// Execute the function
connectToDB()
  .then(() => driver.close())
  .catch(console.error);
