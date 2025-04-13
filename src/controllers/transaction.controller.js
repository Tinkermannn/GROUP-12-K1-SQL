const transactionRepository = require('../repositories/transaction.repository');
const baseResponse = require('../utils/baseResponse.util');

exports.createTransaction = async (req, res, next) => {
    const { item_id, quantity, user_id } = req.body;

    if (!item_id || quantity === undefined || quantity === null || !user_id) {
        return baseResponse(res, false, 400, "Missing item_id, quantity, or user_id", null);
    }

    const numQuantity = parseInt(quantity);
    if (numQuantity <= 0) {
        return baseResponse(res, false, 400, "Quantity must be larger than 0", null);
    }

    try {
        const transaction = await transactionRepository.createTransaction({ item_id, quantity, user_id });
        baseResponse(res, true, 201, "Transaction created", transaction);
    } catch (error) {
        next(error); // Kirim ke global error handler
    }
};

exports.payTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionRepository.payTransaction(req.params.id);

        if (transaction.error) {
            if (transaction.error.includes("not found")) {
                return baseResponse(res, false, 404, transaction.error, null); 
            } 
            if (transaction.error.includes("insufficient")) {
                return baseResponse(res, false, 409, transaction.error, null);
            }
            return next(new Error(transaction.error)); // Anggap error tak terduga, dilempar ke global handler
        }

        baseResponse(res, true, 200, "Payment successful", transaction);
    } catch (error) {
        next(error);
    }
};

exports.deleteTransaction = async (req, res, next) => {
    try {
        const transaction = await transactionRepository.deleteTransactionById(req.params.id);
        if (transaction) {
            baseResponse(res, true, 200, "Transaction deleted", transaction);
        } else {
            baseResponse(res, false, 404, "Transaction not found", null);
        }
    } catch (error) {
        next(error);
    }
};

const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 60 }); // cache 1 menit

exports.getTransaction = async (req, res, next) => {
    try {
        const cached = cache.get("allTransactions");
        if (cached) {
            return baseResponse(res, true, 200, "Transactions (cached)", cached);
        }

        const transaction = await transactionRepository.getTransaction();
        cache.set("allTransactions", transaction);

        if (transaction.length === 0) {
            baseResponse(res, true, 200, "Transactions not found", null);
        } else {
            baseResponse(res, true, 200, "Transactions found", transaction);
        }
    } catch (error) {
        next(error);
    }
};
