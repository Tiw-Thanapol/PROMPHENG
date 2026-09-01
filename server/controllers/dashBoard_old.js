// const prisma = require("../config/prisma");


// // ======================================================
// // TIMEZONE
// // ======================================================

// const THAILAND_TIMEZONE = "Asia/Bangkok";


// // ======================================================
// // HELPERS
// // ======================================================

// function toNumber(value) {

//     return Number(value || 0);

// }


// function round(value) {

//     return Number(
//         toNumber(value).toFixed(2)
//     );

// }


// function formatThailandDate(value) {

//     if (!value) {
//         return null;
//     }


//     const date =
//         value instanceof Date
//             ? value
//             : new Date(value);


//     if (Number.isNaN(date.getTime())) {
//         return null;
//     }


//     const parts =
//         new Intl.DateTimeFormat(
//             "en-CA",
//             {
//                 timeZone:
//                     THAILAND_TIMEZONE,

//                 year:
//                     "numeric",

//                 month:
//                     "2-digit",

//                 day:
//                     "2-digit",

//                 hour:
//                     "2-digit",

//                 minute:
//                     "2-digit",

//                 second:
//                     "2-digit",

//                 hourCycle:
//                     "h23"
//             }
//         ).formatToParts(date);


//     const map = {};


//     for (const part of parts) {

//         if (part.type !== "literal") {

//             map[part.type] =
//                 part.value;

//         }

//     }


//     return (
//         `${map.year}-${map.month}-${map.day}` +
//         `T${map.hour}:${map.minute}:${map.second}` +
//         "+07:00"
//     );

// }


// // ======================================================
// // DATE FILTER
// //
// // Frontend:
// // ?from=2026-08-01
// // ?to=2026-08-29
// //
// // ใช้ Asia/Bangkok
// // ======================================================

// function getDateFilter(req) {

//     const {
//         from,
//         to
//     } = req.query;


//     const createdAt = {};


//     if (from) {

//         const start =
//             new Date(
//                 `${from}T00:00:00.000+07:00`
//             );


//         if (
//             Number.isNaN(
//                 start.getTime()
//             )
//         ) {

//             throw new Error(
//                 "Invalid from date"
//             );

//         }


//         createdAt.gte =
//             start;

//     }


//     if (to) {

//         const end =
//             new Date(
//                 `${to}T23:59:59.999+07:00`
//             );


//         if (
//             Number.isNaN(
//                 end.getTime()
//             )
//         ) {

//             throw new Error(
//                 "Invalid to date"
//             );

//         }


//         createdAt.lte =
//             end;

//     }


//     return Object.keys(createdAt).length
//         ? { createdAt }
//         : {};

// }


// // ======================================================
// // GET RETURNED QUANTITY
// //
// // รองรับ schema ที่มี quantity
// // ถ้าไม่มี quantity จะไม่เดา
// //
// // Financial refund ใช้ refundAmount
// // ======================================================

// function getReturnedQuantity(returns) {

//     if (!Array.isArray(returns)) {
//         return 0;
//     }


//     return returns.reduce(
//         (
//             total,
//             item
//         ) => {

//             if (
//                 item?.quantity !== undefined &&
//                 item?.quantity !== null
//             ) {

//                 return (
//                     total +
//                     Math.max(
//                         0,
//                         Number(item.quantity) || 0
//                     )
//                 );

//             }


//             return total;

//         },
//         0
//     );

// }


// // ======================================================
// // GET REFUND
// // ======================================================

// function getRefundAmount(returns) {

//     if (!Array.isArray(returns)) {
//         return 0;
//     }


//     return returns.reduce(
//         (
//             total,
//             item
//         ) =>
//             total +
//             Math.max(
//                 0,
//                 toNumber(
//                     item?.refundAmount
//                 )
//             ),
//         0
//     );

// }


// // ======================================================
// // GET DASHBOARD
// // GET /api/dashboard
// // ======================================================

// exports.dashboard = async (
//     req,
//     res
// ) => {

//     try {

//         // ==================================================
//         // DATE FILTER
//         // ==================================================

//         const dateFilter =
//             getDateFilter(req);


