const itemRepository = require('../repositories/item.repository');
const baseResponse = require('../utils/baseResponse.util');
const cloudinary = require('cloudinary').v2;


exports.createItem = async (req, res) => {
    try {
        let imageUrl = null;

        if (req.file) {
            const result = await cloudinary.uploader.upload_stream({ folder: 'items' }, (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return baseResponse(res, false, 500, "Gagal mengunggah gambar", null);
                }
                imageUrl = result.secure_url;
                
                itemRepository.createItem({ ...req.body, image_url: imageUrl })
                    .then(item => baseResponse(res, true, 201, "Item created", item))
                    .catch(error => baseResponse(res, false, 400, "Store doesn't exist", null));
            }).end(req.file.buffer); 
        } else {
            const item = await itemRepository.createItem(req.body);
            baseResponse(res, true, 201, "Item created", item);
        }
    } catch (error) {
        console.error("Error creating item:", error);
        baseResponse(res, false, 500, "Terjadi kesalahan saat membuat item", null);
    }
};

exports.getItem = async (req, res, next) => {
    try {
        const item = await itemRepository.getItem();
        
        if (item.length === 0) {
            return baseResponse(res, false, 404, "Items not found", null); 
        }

        baseResponse(res, true, 200, "Items found", item);
    } catch (error) {
        next(error);  // Mengarahkan error ke middleware error handler
    }
};

exports.getItemById = async (req, res, next) => {
    try {
        const item = await itemRepository.getItemById(req.params.id);

        if(item) {
            baseResponse(res, true, 200, "Item found", item);
        } else {
            baseResponse(res, false, 404, "Item not found", null);
        }
    } catch (error) {
        next(error);  // Mengarahkan error ke middleware error handler
    }
}

exports.getItemByStoreId = async (req, res, next) => {
    try {
        const item = await itemRepository.getItemByStoreId(req.params.store_id);

        if(item) {
            baseResponse(res, true, 200, "Items found", item);
        } else {
            baseResponse(res, false, 404, "Store doesn't exist", null);
        }
    } catch (error) {
        next(error);  // Mengarahkan error ke middleware error handler
    }
}



exports.updateItem = async (req, res, next) => {
    try {
        let imageUrl = null;

        if (req.file) {
            const result = await cloudinary.uploader.upload_stream({ folder: 'items' }, (error, result) => {
                if (error) {
                    console.error("Cloudinary upload error:", error);
                    return baseResponse(res, false, 500, "Gagal mengunggah gambar", null);
                }

                imageUrl = result.secure_url;

                itemRepository.updateItem({ ...req.body, image_url: imageUrl })
                    .then(item => baseResponse(res, true, 200, "Item updated", item))
                    .catch(error => next(error));  // Mengalihkan error ke middleware
            }).end(req.file.buffer); 
        } else {
            const item = await itemRepository.updateItem(req.body);
            baseResponse(res, true, 200, "Item updated", item);
        }

    } catch (error) {
        next (error);
    }
}

exports.deleteItem = async (req, res, next) => {
    try {
        const item = await itemRepository.deleteItem(req.params.id);

        if(item) {
            baseResponse(res, true, 200, "Item deleted", item);
        } else {
            baseResponse(res, false, 404, "Item not found", null);
        }
    } catch (error) {
        next (error);
    }
}