import axios from "./axios"


// ======================================================
// STOCK API
// ======================================================


// ======================================================
// GET STOCKS
// ======================================================

export const getStocks = async (
    params = {}
) => {

    const response = await axios.get(
        "/stock",
        {
            params
        }
    )

    return response.data

}


// ======================================================
// GET STOCK SUMMARY
// ======================================================

export const getStockSummary = async () => {

    const response = await axios.get(
        "/stock/summary"
    )

    return response.data

}


// ======================================================
// GET STOCK BY ID
// ======================================================

export const getStock = async (
    id
) => {

    const response = await axios.get(
        `/stock/${id}`
    )

    return response.data

}


// ======================================================
// CREATE STOCK
// ======================================================

export const createStock = async (
    data
) => {

    const response = await axios.post(
        "/stock",
        data
    )

    return response.data

}


// ======================================================
// UPDATE STOCK
// ======================================================

export const updateStock = async (
    id,
    data
) => {

    const response = await axios.put(
        `/stock/${id}`,
        data
    )

    return response.data

}


// ======================================================
// DELETE STOCK
// ======================================================

export const deleteStock = async (
    id
) => {

    const response = await axios.delete(
        `/stock/${id}`
    )

    return response.data

}