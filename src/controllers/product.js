const {Product} = require('../models');

const queryProduct = async (req, res) => {
    try {
        let result = Product.find();

        const {keyword, kategori} = req.query;

        if (keyword) {
            result = result.where('nama', new RegExp(keyword, 'i'));
        }

        if (kategori) {
            result = result.where('kategori', new RegExp(kategori, 'i'));
        }

        result = await result.exec();
        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({message: 'Server Error', error: error.message});
    }
};

const querySingleProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await Product.findById(String(id)).exec();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: 'Server Error', error: error.message});
    }
};

const insertProduct = async (req, res) => {
    try {
        const productData = req.body;
        const newProduct = new Product(productData);
        const result = await newProduct.save();
        return res.status(201).json(result);
    } catch (error) {
        return res.status(500).json({message: 'Server Error', error: error.message});
    }
}

const updateProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const updateData = req.body;
        const result = await Product.findByIdAndUpdate(String(id), updateData, {new: true}).exec();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({message: 'Server Error', error: error.message});
    }
}

const updateStockProduct = async (req, res) => {

}

const deleteProduct = async (req, res) => {
    try {
        const {id} = req.params;
        const result = await Product.findByIdAndDelete(String(id)).exec();
        return res.status(200).json({message: 'Product deleted successfully', data: result});
    } catch (error) {
        return res.status(500).json({message: 'Server Error', error: error.message});
    }
}

module.exports = {queryProduct, querySingleProduct, insertProduct, updateProduct, updateStockProduct, deleteProduct};