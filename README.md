# Web Semantic Graph Database

This is a JavaScript project that uses the Neo4j graph database with the Bolt driver.

## Installation

### Required Libraries
To install the necessary libraries for the project, run the following command:

```bash
npm install neo4j-driver csv-parser fs
```

## Docker Commands to Run Neo4j Server

### Start the Services
To start the Neo4j server and other services defined in `docker-compose.yml`, use the following command:

```bash
docker-compose up -d
```

### Stop the Services
To stop the running services:

```bash
docker-compose down
```

### Rebuild the Services
To rebuild and restart the services:

```bash
docker-compose up --build -d
```

### Access Neo4j on Localhost
Once the services are running, you can access the Neo4j web interface at:

[http://localhost:7474](http://localhost:7474)

### View Logs
To view the Neo4j container logs:

```bash
docker logs neo4j
```

### View Running Docker Containers
To see the list of running Docker containers:

```bash
docker ps
```

## Bolt Commands

### Install Neo4j Driver
To install the Neo4j driver for connecting to the database using Bolt, run:

```bash
npm install neo4j-driver
```

### Connect with Bolt to Test Configuration
To test the connection with the Neo4j database, run the following command:

```bash
node connectionModel.js
```

You should see: `Connected to Neo4j`.

### CRUD Model to Test Configuration
To test the CRUD functionality, run:

```bash
node crudModel.js
```

### Project Index File
To run the index file for the project, use:

```bash
node index.js
```

## API Endpoints

### Query Endpoint
The project exposes an API endpoint to execute Cypher queries on the Neo4j database:

**Endpoint:**  
[http://localhost:3000/api/query](http://localhost:3000/api/query)

The request method should be `POST`, and the body should include the query in JSON format.

#### Example Request Body:
```json
{
    "query": "MATCH (n) RETURN n LIMIT 5"
}
```

## Recommended Queries

Here are some example Cypher queries you can use to query the database:

### Query by Public Entity
```cypher
MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
WHERE pe.name CONTAINS 'Unidade Local de Saúde da Região de Leiria'
RETURN pe, c, oc
LIMIT 200;
```

### Query by Contract
```cypher
MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
WHERE c.cpvDesignation CONTAINS 'Produtos'
RETURN pe, c, oc
LIMIT 200;
```

### Query by Other Company
```cypher
MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
WHERE oc.name CONTAINS 'Fresenius Kabi Pharma Portugal, Lda.'
RETURN pe, c, oc
LIMIT 200;
```

## Adding New Data to the Graph Database

To add new data to the Neo4j graph database, follow these steps:

### 1. Prepare the CSV File
Place your CSV file containing the data in the `contracts/` directory of the project. Ensure that the CSV file is properly formatted.

### 2. Uncomment the Import Function in `index.js`
In the `index.js` file, you will find a line that calls the `importAllCsvFiles(driver)` function. To enable the import of data, uncomment this line by removing the `//` at the beginning of the line.