//         // ==================================================
//         // LOAD STOCK
//         //
//         // Inventory source of truth:
//         // ConsignmentItem
//         //
//         // IMPORTANT:
//         // quantity = จำนวนจริงที่เหลือใน Lot
//         //
//         // ห้ามใช้จำนวน SaleItem แทน inventory
//         // ==================================================

//         const products =
//             await prisma.consignmentItem.findMany({

//                 select: {

//                     id:
//                         true,

//                     name:
//                         true,

//                     quantity:
//                         true,

//                     costPrice:
//                         true,

//                     status:
//                         true,

//                     purchaseDate:
//                         true,

//                     soldAt:
//                         true

//                 }

//             });


//         // ==================================================
//         // INVESTMENT
//         // ==================================================

//         const investment = {

//             total: {

//                 items:
//                     0,

//                 quantity:
//                     0,

//                 value:
//                     0

//             },

//             stock: {

//                 items:
//                     0,

//                 quantity:
//                     0,

//                 value:
//                     0

//             }

//         };


//         // ==================================================
//         // INVENTORY
//         // ==================================================

//         const inventory = {

//             available: {

//                 items:
//                     0,

//                 quantity:
//                     0,

//                 value:
//                     0

//             },

//             sold: {

//                 items:
//                     0,

//                 quantity:
//                     0,

//                 value:
//                     0

//             },

//             cancelled: {

//                 items:
//                     0,

//                 quantity:
//                     0,

//                 value:
//                     0

//             }

//         };


//         // ==================================================
//         // PROCESS STOCK
//         // ==================================================

//         for (
//             const item
//             of products
//         ) {

//             const quantity =
//                 Math.max(
//                     0,
//                     Number(
//                         item.quantity || 0
//                     )
//                 );


//             const cost =
//                 toNumber(
//                     item.costPrice
//                 );


//             const value =
//                 cost *
//                 quantity;


//             // ----------------------------------------------
//             // TOTAL INVESTMENT
//             //
//             // จำนวนเงินจริง = cost × quantity
//             // ----------------------------------------------

//             investment.total.items += 1;

//             investment.total.quantity +=
//                 quantity;

//             investment.total.value +=
//                 value;


//             // ----------------------------------------------
//             // AVAILABLE
//             // ----------------------------------------------

//             if (
//                 item.status ===
//                 "AVAILABLE"
//             ) {

//                 inventory.available.items +=
//                     1;

//                 inventory.available.quantity +=
//                     quantity;

//                 inventory.available.value +=
//                     value;

//                 investment.stock.items +=
//                     1;

//                 investment.stock.quantity +=
//                     quantity;

//                 investment.stock.value +=
//                     value;

//             }


//             // ----------------------------------------------
//             // SOLD
//             // ----------------------------------------------

//             else if (
//                 item.status ===
//                 "SOLD"
//             ) {

//                 inventory.sold.items +=
//                     1;

//                 inventory.sold.quantity +=
//                     quantity;

//                 inventory.sold.value +=
//                     value;

//             }


//             // ----------------------------------------------
//             // CANCELLED
//             // ----------------------------------------------

//             else if (
//                 item.status ===
//                 "CANCELLED"
//             ) {

//                 inventory.cancelled.items +=
//                     1;

//                 inventory.cancelled.quantity +=
//                     quantity;

//                 inventory.cancelled.value +=
//                     value;

//             }

//         }


//         // ==================================================
//         // LOAD SALES
//         //
//         // SaleItem เป็น source of truth ของยอดขาย
//         //
//         // costPriceAtSale เป็น source of truth ของต้นทุน
//         // ณ เวลาขาย
//         //
//         // ห้ามใช้:
//         // consignmentItem.costPrice
//         //
//         // เพราะ Lot อาจถูกแก้ไขภายหลัง
//         // ==================================================

//         const sales =
//             await prisma.sale.findMany({

//                 where: {

//                     status:
//                         "COMPLETED",

//                     ...dateFilter

//                 },

//                 include: {

//                     customer:
//                         true,

//                     items: {

//                         include: {

//                             consignmentItem: {

//                                 select: {

//                                     id:
//                                         true,

//                                     name:
//                                         true

//                                 }

//                             },

//                             returns:
//                                 true

//                         }

//                     },

//                     expenses:
//                         true

//                 },

//                 orderBy: {

