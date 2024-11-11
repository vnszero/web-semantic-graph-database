const neo4j = require('neo4j-driver');
const driver = neo4j.driver('bolt://localhost:7687', neo4j.auth.basic('neo4j', 'strongpassword123'));
const session = driver.session();

async function createNode() {
  const query = `CREATE (n:Person {name: $name, age: $age}) RETURN n`;
  const params = { name: 'Alice', age: 30 };
  const result = await session.run(query, params);
  console.log('Node created:', result.records[0].get('n'));
}

async function readNodes() {
  const query = `MATCH (n:Person) RETURN n`;
  const result = await session.run(query);
  result.records.forEach(record => {
    console.log('Found node:', record.get('n').properties);
  });
}

async function updateNode() {
  const query = `MATCH (n:Person {name: $name}) SET n.age = $newAge RETURN n`;
  const params = { name: 'Alice', newAge: 35 };
  const result = await session.run(query, params);
  console.log('Node updated:', result.records[0].get('n'));
}

async function deleteNode() {
  const query = `MATCH (n:Person {name: $name}) DELETE n`;
  const params = { name: 'Alice' };
  await session.run(query, params);
  console.log('Node deleted');
}

async function main() {
  await createNode();
  await readNodes();
  await updateNode();
  await readNodes();
  await deleteNode();
  await session.close();
  await driver.close();
}

main().catch(console.error);
