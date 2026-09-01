import axios from "./axios";


// ======================================================
// ORDERS API
// ======================================================


// ======================================================
// GET ORDERS
// ======================================================

export const getOrders = async (
    params = {}
) => {

    const res = await axios.get(
        "/orders",
        {
            params
        }
    );

    return res.data;

};


// ======================================================
// GET ORDER BY ID
// ======================================================

export const getOrder = async (
    id
) => {

    if (!id) {
        throw new Error(
            "Order ID is required"
        );
    }


    const res = await axios.get(
        `/orders/${id}`
    );


    return res.data;

};


// ======================================================
// CREATE ORDER / SALE
// ======================================================

export const createOrder = async (
    data
) => {

    const res = await axios.post(
        "/orders",
        data
    );


    return res.data;

};


// ======================================================
// UPDATE ORDER
// ======================================================

export const updateOrder = async (
    id,
    data
) => {

    if (!id) {
        throw new Error(
            "Order ID is required"
        );
    }


    const res = await axios.put(
        `/orders/${id}`,
        data
    );


    return res.data;

};


// ======================================================
// DELETE ORDER
// ======================================================

export const deleteOrder = async (
    id
) => {

    if (!id) {
        throw new Error(
            "Order ID is required"
        );
    }


    const res = await axios.delete(
        `/orders/${id}`
    );


    return res.data;

};