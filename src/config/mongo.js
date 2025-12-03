// src/config/mongo.js
require('dotenv').config(); // Memuat variabel dari .env
const { MongoClient } = require('mongodb');

const mongoUri = process.env.MONGO_URI; // Ambil dari .env
const dbName = process.env.MONGO_DB_NAME; // Ambil dari .env

console.log(mongoUri);
console.log(dbName);

if (!mongoUri || !dbName) {
  throw new Error('MONGO_URI atau MONGO_DB_NAME tidak ditemukan di .env');
}

const client = new MongoClient(mongoUri);

async function connectToMongo() {
  try {
    await client.connect();
    console.log('Terhubung ke MongoDB...');
    return client.db(dbName);
  } catch (e) {
    console.error('Gagal koneksi ke MongoDB', e);
    process.exit(1); // Keluar jika gagal koneksi
  }
}

// Ekspor fungsi koneksi dan client untuk menutupnya nanti
module.exports = { connectToMongo, client };