//                     createdAt:
//                         "asc"

//                 }

//             });


//         // ==================================================
//         // SALES TOTALS
//         // ==================================================

//         let soldItems = 0;

//         let returnedItems = 0;

//         let grossSales = 0;

//         let refund = 0;

//         let cost = 0;

//         let shippingCharged = 0;

//         let shippingActual = 0;

//         let shippingProfit = 0;

//         let expense = 0;


//         // ==================================================
//         // PRODUCT MAP
//         // ==================================================

//         const productMap = {};


//         // ==================================================
//         // TREND MAP
//         // ==================================================

//         const trendMap = {};


//         // ==================================================
//         // PROCESS SALES
//         // ==================================================

//         for (
//             const sale
//             of sales
//         ) {

//             const saleDate =
//                 formatThailandDate(
//                     sale.createdAt
//                 );


//             const date =
//                 saleDate
//                     ? saleDate.slice(0, 10)
//                     : null;


//             // ----------------------------------------------
//             // TREND INIT
//             // ----------------------------------------------

//             if (
//                 date &&
//                 !trendMap[date]
//             ) {

//                 trendMap[date] = {

//                     date,

//                     items:
//                         0,

//                     quantity:
//                         0,

//                     grossSales:
//                         0,

//                     refund:
//                         0,

//                     netSales:
//                         0,

//                     cost:
//                         0,

//                     shippingCharged:
//                         0,

//                     shippingActual:
//                         0,

//                     shippingProfit:
//                         0,

//                     expense:
//                         0,

//                     profit:
//                         0

//                 };

//             }


//             // ----------------------------------------------
//             // SHIPPING
//             //
//             // ใหม่:
//             // shippingCharged
//             // shippingActual
//             //
//             // ไม่ใช้ shippingCost เป็นหลักอีกแล้ว
//             // ----------------------------------------------

//             const saleShippingCharged =
//                 toNumber(
//                     sale.shippingCharged
//                 );


//             const saleShippingActual =
//                 toNumber(
//                     sale.shippingActual
//                 );


//             const saleShippingProfit =
//                 saleShippingCharged -
//                 saleShippingActual;


//             shippingCharged +=
//                 saleShippingCharged;


//             shippingActual +=
//                 saleShippingActual;


//             shippingProfit +=
//                 saleShippingProfit;


//             // ----------------------------------------------
//             // EXPENSE
//             // ----------------------------------------------

//             const saleExpense =
//                 Array.isArray(
//                     sale.expenses
//                 )
//                     ? sale.expenses.reduce(
//                         (
//                             total,
//                             item
//                         ) =>
//                             total +
//                             toNumber(
//                                 item.amount
//                             ),
//                         0
//                     )
//                     : 0;


//             expense +=
//                 saleExpense;


//             // ----------------------------------------------
//             // TREND SHIPPING / EXPENSE
//             // ----------------------------------------------

//             if (date) {

//                 trendMap[date].shippingCharged +=
//                     saleShippingCharged;

//                 trendMap[date].shippingActual +=
//                     saleShippingActual;

//                 trendMap[date].shippingProfit +=
//                     saleShippingProfit;

//                 trendMap[date].expense +=
//                     saleExpense;

//             }


//             // ==================================================
//             // SALE ITEMS
//             // ==================================================

//             for (
//                 const item
//                 of sale.items
//             ) {

//                 const quantity =
//                     Math.max(
//                         0,
//                         Number(
//                             item.quantity || 0
//                         )
//                     );


//                 const salePrice =
//                     toNumber(
//                         item.salePrice
//                     );


//                 // ==================================================
//                 // CRITICAL
//                 //
//                 // ใช้ snapshot ต้นทุน
//                 // ==================================================

//                 const costPriceAtSale =
//                     toNumber(
//                         item.costPriceAtSale
//                     );


//                 const grossLineSales =
//                     quantity *
//                     salePrice;


//                 const productCost =
//                     quantity *
//                     costPriceAtSale;


//                 const refundAmount =
//                     getRefundAmount(
//                         item.returns
//                     );


//                 const returnedQuantity =
//                     getReturnedQuantity(
//                         item.returns
//                     );


//                 const netLineSales =
//                     Math.max(
//                         0,
//                         grossLineSales -
//                         refundAmount
//                     );


