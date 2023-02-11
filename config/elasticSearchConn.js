const { Client } = require("@elastic/elasticsearch");

let client = new Client({
  node: `http://${process.env.ELASTIC_NAME}:${process.env.ELASTIC_PASSWORD}@localhost:9200`,
});

module.exports = client;
