// src/scripts/migrateUsers.js

// Fungsi ini menerima koneksi db Firestore dan Mongo
async function migrateCategories(dbFirestore, dbMongo) {
  const firestoreCollectionName = 'categories';
  const mongoCollectionName = 'categories';

  console.log(`Memulai migrasi koleksi: ${firestoreCollectionName}...`);

  const collectionMongo = dbMongo.collection(mongoCollectionName);
  const snapshot = await dbFirestore.collection(firestoreCollectionName).get();

  if (snapshot.empty) {
    console.log(`Koleksi ${firestoreCollectionName} kosong.`);
    return;
  }

  const documents = [];
  snapshot.forEach(doc => {
    const data = doc.data();

    // Mengubah Firestore Timestamps menjadi JavaScript Date (PENTING!)
    // Lakukan ini untuk setiap field timestamp yang Anda miliki
    if (data.createdAt && data.createdAt.toDate) {
      data.createdAt = data.createdAt.toDate();
    }
    if (data.updatedAt && data.updatedAt.toDate) {
      data.updatedAt = data.updatedAt.toDate();
    }

    // Set _id di Mongo agar sama dengan ID dokumen di Firestore
    documents.push({ _id: doc.id, ...data });
  });

  // Hapus koleksi lama di Mongo (opsional, hati-hati!)
  try {
    await collectionMongo.deleteMany({});
    console.log(`Koleksi lama ${mongoCollectionName} di MongoDB dibersihkan.`);
  } catch (e) {
    console.warn(`Tidak bisa membersihkan koleksi ${mongoCollectionName}. Mungkin belum ada.`);
  }

  // Masukkan data baru
  const result = await collectionMongo.insertMany(documents);
  console.log(`Berhasil migrasi ${result.insertedCount} dokumen ke koleksi ${mongoCollectionName}.`);
}

module.exports = { migrateCategories };