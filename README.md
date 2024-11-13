# web-semantic-graph-database
a javascript project to use Neo4j graph database with Bolt Driver

## csv library
npm install neo4j-driver csv-parser fs

## Docker commands to run neo4j server

### Run
docker run --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -d -e NEO4J_AUTH=neo4j/strongpassword123 \
  -e NEO4J_PLUGINS='["apoc"]' \
  -e NEO4J_dbms_security_procedures_unrestricted=apoc.* \
  -e NEO4J_dbms_security_procedures_allowlist=apoc.* \
  neo4j:5.12.0

### Localhost
http://localhost:7474

### Stop
docker stop neo4j

### Remove
docker rm neo4j

### Logs
docker logs neo4j

### to see docker containers
docker ps

## Bolt commands

### Install
npm install neo4j-driver

### Connect with bolt to test config
node connectionModel.js
<!-- you should see: Connected to Neo4j -->

### CRUD model to test config
node crudModel.js

### project index file
node index.js

## recommended queries

### by public entity
MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
WHERE pe.name CONTAINS 'Unidade Local de Saúde da Região de Leiria'
RETURN pe, c, oc
LIMIT 200;

### by contract
MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
WHERE c.cpvDesignation CONTAINS 'serviço'
RETURN pe, c, oc
LIMIT 200;

### by other company
MATCH (pe:PublicEntity)-[:HAS_LEGAL_TENDER]->(c:Contract)-[:ASSOCIATED_WITH]->(oc:OtherCompany)
WHERE oc.name CONTAINS 'Fresenius Kabi Pharma Portugal, Lda.'
RETURN pe, c, oc
LIMIT 200;


