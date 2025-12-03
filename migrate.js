// src/migrate.js

// Impor koneksi
const { dbFirestore } = require('./src/config/firebase');
const { connectToMongo, client } = require('./src/config/mongo');

// Impor skrip migrasi
const { migrateProducts } = require('./src/scripts/migrateProducts');
const { migrateOrders } = require('./src/scripts/migrateOrders');
const { migrateUsers } = require('./src/scripts/migrateUsers');
const { migrateStocks } = require('./src/scripts/mingrateStocks');
const { migrateGallery } = require('./src/scripts/migrateGallery');
const { migrateCategories } = require('./src/scripts/migrateCategories');
const { migrateCart } = require('./src/scripts/migrateCart');
// ... impor skrip lain

async function runMigration() {
  let mongoClient;
  try {
    // 1. Koneksi ke MongoDB
    const dbMongo = await connectToMongo();
    mongoClient = client; // Simpan referensi client untuk ditutup nanti

    console.log('--- Rozpoczynanie migracji ---');

    // 2. Jalankan skrip migrasi satu per satu
    // Kita passing (dbFirestore, dbMongo) ke setiap skrip
    await migrateProducts(dbFirestore, dbMongo);
    await migrateOrders(dbFirestore, dbMongo);
    await migrateUsers(dbFirestore, dbMongo);
    await migrateStocks(dbFirestore, dbMongo);
    await migrateGallery(dbFirestore, dbMongo);
    await migrateCategories(dbFirestore, dbMongo);
    await migrateCart(dbFirestore, dbMongo);
    // await migratePosts(dbFirestore, dbMongo); // Jalankan skrip lain
    // ... panggil skrip lain

    console.log('--- Migrasi Selesai ---');

  } catch (error) {
    console.error('Migrasi Gagal Total:', error);
  } finally {
    // 3. Tutup koneksi MongoDB
    if (mongoClient) {
      await mongoClient.close();
      console.log('Koneksi MongoDB ditutup.');
    }
  }
}

// Jalankan fungsi utama
runMigration();