const {Order} = require('../models');

// Mengambil Daftar Order
const queryOrder = async (req, res) => {

}

// Membuat order baru (Checkout)
const insertOrder = async (req, res) => {

}

// Update status order (pending / accepted / rejected)
const updateStatus = async (req, res) => {

}

// Mengembalikan stock (jika order ditolak)
const returnStock = async (req, res) => {

}

// Konfimasi pengurangan sdtock (jika order diterima)
const confirmStock = async (req, res) => {
    
}

module.exports = {queryOrder, insertOrder, updateStatus, returnStock, confirmStock};