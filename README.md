# web-semantic-graph-database
a javascript project to use Neo4j graph database with Bolt Driver

## Docker commands to run neo4j server

### Run
docker run --name neo4j \
  -p 7474:7474 -p 7687:7687 \
  -d -e NEO4J_AUTH=neo4j/strongpassword123 \
  neo4j:5

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

### Connect with bolt
node index.js
<!-- you should see: Connected to Neo4j -->