//                 // ----------------------------------------------
//                 // SOLD / RETURNED QUANTITY
//                 // ----------------------------------------------

//                 const actualSoldQuantity =
//                     Math.max(
//                         0,
//                         quantity -
//                         returnedQuantity
//                     );


//                 soldItems +=
//                     actualSoldQuantity;


//                 returnedItems +=
//                     returnedQuantity;


//                 // ----------------------------------------------
//                 // FINANCIAL
//                 // ----------------------------------------------

//                 grossSales +=
//                     grossLineSales;


//                 refund +=
//                     refundAmount;


//                 const returnedCost =
//                     returnedQuantity *
//                     costPriceAtSale;


//                 const soldCost =
//                     Math.max(
//                         0,
//                         productCost -
//                         returnedCost
//                     );


//                 cost +=
//                     soldCost;


//                 // ----------------------------------------------
//                 // PRODUCT PROFIT
//                 // ----------------------------------------------

//                 const productProfit =
//                     netLineSales -
//                     soldCost;


//                 // ==================================================
//                 // TREND
//                 // ==================================================

//                 if (date) {

//                     trendMap[date].items +=
//                         1;

//                     trendMap[date].quantity +=
//                         actualSoldQuantity;

//                     trendMap[date].grossSales +=
//                         grossLineSales;

//                     trendMap[date].refund +=
//                         refundAmount;

//                     trendMap[date].netSales +=
//                         netLineSales;

//                     trendMap[date].cost +=
//                         soldCost;

//                     trendMap[date].profit +=
//                         productProfit;

//                 }


//                 // ==================================================
//                 // PRODUCT
//                 // ==================================================

//                 const productId =
//                     item.consignmentItemId ??
//                     item.consignmentItem?.id;


//                 const productName =
//                     item.consignmentItem?.name ||
//                     `Product #${productId}`;


//                 const mapKey =
//                     String(
//                         productId ??
//                         productName
//                     );


//                 if (
//                     !productMap[mapKey]
//                 ) {

//                     productMap[mapKey] = {

//                         product: {

//                             id:
//                                 productId,

//                             name:
//                                 productName

//                         },

//                         soldItems:
//                             0,

//                         grossSales:
//                             0,

//                         refund:
//                             0,

//                         netSales:
//                             0,

//                         cost:
//                             0,

//                         profit:
//                             0

//                     };

//                 }


//                 productMap[mapKey].soldItems +=
//                     actualSoldQuantity;


//                 productMap[mapKey].grossSales +=
//                     grossLineSales;


//                 productMap[mapKey].refund +=
//                     refundAmount;


//                 productMap[mapKey].netSales +=
//                     netLineSales;


//                 productMap[mapKey].cost +=
//                     soldCost;


//                 productMap[mapKey].profit +=
//                     productProfit;

//             }

//         }


//         // ======================================================
//         // FINAL SALES CALCULATION
//         // ======================================================

//         const productNetSales =
//             grossSales -
//             refund;


//         const netSales =
//             productNetSales +
//             shippingCharged;


//         // ======================================================
//         // TOTAL COST
//         //
//         // Product cost
//         // + actual shipping
//         // + expenses
//         // ======================================================

//         const totalCost =
//             cost +
//             shippingActual +
//             expense;


//         // ======================================================
//         // FINAL PROFIT
//         //
//         // net customer revenue
//         // - actual business costs
//         //
//         // = product profit
//         // + shipping profit
//         // - expenses
//         // ======================================================

//         const profit =
//             netSales -
//             totalCost;


//         // ======================================================
//         // TOP PRODUCTS
//         // ======================================================

//         const topProducts =
//             Object.values(
//                 productMap
//             )
//                 .map(
//                     item => ({

//                         product:
//                             item.product,

//                         soldItems:
//                             item.soldItems,

//                         grossSales:
//                             round(
//                                 item.grossSales
//                             ),

//                         refund:
//                             round(
//                                 item.refund
//                             ),

//                         netSales:
//                             round(
//                                 item.netSales
//                             ),

//                         cost:
//                             round(
//                                 item.cost
//                             ),

//                         profit:
//                             round(
//                                 item.profit
//                             )

