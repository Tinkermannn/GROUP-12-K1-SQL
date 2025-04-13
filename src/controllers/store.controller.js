const storeRepository = require('../repositories/store.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.getAllStores = async (req, res, next) => {
    try {
        const stores = await storeRepository.getAllStores();
        baseResponse(res, true, 200, "Stores retrieved successfully", stores);
    } catch (error) {
        next(error);
    }
};

exports.createStore = async (req, res, next) => {
    const { name, address } = req.body;

    if (!name || !address) {
        return baseResponse(res, false, 400, "Missing store name or address", null);
    }

    try {
        const store = await storeRepository.createStore(req.body);
        baseResponse(res, true, 201, "Store created successfully", store);
    } catch (error) {
        next(error);  // Error handling via next
    }
};

exports.getStorebyID = async (req, res, next) => {
    try {
        const store = await storeRepository.getStoresbyID(req.params.id);
        if (store) {
            baseResponse(res, true, 200, "Store found", store);
        } else {
            baseResponse(res, false, 404, "Store not found", null);
        }
    } catch (error) {
        next(error);  // Error handling via next
    }
};

exports.updateStore = async (req, res, next) => {
    const { id, name, address } = req.body;

    if (!id) {
        return baseResponse(res, false, 400, "Missing store ID", null);
    }

    try {
        const store = await storeRepository.updateStore(req.body);
        if (store) {
            baseResponse(res, true, 200, "Store updated successfully", store);
        } else {
            baseResponse(res, false, 404, "Store not found", null);
        }
    } catch (error) {
        next(error);  // Error handling via next
    }
};

exports.deleteStore = async (req, res, next) => {
    try {
        const store = await storeRepository.deleteStore(req.params.id);
        if (store) {
            baseResponse(res, true, 200, "Store deleted successfully", store);
        } else {
            baseResponse(res, false, 404, "Store not found", null);
        }
    } catch (error) {
        next(error);  // Error handling via next
    }
};
