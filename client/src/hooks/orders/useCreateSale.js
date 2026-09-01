import {
    useCallback,
    useState
} from "react";

import api from "../../api/axios";


// ======================================================
// API
// ======================================================

const CUSTOMER_API = "/customer";
const SALE_API = "/sale";


// ======================================================
// HELPERS
// ======================================================

function num(value) {

    const number =
        Number(value);

    return Number.isFinite(number)
        ? number
        : 0;

}


function positiveInt(value) {

    const number =
        Number(value);

    if (!Number.isFinite(number)) {
        return 0;
    }

    return Math.floor(number);

}


function normalizePhone(value) {

    const phone =
        String(value ?? "")
            .replace(/\D/g, "")
            .trim();

    return phone || null;

}


function cleanString(value) {

    return String(value ?? "")
        .trim();

}


// ======================================================
// SALE DATE / TIME
// ======================================================
//
// soldAt = วันที่ + เวลาที่ขายจริง
//
// IMPORTANT
//
// soldAt ไม่ใช่ createdAt
//
// soldAt:
//     วันที่ / เวลาที่เกิดการขายจริง
//
// createdAt:
//     วันที่ / เวลาที่สร้าง record ในระบบ
//
// Frontend สามารถส่ง:
//
//     2026-08-24T14:30
//
// หรือ:
//
//     2026-08-24T14:30:00
//
// หรือ:
//
//     2026-08-24T14:30:00+07:00
//
// ระบบจะ normalize เป็น ISO UTC
//
// ตัวอย่าง:
//
//     2026-08-24T07:30:00.000Z
//
// ซึ่งตรงกับ:
//
//     2026-08-24 14:30
//
// Asia/Bangkok
//
// ======================================================

function normalizeSoldAt(value) {

    // --------------------------------------------------
    // EMPTY
    // --------------------------------------------------

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return null;

    }


    // --------------------------------------------------
    // DATE OBJECT
    // --------------------------------------------------

    if (
        value instanceof Date
    ) {

        if (
            Number.isNaN(
                value.getTime()
            )
        ) {

            throw new Error(
                "วันที่ขายจริงไม่ถูกต้อง"
            );

        }


        return value.toISOString();

    }


    // --------------------------------------------------
    // STRING
    // --------------------------------------------------

    const stringValue =
        String(value)
            .trim();


    if (!stringValue) {

        return null;

    }


    // ==================================================
    // LOCAL DATETIME
    // ==================================================
    //
    // ถ้าเป็น:
    //
    // 2026-08-24T14:30
    //
    // หรือ:
    //
    // 2026-08-24T14:30:00
    //
    // ให้ถือว่าเป็นเวลา Bangkok (+07:00)
    //
    // ==================================================

    const localDateTimePattern =
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?$/;


    if (
        localDateTimePattern.test(
            stringValue
        )
    ) {

        const withTimezone =
            stringValue.length === 16
                ? `${stringValue}:00+07:00`
                : `${stringValue}+07:00`;


        const date =
            new Date(
                withTimezone
            );


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            throw new Error(
                "วันที่ขายจริงไม่ถูกต้อง"
            );

        }


        return date.toISOString();

    }


    // ==================================================
    // DATETIME WITH TIMEZONE
    // ==================================================

    const date =
        new Date(
            stringValue
        );


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        throw new Error(
            "วันที่ขายจริงไม่ถูกต้อง"
        );

    }


    return date.toISOString();

}


// ======================================================
// ERROR
// ======================================================

function getErrorMessage(error) {

    return (
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "ไม่สามารถสร้างรายการขายได้"
    );

}


// ======================================================
// HOOK
// ======================================================

