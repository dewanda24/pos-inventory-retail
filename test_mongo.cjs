const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const tls = require('tls');
tls.DEFAULT_MAX_VERSION = 'TLSv1.2';
const { MongoClient } = require('mongodb');
const uri = "mongodb+srv://baradisini24_db_user:40AIXVjM4Dj2e8ph@cluster0.jksqt8d.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
async function run() {
  try {
    await client.connect();
    console.log("Connected successfully to server");
  } catch (err) {
    console.error("Connection failed", err);
  } finally {
    await client.close();
  }
}
run();