//                     })
//                 )
//                 .sort(
//                     (
//                         a,
//                         b
//                     ) =>
//                         b.netSales -
//                         a.netSales
//                 );


//         // ======================================================
//         // SALES TREND
//         // ======================================================

//         const salesTrend =
//             Object.values(
//                 trendMap
//             )
//                 .map(
//                     item => ({

//                         date:
//                             item.date,

//                         items:
//                             item.items,

//                         quantity:
//                             item.quantity,

//                         grossSales:
//                             round(
//                                 item.grossSales
//                             ),

//                         refund:
//                             round(
//                                 item.refund
//                             ),

//                         netSales:
//                             round(
//                                 item.netSales
//                             ),

//                         cost:
//                             round(
//                                 item.cost
//                             ),

//                         shippingCharged:
//                             round(
//                                 item.shippingCharged
//                             ),

//                         shippingActual:
//                             round(
//                                 item.shippingActual
//                             ),

//                         shippingProfit:
//                             round(
//                                 item.shippingProfit
//                             ),

//                         expense:
//                             round(
//                                 item.expense
//                             ),

//                         profit:
//                             round(
//                                 item.profit
//                             )

//                     })
//                 )
//                 .sort(
//                     (
//                         a,
//                         b
//                     ) =>
//                         a.date.localeCompare(
//                             b.date
//                         )
//                 );


//         // ======================================================
//         // RESPONSE
//         // ======================================================

//         return res.json({

//             filter: {

//                 from:
//                     req.query.from ||
//                     null,

//                 to:
//                     req.query.to ||
//                     null

//             },


//             // ==================================================
//             // INVESTMENT
//             // ==================================================

//             investment: {

//                 total: {

//                     items:
//                         investment.total.items,

//                     quantity:
//                         investment.total.quantity,

//                     value:
//                         round(
//                             investment.total.value
//                         )

//                 },

//                 stock: {

//                     items:
//                         investment.stock.items,

//                     quantity:
//                         investment.stock.quantity,

//                     value:
//                         round(
//                             investment.stock.value
//                         )

//                 }

//             },


//             // ==================================================
//             // SALES
//             // ==================================================

//             sales: {

//                 soldItems:
//                     soldItems,

//                 returnedItems:
//                     returnedItems,

//                 grossSales:
//                     round(
//                         grossSales
//                     ),

//                 refund:
//                     round(
//                         refund
//                     ),

//                 productNetSales:
//                     round(
//                         productNetSales
//                     ),

//                 shippingCharged:
//                     round(
//                         shippingCharged
//                     ),

//                 shippingActual:
//                     round(
//                         shippingActual
//                     ),

//                 shippingProfit:
//                     round(
//                         shippingProfit
//                     ),

//                 netSales:
//                     round(
//                         netSales
//                     ),

//                 cost:
//                     round(
//                         cost
//                     ),

//                 expense:
//                     round(
//                         expense
//                     ),

//                 totalCost:
//                     round(
//                         totalCost
//                     ),

//                 profit:
//                     round(
//                         profit
//                     )

//             },


//             // ==================================================
//             // INVENTORY
//             // ==================================================

//             inventory: {

//                 available: {

//                     items:
//                         inventory.available.items,

//                     quantity:
//                         inventory.available.quantity,

//                     value:
//                         round(
//                             inventory.available.value
//                         )

//                 },

//                 sold: {

//                     items:
//                         inventory.sold.items,

//                     quantity:
//                         inventory.sold.quantity,

//                     value:
//                         round(
//                             inventory.sold.value
//                         )

//                 },

//                 cancelled: {

//                     items:
//                         inventory.cancelled.items,

//                     quantity:
//                         inventory.cancelled.quantity,

//                     value:
//                         round(
//                             inventory.cancelled.value
//                         )

//                 }

//             },


//             // ==================================================
//             // PRODUCTS
//             // ==================================================

//             topProducts,


//             // ==================================================
//             // TREND
//             // ==================================================

//             salesTrend

//         });

//     }

//     catch (err) {

//         console.error(
//             "Dashboard Error:",
//             err
//         );


//         return res.status(500).json({

//             message:
//                 err.message ||
//                 "Dashboard Error",

//             error:
//                 err.message

//         });

//     }

// };