export default function useCreateSale({
    onSuccess
} = {}) {


    // ==================================================
    // STATE
    // ==================================================

    const [
        creating,
        setCreating
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    const [
        success,
        setSuccess
    ] = useState(false);


    const [
        createdSale,
        setCreatedSale
    ] = useState(null);


    // ==================================================
    // RESET
    // ==================================================

    const resetCreateSale =
        useCallback(() => {

            setCreating(false);

            setError("");

            setSuccess(false);

            setCreatedSale(null);

        }, []);


    // ==================================================
    // CREATE SALE
    // ==================================================

    const createSale =
        useCallback(
            async ({
                customer = {},
                customerId = null,
                items = [],


                // ==================================================
                // SOLD AT
                // ==================================================
                //
                // วันที่ / เวลาที่ขายจริง
                //
                // ถ้าไม่ระบุ:
                //
                //     null
                //
                // Backend จะใช้เวลาปัจจุบัน
                //
                // ถ้าระบุ:
                //
                //     2026-08-24T14:30
                //
                // หรือ:
                //
                //     2026-08-24T14:30:00+07:00
                //
                // ==================================================

                soldAt = null,


                shippingCost = 0,

                // ----------------------------------------------
                // OTHER EXPENSE
                // ----------------------------------------------
                //
                // ค่าใช้จ่ายอื่นๆ ที่เกิดขึ้นจริงในการขายครั้งนี้
                // (นอกเหนือจากค่าส่ง) เช่น ค่าแพ็คของ ค่าธรรมเนียม ฯลฯ
                //
                // ต้องส่งต่อไปยัง backend เพื่อสร้าง Expense
                // category OTHER_SALE_COST ผูกกับ saleId
                //
                // ----------------------------------------------

                otherExpense = 0,

                discount = 0,
                note = ""

            } = {}) => {

                // ------------------------------------------
                // RESET PREVIOUS STATE
                // ------------------------------------------

                setError("");

                setSuccess(false);

                setCreatedSale(null);


                // ------------------------------------------
                // PREVENT DOUBLE SUBMIT
                // ------------------------------------------

                if (creating) {

                    return null;

                }


                try {

                    setCreating(true);


                    // ==================================================
                    // VALIDATE ITEMS
                    // ==================================================

                    if (
                        !Array.isArray(items) ||
                        items.length === 0
                    ) {

                        throw new Error(
                            "กรุณาเลือกสินค้าที่ต้องการขาย"
                        );

                    }


                    // ==================================================
                    // NORMALIZE SOLD AT
                    // ==================================================

                    const normalizedSoldAt =
                        normalizeSoldAt(
                            soldAt
                        );


                    // ==================================================
                    // NORMALIZE / VALIDATE SALE ITEMS
                    // ==================================================

                    const saleItems =
                        items.map(
                            (
                                item,
                                index
                            ) => {

                                const consignmentItemId =
                                    item?.consignmentItemId ??
                                    item?.consignmentItem?.id ??
                                    item?.productId ??
                                    item?.product?.id;


                                const quantity =
                                    positiveInt(
                                        item?.quantity
                                    );


                                const salePrice =
                                    num(
                                        item?.salePrice ??
                                        item?.actualSalePrice ??
                                        item?.price
                                    );


                                // --------------------------------------
                                // PRODUCT ID
                                // --------------------------------------

                                if (
                                    !consignmentItemId
                                ) {

                                    throw new Error(
                                        `รายการสินค้าลำดับที่ ${index + 1} ไม่มีรหัสสินค้า`
                                    );

                                }


                                // --------------------------------------
                                // QUANTITY
                                // --------------------------------------

                                if (
                                    quantity <= 0
                                ) {

                                    throw new Error(
                                        `จำนวนสินค้าของรายการที่ ${index + 1} ต้องมากกว่า 0`
                                    );

                                }


                                // --------------------------------------
                                // SALE PRICE
                                // --------------------------------------

                                if (
                                    salePrice < 0
                                ) {

                                    throw new Error(
                                        `ราคาขายของรายการที่ ${index + 1} ไม่สามารถติดลบได้`
                                    );

                                }


                                // ==================================================
                                // OPTIONAL FRONTEND STOCK VALIDATION
                                // ==================================================

                                const rawStockQuantity =
                                    item?.quantityAvailable ??
                                    item?.stockQuantity ??
                                    item?.availableQuantity ??
                                    item?.stock ??
                                    item?.consignmentItem?.quantity;


                                if (
                                    rawStockQuantity !== undefined &&
                                    rawStockQuantity !== null &&
                                    rawStockQuantity !== ""
                                ) {

                                    const stockQuantity =
                                        num(
                                            rawStockQuantity
                                        );


                                    if (
                                        quantity >
                                        stockQuantity
                                    ) {

                                        throw new Error(
                                            `สินค้า ${item?.name || "รายการนี้"} มีจำนวนคงเหลือไม่เพียงพอ`
                                        );

                                    }

                                }


                                // --------------------------------------
                                // FINAL PAYLOAD ITEM
                                // --------------------------------------

                                return {

                                    consignmentItemId:
                                        Number(
                                            consignmentItemId
                                        ),

                                    quantity,

                                    salePrice

                                };

                            }
                        );


                    // ==================================================
                    // CUSTOMER
                    // ==================================================

                    let finalCustomerId =
                        null;


                    // ==================================================
                    // EXISTING CUSTOMER
                    // ==================================================

                    if (
                        customerId !== null &&
                        customerId !== undefined &&
                        customerId !== ""
                    ) {

                        finalCustomerId =
                            Number(
                                customerId
                            );


                        if (
                            !Number.isInteger(
                                finalCustomerId
                            ) ||
                            finalCustomerId <= 0
                        ) {

                            throw new Error(
                                "ข้อมูลลูกค้าไม่ถูกต้อง"
                            );

                        }

                    }


                    // ==================================================
                    // CREATE CUSTOMER
                    // ==================================================

                    if (
                        !finalCustomerId
                    ) {

                        const customerName =
                            cleanString(
                                customer?.name
                            );


                        const customerPhone =
                            normalizePhone(
                                customer?.phone
                            );


                        const customerAddress =
                            cleanString(
                                customer?.address
                            );


                        // ----------------------------------------------
                        // CREATE ONLY WHEN REQUIRED DATA EXISTS
                        // ----------------------------------------------

                        if (
                            customerName &&
                            customerPhone &&
                            customerAddress
                        ) {

                            const customerPayload = {

                                name:
                                    customerName,

                                phone:
                                    customerPhone,

                                address:
                                    customerAddress

                            };


                            const email =
                                cleanString(
                                    customer?.email
                                );


                            const customerNote =
                                cleanString(
                                    customer?.note
                                );


                            if (
                                email
                            ) {

                                customerPayload.email =
                                    email;

                            }


                            if (
                                customerNote
                            ) {

                                customerPayload.note =
                                    customerNote;

                            }


                            const customerResponse =
                                await api.post(
                                    CUSTOMER_API,
                                    customerPayload,
                                    {
                                        withCredentials: true
                                    }
                                );


                            const createdCustomer =
                                customerResponse
                                    ?.data
                                    ?.customer ||
                                customerResponse
                                    ?.data;


                            finalCustomerId =
                                Number(
                                    createdCustomer?.id
                                );


                            if (
                                !Number.isInteger(
                                    finalCustomerId
                                ) ||
                                finalCustomerId <= 0
                            ) {

                                throw new Error(
                                    "ไม่สามารถสร้างข้อมูลลูกค้าได้"
                                );

                            }

                        }

                    }


                    // ==================================================
                    // SALE PAYLOAD
                    // ==================================================

                    const salePayload = {

                        // ----------------------------------------------
                        // CUSTOMER
                        // ----------------------------------------------

                        customerId:
                            finalCustomerId || null,


                        // ----------------------------------------------
                        // SOLD AT
                        // ----------------------------------------------
                        //
                        // สำคัญมาก
                        //
                        // นี่คือวันที่ / เวลาที่ขายจริง
                        //
                        // ไม่ใช่ createdAt
                        //
                        // ----------------------------------------------

                        soldAt:
                            normalizedSoldAt,


                        // ----------------------------------------------
                        // SALE ITEMS
                        // ----------------------------------------------

                        items:
                            saleItems,


                        // ----------------------------------------------
                        // SHIPPING
                        // ----------------------------------------------

                        shippingCost:
                            Math.max(
                                0,
                                num(
                                    shippingCost
                                )
                            ),


                        // ----------------------------------------------
                        // OTHER EXPENSE
                        // ----------------------------------------------
                        //
                        // ก่อนหน้านี้ค่านี้ถูกทิ้งกลางทาง ไม่เคยส่งไป backend
                        // ทำให้ Expense category OTHER_SALE_COST ไม่ถูกสร้าง
                        // และกำไรที่คำนวณได้ผิดพลาด — แก้แล้วในบรรทัดนี้
                        //
                        // ----------------------------------------------

                        otherExpense:
                            Math.max(
                                0,
                                num(
                                    otherExpense
                                )
                            ),


                        // ----------------------------------------------
                        // DISCOUNT
                        // ----------------------------------------------

                        discount:
                            Math.max(
                                0,
                                num(
                                    discount
                                )
                            ),


                        // ----------------------------------------------
                        // NOTE
                        // ----------------------------------------------

                        note:
                            cleanString(
                                note
                            ) || null

                    };


                    // ==================================================
                    // DEBUG
                    // ==================================================

                    console.log(
                        "CREATE SALE PAYLOAD:",
                        salePayload
                    );


                    // ==================================================
                    // CREATE SALE
                    // ==================================================

                    const saleResponse =
                        await api.post(
                            SALE_API,
                            salePayload,
                            {
                                withCredentials: true
                            }
                        );


                    // ==================================================
                    // NORMALIZE RESPONSE
                    // ==================================================

                    const responseData =
                        saleResponse?.data;


                    const sale =
                        responseData?.sale ||
                        responseData?.data ||
                        responseData;


                    // ==================================================
                    // VALIDATE RESPONSE
                    // ==================================================

                    if (
                        !sale ||
                        !sale.id
                    ) {

                        throw new Error(
                            "ระบบสร้างรายการขายสำเร็จแต่ไม่พบข้อมูล Sale ที่ส่งกลับมา"
                        );

                    }


                    // ==================================================
                    // SUCCESS
                    // ==================================================

                    setCreatedSale(
                        sale
                    );


                    setSuccess(
                        true
                    );


                    // ==================================================
                    // CALLBACK
                    // ==================================================

                    if (
                        typeof onSuccess ===
                        "function"
                    ) {

                        await onSuccess(
                            sale
                        );

                    }


                    return sale;

                }
                catch (err) {

                    console.error(
                        "CREATE SALE ERROR:",
                        err
                    );


                    const message =
                        getErrorMessage(
                            err
                        );


                    setError(
                        message
                    );


                    setSuccess(
                        false
                    );


                    setCreatedSale(
                        null
                    );


                    throw err;

                }
                finally {

                    setCreating(
                        false
                    );

                }

            },
            [
                creating,
                onSuccess
            ]
        );


    // ==================================================
    // RETURN
    // ==================================================

    return {

        creating,

        error,

        success,

        createdSale,

        createSale,

        resetCreateSale

    };

}