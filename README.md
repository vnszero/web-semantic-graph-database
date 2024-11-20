# Public Procurement Analysis App

This application analyzes public procurement data for pharmaceutical products, displaying insights into the top contracted companies and their relationships with public entities.

## Features

- Display top contracted companies by public entities count or contracts count.
- View detailed public entity relationships for a selected company.

## Setup Instructions

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

### Required Backend Libraries

To install the required libraries for the backend, run:

```bash
npm install neo4j-driver csv-parser fs
```

### 1. Backend Setup
1. Clone the repository.
2. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   node server.js
   ```
   The backend server will run on `http://localhost:3000`.

---

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend/src
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   The frontend will be accessible at `http://localhost:5500`.

---

## Running the App
1. Ensure the Neo4j database is running and accessible.
2. Start both the backend and frontend as described above.
3. Open your browser and navigate to `http://localhost:5500` to use the application.



## API Endpoints

### 1. **GET /api/rank-contracted-companies-by-public-entities-count**
   - **Description**: Retrieves the top 10 contracted companies ranked by the number of public entities that issued contracts for pharmaceutical products.
   - **Response**: 
     ```json
     [
         {
             "otherCompanyName": "Company A",
             "publicEntitiesCount": 5,
             "contractsCount": 15
         },
         ...
     ]
     ```

### 2. **GET /api/rank-contracted-companies-by-contracts-count**
   - **Description**: Retrieves the top 10 contracted companies ranked by the number of contracts issued for pharmaceutical products.
   - **Response**:
     ```json
     [
         {
             "otherCompanyName": "Company B",
             "publicEntitiesCount": 3,
             "contractsCount": 20
         },
         ...
     ]
     ```

### 3. **GET /api/company-public-entities**
   - **Description**: Fetches all public entities associated with a specific company along with their contract counts.
   - **Query Parameters**:
     - `companyName` (string): The name of the company to query.
   - **Response**:
     ```json
     [
         {
             "publicEntityName": "Entity X",
             "contractCount": 10
         },
         ...
     ]
     ```

<!-- ## Recommended Queries

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
WHERE c.cpvDesignation CONTAINS 'serviço'
RETURN pe, c, oc
LIMIT 200;
```

### Query by Other Company
```cypher
MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
WHERE oc.name CONTAINS 'Fresenius Kabi Pharma Portugal, Lda.'
RETURN pe, c, oc
LIMIT 200;
``` -->

## Adding New Data to the Graph Database

To add new data to the Neo4j graph database, follow these steps:

### 1. Prepare the CSV File
Place your CSV file containing the data in the `contracts/` directory of the project. Ensure that the CSV file is properly formatted.

### 2. Uncomment the Import Function in `index.js`
In the `index.js` file, you will find a line that calls the `importAllCsvFiles(driver)` function. To enable the import of data, uncomment this line by removing the `//` at the beginning of the line.