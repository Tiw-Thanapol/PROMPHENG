// import { useEffect, useMemo, useState, useRef } from "react";

// import api from "../api/axios";

// import {
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     Tooltip,
//     CartesianGrid,
//     ResponsiveContainer,
//     Cell
// } from "recharts";

// import {
//     ShoppingBag,
//     Package,
//     Wallet,
//     TrendingUp,
//     TrendingDown,
//     Boxes,
//     CircleDollarSign,
//     PiggyBank,
//     PawPrint,
//     Sparkles,
//     AlertTriangle,
//     Lightbulb,
//     CheckCircle2,
//     CalendarDays,
//     CalendarRange,
//     CalendarClock,
//     Calendar1,
//     Infinity as InfinityIcon
// } from "lucide-react";

// import "../styles/Dashboard.css";


// // ======================================================
// // PERIOD OPTIONS
// // ======================================================

// const PERIOD_OPTIONS = [
//     {
//         value: "today",
//         label: "วันนี้",
//         icon: Calendar1
//     },

//     {
//         value: "week",
//         label: "7 วัน",
//         icon: CalendarDays
//     },

//     {
//         value: "month",
//         label: "เดือนนี้",
//         icon: CalendarRange
//     },

//     {
//         value: "year",
//         label: "ปีนี้",
//         icon: CalendarClock
//     },

//     {
//         value: "all",
//         label: "ทั้งหมด",
//         icon: InfinityIcon
//     }
// ];


// const AI_PERIOD_MAP = {
//     today: "DAY",
//     week: "WEEK",
//     month: "MONTH",
//     year: "YEAR",
//     all: "ALL"
// };


// // ======================================================
// // DASHBOARD
// // ======================================================

// function Dashboard() {

//     // ==================================================
//     // STATE
//     // ==================================================

//     const [data, setData] = useState(null);

//     const [loading, setLoading] = useState(true);

//     const [error, setError] = useState("");

//     const [period, setPeriod] = useState("today");


//     // ==================================================
//     // AI STATE
//     // ==================================================

//     const [aiResult, setAiResult] = useState(null);

//     const [aiLoading, setAiLoading] = useState(true);

//     const [aiError, setAiError] = useState("");

//     const aiRequestIdRef = useRef(0);


//     // ==================================================
//     // FETCH DASHBOARD
//     // ==================================================

//     useEffect(() => {

//         fetchDashboard();

//     }, [period]);


//     async function fetchDashboard() {

//         try {

//             setLoading(true);

//             setError("");


//             const res = await api.get(
//                 "/dashboard",
//                 {
//                     params: {
//                         period
//                     }
//                 }
//             );


//             console.log(
//                 "Dashboard Response:",
//                 res.data
//             );


//             if (
//                 !res.data ||
//                 res.data.success !== true
//             ) {

//                 throw new Error(
//                     "Dashboard response ไม่ถูกต้อง"
//                 );

//             }


//             setData(
//                 res.data
//             );

//         }
//         catch (err) {

//             console.error(
//                 "Dashboard Error:",
//                 err
//             );


//             setData(null);


//             setError(
//                 err?.response?.data?.message ||
//                 err?.message ||
//                 "ไม่สามารถโหลดข้อมูล Dashboard ได้"
//             );

//         }
//         finally {

//             setLoading(false);

//         }

//     }


//     // ==================================================
//     // FETCH AI ANALYSIS
//     // ==================================================

//     useEffect(() => {

//         fetchAIAnalysis();

//     }, [period]);


//     async function fetchAIAnalysis() {

//         const requestId =
//             ++aiRequestIdRef.current;


//         try {

//             setAiLoading(true);

//             setAiError("");


//             const res = await api.post(
//                 "/ai/analyze",
//                 {
//                     period:
//                         AI_PERIOD_MAP[period] ||
//                         "MONTH",

//                     referenceDate:
//                         new Date()
//                 }
//             );


//             console.log(
//                 "AI Analyze Response:",
//                 res.data
//             );


//             if (
//                 requestId !==
//                 aiRequestIdRef.current
//             ) {

//                 return;

//             }


//             const ai =
//                 res.data?.data?.ai;


//             if (
//                 res.data?.success !== true ||
//                 !ai
//             ) {

//                 throw new Error(
//                     "AI response ไม่ถูกต้อง"
//                 );

//             }


//             if (
//                 ai.success &&
//                 ai.data
//             ) {

//                 setAiResult(
//                     ai.data
//                 );

//             }
//             else {

//                 setAiResult({

//                     summary:
//                         "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้",

//                     strengths: [],

//                     problems: [],

//                     recommendations: []

//                 });


//                 setAiError(
//                     ai.error || ""
//                 );

//             }

//         }
//         catch (err) {

//             if (
//                 requestId !==
//                 aiRequestIdRef.current
//             ) {

//                 return;

//             }


//             console.error(
//                 "AI Analysis Error:",
//                 err
//             );


//             setAiResult({

//                 summary:
//                     "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้",

//                 strengths: [],

//                 problems: [],

//                 recommendations: []

//             });


//             setAiError(
//                 err?.response?.data?.message ||
//                 err?.message ||
//                 "เรียก AI ไม่สำเร็จ"
//             );

//         }
//         finally {

//             if (
//                 requestId ===
//                 aiRequestIdRef.current
//             ) {

//                 setAiLoading(false);

//             }

//         }

//     }


//     // ==================================================
//     // FORMAT MONEY
//     // ==================================================

//     function formatMoney(value) {

//         return Number(
//             value || 0
//         ).toLocaleString(
//             "th-TH",
//             {
//                 minimumFractionDigits: 0,
//                 maximumFractionDigits: 2
//             }
//         );

//     }


//     // ==================================================
//     // PERIOD LABEL
//     // ==================================================

//     const periodLabel = {

//         today: "วันนี้",

//         week: "7 วันล่าสุด",

//         month: "เดือนนี้",

//         year: "ปีนี้",

//         all: "ทั้งหมด"

//     };


//     // ==================================================
//     // SAFE DATA
//     // ==================================================

//     const summary =
//         data?.summary || {};

//     const inventory =
//         data?.inventory || {};

//     const investment =
//         data?.investment || {};

//     const available =
//         inventory.available || {};

//     const sold =
//         inventory.sold || {};

//     const cancelled =
//         inventory.cancelled || {};


//     // ==================================================
//     // FINANCIAL VALUES
//     // ==================================================

//     const netSales =
//         Number(
//             summary.netSales || 0
//         );

//     const grossSales =
//         Number(
//             summary.grossSales || 0
//         );

//     const totalCost =
//         Number(
//             summary.totalCost || 0
//         );

//     const productCost =
//         Number(
//             summary.productCost || 0
//         );

//     const shippingCost =
//         Number(
//             summary.shippingCost || 0
//         );

//     const expense =
//         Number(
//             summary.expense || 0
//         );

//     const refund =
//         Number(
//             summary.refund || 0
//         );

//     const profit =
//         Number(
//             summary.profit || 0
//         );

//     const isProfit =
//         profit >= 0;


//     // ==================================================
//     // CHART DATA
//     // ==================================================

//     const chartData = useMemo(() => {

//         if (
//             !Array.isArray(
//                 data?.salesTrend
//             )
//         ) {

//             return [];

//         }


//         return data.salesTrend.map(
//             item => ({

//                 ...item,

//                 netSales:
//                     Number(
//                         item?.netSales || 0
//                     ),

//                 grossSales:
//                     Number(
//                         item?.grossSales || 0
//                     ),

//                 profit:
//                     Number(
//                         item?.profit || 0
//                     ),

//                 totalCost:
//                     Number(
//                         item?.totalCost || 0
//                     )

//             })
//         );

//     }, [data]);


//     // ==================================================
//     // DATE FORMAT
//     // ==================================================

//     function formatChartDate(value) {

//         if (!value) {

//             return "";

//         }


//         const date =
//             new Date(
//                 `${value}T00:00:00`
//             );


//         if (
//             Number.isNaN(
//                 date.getTime()
//             )
//         ) {

//             return value;

//         }


//         if (
//             period === "year"
//         ) {

//             return date.toLocaleDateString(
//                 "th-TH",
//                 {
//                     month: "short"
//                 }
//             );

//         }


//         if (
//             period === "month"
//         ) {

//             return date.toLocaleDateString(
//                 "th-TH",
//                 {
//                     day: "numeric"
//                 }
//             );

//         }


//         return date.toLocaleDateString(
//             "th-TH",
//             {
//                 day: "numeric",
//                 month: "short"
//             }
//         );

//     }


//     // ==================================================
//     // METRICS
//     // ==================================================

//     const metrics = useMemo(() => {

//         if (!data) {

//             return null;

//         }


//         const orders =
//             getOrderCount(
//                 data
//             );

//         const items =
//             getItemCount(
//                 data
//             );

//         const availableItems =
//             Number(
//                 available.items || 0
//             );


//         const margin =
//             netSales > 0
//                 ? (
//                     profit /
//                     netSales
//                 ) * 100
//                 : 0;


//         return {

//             netSales,

//             grossSales,

//             totalCost,

//             profit,

//             margin,

//             orders,

//             items,

//             availableItems

//         };

//     }, [
//         data,
//         available,
//         netSales,
//         grossSales,
//         totalCost,
//         profit
//     ]);


//     // ==================================================
//     // LOADING
//     // ==================================================

//     if (loading) {

//         return (

//             <div className="dashboard-loading">

//                 <div className="dashboard-loading-bubble">

//                     <div className="loading-sparkle">
//                         ✨
//                     </div>

//                     <div className="loading-spinner" />

//                     <h3>
//                         กำลังเตรียม Dashboard
//                     </h3>

//                     <p>
//                         กำลังรวบรวมข้อมูลร้าน...
//                     </p>

//                 </div>

//             </div>

//         );

//     }


//     // ==================================================
//     // ERROR
//     // ==================================================

//     if (
//         error &&
//         !data
//     ) {

//         return (

//             <div className="dashboard-empty">

//                 <div className="empty-icon">
//                     ⚠️
//                 </div>

//                 <h2>
//                     โหลดข้อมูลไม่สำเร็จ
//                 </h2>

//                 <p>
//                     {error}
//                 </p>

//                 <button
//                     type="button"
//                     onClick={fetchDashboard}
//                     style={{
//                         marginTop: "20px",
//                         padding: "10px 20px",
//                         border: "none",
//                         borderRadius: "14px",
//                         cursor: "pointer"
//                     }}
//                 >
//                     ลองใหม่
//                 </button>

//             </div>

//         );

//     }


//     // ==================================================
//     // EMPTY
//     // ==================================================

//     if (!data) {

//         return (

//             <div className="dashboard-empty">

//                 <div className="empty-icon">
//                     🧸
//                 </div>

//                 <h2>
//                     ไม่พบข้อมูล
//                 </h2>

//                 <p>
//                     ยังไม่มีข้อมูลสำหรับแสดงผล
//                 </p>

//             </div>

//         );

//     }


//     // ==================================================
//     // RENDER
//     // ==================================================

//     return (

//         <div className="dashboard-page">


//             {/* =================================================
//                 BACKGROUND
//             ================================================= */}

//             <div
//                 className="dashboard-background"
//                 aria-hidden="true"
//             >

//                 <span className="dashboard-sparkle sparkle-one">
//                     ✦
//                 </span>

//                 <span className="dashboard-sparkle sparkle-two">
//                     ✧
//                 </span>

//                 <span className="dashboard-sparkle sparkle-three">
//                     ⋆
//                 </span>

//                 <span className="dashboard-sparkle sparkle-four">
//                     ✦
//                 </span>


//                 <div className="dashboard-cloud cloud-one">

//                     <span className="cloud-bubble bubble-a" />
//                     <span className="cloud-bubble bubble-b" />
//                     <span className="cloud-bubble bubble-c" />

//                     <span className="cloud-base" />

//                 </div>


//                 <div className="dashboard-cloud cloud-two">

//                     <span className="cloud-bubble bubble-a" />
//                     <span className="cloud-bubble bubble-b" />
//                     <span className="cloud-bubble bubble-c" />

//                     <span className="cloud-base" />

//                 </div>


//                 <div className="dashboard-tree tree-left">

//                     <div className="tree-crown crown-one" />
//                     <div className="tree-crown crown-two" />

//                     <div className="tree-trunk" />

//                 </div>


//                 <div className="dashboard-tree tree-right">

//                     <div className="tree-crown crown-one" />
//                     <div className="tree-crown crown-two" />

//                     <div className="tree-trunk" />

//                 </div>

//             </div>


//             {/* =================================================
//                 HEADER
//             ================================================= */}

//             <header className="dashboard-header">

//                 <div className="dashboard-title-row">

//                     <div className="dashboard-title-icon">
//                         ✨
//                     </div>

//                     <div>

//                         <h1>
//                             ภาพรวมร้านค้า
//                         </h1>

//                         <p>
//                             ดูสถานะเงิน สต็อก ยอดขาย และกำไรของร้าน
//                         </p>

//                     </div>

//                 </div>

//             </header>


//             {/* =================================================
//                 FINANCIAL POSITION
//             ================================================= */}

//             <section className="dashboard-section">

//                 <div className="dashboard-section-heading">

//                     <div>

//                         <h2>
//                             สถานะการเงิน
//                         </h2>

//                         <p>
//                             ภาพรวมเงินของร้านในช่วง{" "}
//                             {periodLabel[period]}
//                         </p>

//                     </div>

//                 </div>


//                 <div className="position-grid">

//                     <PositionCard
//                         icon={<Wallet size={24} />}
//                         title="ขายไปแล้ว"
//                         value={`฿${formatMoney(netSales)}`}
//                         description="เงินจากยอดขายสุทธิ"
//                         type="purple"
//                     />


//                     <PositionCard
//                         icon={
//                             isProfit
//                                 ? <TrendingUp size={24} />
//                                 : <TrendingDown size={24} />
//                         }
//                         title={
//                             isProfit
//                                 ? "กำไรสุทธิ"
//                                 : "ขาดทุนสุทธิ"
//                         }
//                         value={`฿${formatMoney(
//                             Math.abs(profit)
//                         )}`}
//                         description={
//                             isProfit
//                                 ? "เงินที่เหลือหลังหักต้นทุน"
//                                 : "ต้นทุนสูงกว่ายอดขาย"
//                         }
//                         type={
//                             isProfit
//                                 ? "green"
//                                 : "pink"
//                         }
//                     />


//                     <PositionCard
//                         icon={<PiggyBank size={24} />}
//                         title="เงินจมในสต็อก"
//                         value={`฿${formatMoney(
//                             investment.value
//                         )}`}
//                         description="มูลค่าสินค้าที่ยังอยู่ในคลัง"
//                         type="yellow"
//                     />


//                     <PositionCard
//                         icon={<CircleDollarSign size={24} />}
//                         title="ต้นทุน"
//                         value={`฿${formatMoney(
//                             totalCost
//                         )}`}
//                         description="ต้นทุนรวมในช่วงที่เลือก"
//                         type="blue"
//                     />

//                 </div>

//             </section>


//             {/* =================================================
//                 PERFORMANCE CHART
//             ================================================= */}

//             <section className="dashboard-section">

//                 <div className="trading-chart-card">

//                     <div className="trading-chart-top">

//                         <div>

//                             <div className="trading-chart-title">

//                                 <div className="trading-chart-icon">
//                                     📈
//                                 </div>

//                                 <div>

//                                     <h2>
//                                         ผลประกอบการ
//                                     </h2>

//                                     <p>
//                                         ยอดขายและกำไรในช่วง{" "}
//                                         {periodLabel[period]}
//                                     </p>

//                                 </div>

//                             </div>

//                         </div>


//                         <div
//                             className="period-tabs"
//                             role="tablist"
//                             aria-label="เลือกช่วงเวลา"
//                         >

//                             {PERIOD_OPTIONS.map(
//                                 option => {

//                                     const Icon =
//                                         option.icon;

//                                     const isActive =
//                                         period ===
//                                         option.value;


//                                     return (

//                                         <button
//                                             key={
//                                                 option.value
//                                             }
//                                             type="button"
//                                             role="tab"
//                                             aria-selected={
//                                                 isActive
//                                             }
//                                             className={
//                                                 `period-tab ${
//                                                     isActive
//                                                         ? "active"
//                                                         : ""
//                                                 }`
//                                             }
//                                             onClick={() =>
//                                                 setPeriod(
//                                                     option.value
//                                                 )
//                                             }
//                                         >

//                                             <Icon
//                                                 size={15}
//                                             />

//                                             <span>
//                                                 {
//                                                     option.label
//                                                 }
//                                             </span>

//                                         </button>

//                                     );

//                                 }
//                             )}

//                         </div>

//                     </div>


//                     <div className="chart-metrics">

//                         <ChartMetric
//                             label="ยอดขายสุทธิ"
//                             value={`฿${formatMoney(
//                                 netSales
//                             )}`}
//                             className="sales-dot"
//                         />


//                         <ChartMetric
//                             label={
//                                 isProfit
//                                     ? "กำไร"
//                                     : "ขาดทุน"
//                             }
//                             value={`${
//                                 isProfit
//                                     ? "+"
//                                     : "-"
//                             }฿${formatMoney(
//                                 Math.abs(profit)
//                             )}`}
//                             className={
//                                 isProfit
//                                     ? "profit-dot"
//                                     : "loss-dot"
//                             }
//                         />


//                         <ChartMetric
//                             label="ต้นทุน"
//                             value={`฿${formatMoney(
//                                 totalCost
//                             )}`}
//                             className="cost-dot"
//                         />

//                     </div>


//                     <div className="trading-chart-wrapper">

//                         {chartData.length > 0 ? (

//                             <ResponsiveContainer
//                                 width="100%"
//                                 height={380}
//                             >

//                                 <BarChart
//                                     data={chartData}
//                                     margin={{
//                                         top: 20,
//                                         right: 10,
//                                         left: 0,
//                                         bottom: 10
//                                     }}
//                                     barGap={5}
//                                     barCategoryGap="25%"
//                                 >

//                                     <CartesianGrid
//                                         vertical={false}
//                                         strokeDasharray="4 5"
//                                         stroke="rgba(155,126,219,.13)"
//                                     />


//                                     <XAxis
//                                         dataKey="date"
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tickFormatter={
//                                             formatChartDate
//                                         }
//                                         tick={{
//                                             fill: "#95889d",
//                                             fontSize: 12,
//                                             fontWeight: 700
//                                         }}
//                                         dy={10}
//                                     />


//                                     <YAxis
//                                         axisLine={false}
//                                         tickLine={false}
//                                         tick={{
//                                             fill: "#95889d",
//                                             fontSize: 11,
//                                             fontWeight: 600
//                                         }}
//                                         tickFormatter={
//                                             value => {

//                                                 if (
//                                                     Math.abs(
//                                                         value
//                                                     ) >= 1000
//                                                 ) {

//                                                     return `${(
//                                                         value /
//                                                         1000
//                                                     ).toFixed(0)}k`;

//                                                 }

//                                                 return value;

//                                             }
//                                         }
//                                         width={45}
//                                     />


//                                     <Tooltip
//                                         cursor={{
//                                             fill:
//                                                 "rgba(169,139,232,.07)"
//                                         }}
//                                         content={({
//                                             active,
//                                             payload,
//                                             label
//                                         }) => {

//                                             if (
//                                                 !active ||
//                                                 !payload ||
//                                                 !payload.length
//                                             ) {

//                                                 return null;

//                                             }


//                                             const sales =
//                                                 payload.find(
//                                                     item =>
//                                                         item.dataKey ===
//                                                         "netSales"
//                                                 )?.value || 0;


//                                             const chartProfit =
//                                                 payload.find(
//                                                     item =>
//                                                         item.dataKey ===
//                                                         "profit"
//                                                 )?.value || 0;


//                                             return (

//                                                 <div className="trading-tooltip">

//                                                     <div className="tooltip-date">
//                                                         {
//                                                             formatChartDate(
//                                                                 label
//                                                             )
//                                                         }
//                                                     </div>


//                                                     <div className="tooltip-line">

//                                                         <span>
//                                                             💜 ยอดขาย
//                                                         </span>

//                                                         <strong>
//                                                             ฿{formatMoney(
//                                                                 sales
//                                                             )}
//                                                         </strong>

//                                                     </div>


//                                                     <div className="tooltip-line">

//                                                         <span>
//                                                             {
//                                                                 chartProfit >=
//                                                                 0
//                                                                     ? "✨ กำไร"
//                                                                     : "🌸 ขาดทุน"
//                                                             }
//                                                         </span>

//                                                         <strong
//                                                             className={
//                                                                 chartProfit >=
//                                                                 0
//                                                                     ? "tooltip-profit"
//                                                                     : "tooltip-loss"
//                                                             }
//                                                         >

//                                                             {
//                                                                 chartProfit >=
//                                                                 0
//                                                                     ? "+"
//                                                                     : "-"
//                                                             }

//                                                             ฿{formatMoney(
//                                                                 Math.abs(
//                                                                     chartProfit
//                                                                 )
//                                                             )}

//                                                         </strong>

//                                                     </div>

//                                                 </div>

//                                             );

//                                         }}
//                                     />


//                                     <Bar
//                                         dataKey="netSales"
//                                         name="ยอดขายสุทธิ"
//                                         radius={[
//                                             10,
//                                             10,
//                                             4,
//                                             4
//                                         ]}
//                                         maxBarSize={40}
//                                         animationDuration={700}
//                                     >

//                                         {chartData.map(
//                                             (_, index) => (

//                                                 <Cell
//                                                     key={
//                                                         `sales-${index}`
//                                                     }
//                                                     fill="#A98BE8"
//                                                 />

//                                             )
//                                         )}

//                                     </Bar>


//                                     <Bar
//                                         dataKey="profit"
//                                         name="กำไร"
//                                         radius={[
//                                             10,
//                                             10,
//                                             4,
//                                             4
//                                         ]}
//                                         maxBarSize={40}
//                                         animationDuration={900}
//                                     >

//                                         {chartData.map(
//                                             (
//                                                 entry,
//                                                 index
//                                             ) => (

//                                                 <Cell
//                                                     key={
//                                                         `profit-${index}`
//                                                     }
//                                                     fill={
//                                                         entry.profit <
//                                                         0
//                                                             ? "#F3A7B8"
//                                                             : "#D7B8EE"
//                                                     }
//                                                 />

//                                             )
//                                         )}

//                                     </Bar>

//                                 </BarChart>

//                             </ResponsiveContainer>

//                         ) : (

//                             <div className="chart-empty">

//                                 <div>
//                                     📊
//                                 </div>

//                                 <strong>
//                                     ยังไม่มีข้อมูลในช่วงนี้
//                                 </strong>

//                                 <span>
//                                     เมื่อมีรายการขาย กราฟจะแสดงตรงนี้
//                                 </span>

//                             </div>

//                         )}

//                     </div>


//                     <div className="chart-legend">

//                         <div>
//                             <span className="legend-box sales" />
//                             ยอดขายสุทธิ
//                         </div>

//                         <div>
//                             <span className="legend-box profit" />
//                             กำไร
//                         </div>

//                         <div>
//                             <span className="legend-box loss" />
//                             ขาดทุน
//                         </div>

//                     </div>

//                 </div>

//             </section>


//             {/* =================================================
//                 STOCK POSITION
//             ================================================= */}

//             <section className="dashboard-section">

//                 <div className="dashboard-section-heading">

//                     <div>

//                         <h2>
//                             สถานะสินค้าในคลัง
//                         </h2>

//                         <p>
//                             เงินที่อยู่ในสินค้าและสินค้าที่เปลี่ยนเป็นยอดขายแล้ว
//                         </p>

//                     </div>

//                 </div>


//                 <div className="stock-position-grid">

//                     <StockCard
//                         icon={<Boxes size={24} />}
//                         title="สินค้าในระบบ"
//                         value={investment.items}
//                         suffix="ชิ้น"
//                         money={investment.value}
//                         description="มูลค่าสินค้าทั้งหมด"
//                         type="purple"
//                     />


//                     <StockCard
//                         icon={<Package size={24} />}
//                         title="ยังมีของ"
//                         value={available.items}
//                         suffix="ชิ้น"
//                         money={available.value}
//                         description="เงินที่ยังจมอยู่ในสต็อก"
//                         type="yellow"
//                     />


//                     <StockCard
//                         icon={<ShoppingBag size={24} />}
//                         title="ขายไปแล้ว"
//                         value={sold.items}
//                         suffix="ชิ้น"
//                         money={sold.value}
//                         description="สินค้าที่ออกจากคลังแล้ว"
//                         type="green"
//                     />

//                 </div>

//             </section>


//             {/* =================================================
//                 FINANCIAL BREAKDOWN
//             ================================================= */}

//             <section className="dashboard-section">

//                 <div className="dashboard-section-heading">

//                     <div>

//                         <h2>
//                             รายละเอียดทางการเงิน
//                         </h2>

//                         <p>
//                             เงินเข้ามาจากไหน และถูกใช้ไปกับอะไร
//                         </p>

//                     </div>

//                 </div>


//                 <div className="financial-grid">

//                     <FinancialItem
//                         icon="💰"
//                         title="ยอดขายรวม"
//                         value={grossSales}
//                         type="sales"
//                     />


//                     <FinancialItem
//                         icon="↩️"
//                         title="คืนเงิน"
//                         value={refund}
//                         type="refund"
//                     />


//                     <FinancialItem
//                         icon="💜"
//                         title="ยอดขายสุทธิ"
//                         value={netSales}
//                         type="net"
//                     />


//                     <FinancialItem
//                         icon="📦"
//                         title="ต้นทุนสินค้า"
//                         value={productCost}
//                         type="cost"
//                     />


//                     <FinancialItem
//                         icon="🚚"
//                         title="ค่าส่ง"
//                         value={shippingCost}
//                         type="shipping"
//                     />


//                     <FinancialItem
//                         icon="🧾"
//                         title="ค่าใช้จ่ายอื่น"
//                         value={expense}
//                         type="expense"
//                     />


//                     <FinancialItem
//                         icon={
//                             profit >= 0
//                                 ? "📈"
//                                 : "📉"
//                         }
//                         title={
//                             profit >= 0
//                                 ? "กำไรสุทธิ"
//                                 : "ขาดทุนสุทธิ"
//                         }
//                         value={
//                             Math.abs(
//                                 profit
//                             )
//                         }
//                         type={
//                             profit >= 0
//                                 ? "profit"
//                                 : "loss"
//                         }
//                         prefix={
//                             profit >= 0
//                                 ? "+"
//                                 : "-"
//                         }
//                     />

//                 </div>

//             </section>


//             {/* =================================================
//                 TOP PRODUCTS
//             ================================================= */}

//             <section className="dashboard-section">

//                 <div className="dashboard-section-heading">

//                     <div>

//                         <h2>
//                             สินค้าขายดี
//                         </h2>

//                         <p>
//                             สินค้าที่สร้างยอดขายสูงสุด
//                         </p>

//                     </div>

//                 </div>


//                 <div className="dashboard-panel">

//                     <div className="dashboard-table-wrapper">

//                         <table className="dashboard-table">

//                             <thead>

//                                 <tr>

//                                     <th>
//                                         สินค้า
//                                     </th>

//                                     <th>
//                                         ขาย
//                                     </th>

//                                     <th>
//                                         ยอดขาย
//                                     </th>

//                                     <th>
//                                         ต้นทุน
//                                     </th>

//                                     <th>
//                                         กำไร
//                                     </th>

//                                     <th>
//                                         Margin
//                                     </th>

//                                 </tr>

//                             </thead>


//                             <tbody>

//                                 {data.topProducts?.length > 0 ? (

//                                     data.topProducts.map(
//                                         (
//                                             item,
//                                             index
//                                         ) => (

//                                             <tr
//                                                 key={
//                                                     item.product?.id ||
//                                                     index
//                                                 }
//                                             >

//                                                 <td>
//                                                     {
//                                                         item.product?.name ||
//                                                         "-"
//                                                     }
//                                                 </td>

//                                                 <td>
//                                                     {
//                                                         item.soldItems ||
//                                                         0
//                                                     }
//                                                 </td>

//                                                 <td>
//                                                     ฿{formatMoney(
//                                                         item.grossSales
//                                                     )}
//                                                 </td>

//                                                 <td>
//                                                     ฿{formatMoney(
//                                                         item.cost
//                                                     )}
//                                                 </td>

//                                                 <td
//                                                     className={
//                                                         Number(
//                                                             item.profit ||
//                                                             0
//                                                         ) < 0
//                                                             ? "text-loss"
//                                                             : "text-profit"
//                                                     }
//                                                 >

//                                                     {
//                                                         Number(
//                                                             item.profit ||
//                                                             0
//                                                         ) < 0
//                                                             ? "-"
//                                                             : "+"
//                                                     }

//                                                     ฿{formatMoney(
//                                                         Math.abs(
//                                                             Number(
//                                                                 item.profit ||
//                                                                 0
//                                                             )
//                                                         )
//                                                     )}

//                                                 </td>

//                                                 <td>
//                                                     {
//                                                         item.margin ??
//                                                         0
//                                                     }%
//                                                 </td>

//                                             </tr>

//                                         )
//                                     )

//                                 ) : (

//                                     <tr>

//                                         <td
//                                             colSpan="6"
//                                             style={{
//                                                 textAlign:
//                                                     "center"
//                                             }}
//                                         >
//                                             ยังไม่มีข้อมูลสินค้า
//                                         </td>

//                                     </tr>

//                                 )}

//                             </tbody>

//                         </table>

//                     </div>

//                 </div>

//             </section>


//             {/* =================================================
//                 CUSTOMERS
//             ================================================= */}

//             <section className="dashboard-section">

//                 <div className="dashboard-section-heading">

//                     <div>

//                         <h2>
//                             ลูกค้ายอดซื้อสูงสุด
//                         </h2>

//                         <p>
//                             ลูกค้าที่มียอดซื้อสะสมสูงสุด
//                         </p>

//                     </div>

//                 </div>


//                 <div className="dashboard-panel">

//                     <div className="dashboard-table-wrapper">

//                         <table className="dashboard-table">

//                             <thead>

//                                 <tr>

//                                     <th>
//                                         ลูกค้า
//                                     </th>

//                                     <th>
//                                         เบอร์
//                                     </th>

//                                     <th>
//                                         Order
//                                     </th>

//                                     <th>
//                                         สินค้า
//                                     </th>

//                                     <th>
//                                         ยอดซื้อ
//                                     </th>

//                                 </tr>

//                             </thead>


//                             <tbody>

//                                 {data.topCustomers?.length > 0 ? (

//                                     data.topCustomers.map(
//                                         (
//                                             customer,
//                                             index
//                                         ) => (

//                                             <tr
//                                                 key={
//                                                     customer.phone ||
//                                                     index
//                                                 }
//                                             >

//                                                 <td>
//                                                     {
//                                                         customer.name ||
//                                                         "-"
//                                                     }
//                                                 </td>

//                                                 <td>
//                                                     {
//                                                         customer.phone ||
//                                                         "-"
//                                                     }
//                                                 </td>

//                                                 <td>
//                                                     {
//                                                         customer.orders ||
//                                                         0
//                                                     }
//                                                 </td>

//                                                 <td>
//                                                     {
//                                                         customer.items ||
//                                                         0
//                                                     }
//                                                 </td>

//                                                 <td>
//                                                     ฿{formatMoney(
//                                                         customer.total
//                                                     )}
//                                                 </td>

//                                             </tr>

//                                         )
//                                     )

//                                 ) : (

//                                     <tr>

//                                         <td
//                                             colSpan="5"
//                                             style={{
//                                                 textAlign:
//                                                     "center"
//                                             }}
//                                         >
//                                             ยังไม่มีข้อมูลลูกค้า
//                                         </td>

//                                     </tr>

//                                 )}

//                             </tbody>

//                         </table>

//                     </div>

//                 </div>

//             </section>


//             {/* =================================================
//                 AI
//             ================================================= */}

//             <AIAnalysisSection
//                 aiResult={aiResult}
//                 aiLoading={aiLoading}
//                 aiError={aiError}
//                 metrics={metrics}
//                 period={
//                     periodLabel[period]
//                 }
//                 formatMoney={formatMoney}
//             />

//         </div>

//     );

// }


// // ======================================================
// // CHART METRIC
// // ======================================================

// function ChartMetric({
//     label,
//     value,
//     className
// }) {

//     return (

//         <div className="chart-metric">

//             <span
//                 className={`metric-dot ${className}`}
//             />

//             <div>

//                 <small>
//                     {label}
//                 </small>

//                 <strong>
//                     {value}
//                 </strong>

//             </div>

//         </div>

//     );

// }


// // ======================================================
// // GET ORDER COUNT
// // ======================================================

// function getOrderCount(data) {

//     const candidates = [

//         data?.summary?.orders,

//         data?.summary?.orderCount,

//         data?.orders,

//         data?.orderCount,

//         data?.sales?.orders

//     ];


//     for (
//         const value of candidates
//     ) {

//         if (
//             value !== undefined &&
//             value !== null &&
//             !Number.isNaN(
//                 Number(value)
//             )
//         ) {

//             return Number(value);

//         }

//     }


//     return 0;

// }


// // ======================================================
// // GET ITEM COUNT
// // ======================================================

// function getItemCount(data) {

//     const candidates = [

//         data?.summary?.items,

//         data?.summary?.soldItems,

//         data?.items,

//         data?.sales?.items,

//         data?.inventory?.sold?.items

//     ];


//     for (
//         const value of candidates
//     ) {

//         if (
//             value !== undefined &&
//             value !== null &&
//             !Number.isNaN(
//                 Number(value)
//             )
//         ) {

//             return Number(value);

//         }

//     }


//     return 0;

// }


// // ======================================================
// // AI ANALYSIS
// // ======================================================

// function AIAnalysisSection({
//     aiResult,
//     aiLoading,
//     aiError,
//     metrics,
//     period,
//     formatMoney
// }) {

//     const strengths =
//         aiResult?.strengths || [];

//     const problems =
//         aiResult?.problems || [];

//     const recommendations =
//         aiResult?.recommendations || [];


//     const summaryText =
//         aiLoading
//             ? "น้องเหมียวกำลังวิเคราะห์ข้อมูลอยู่นะ รอแป๊บนึง..."
//             : (
//                 aiResult?.summary ||
//                 "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้"
//             );


//     return (

//         <section className="dashboard-section">

//             <div className="ai-analysis-wrapper">


//                 {/* HEADER */}

//                 <div className="ai-analysis-header">

//                     <div className="ai-analysis-heading">

//                         <div className="ai-analysis-icon">

//                             <PawPrint
//                                 size={28}
//                             />

//                         </div>

//                         <div>

//                             <h2>
//                                 🐱 น้องเหมียวผู้ช่วยของคุณ🐾
//                             </h2>

//                             <p>
//                                 วิเคราะห์จากข้อมูลร้านในช่วง{" "}
//                                 {period}
//                             </p>

//                         </div>

//                     </div>


//                     <div className="ai-analysis-badge">

//                         <Sparkles
//                             size={15}
//                         />

//                         AI Analysis

//                     </div>

//                 </div>


//                 {/* OVERVIEW */}

//                 <div className="ai-overview-card">

//                     <div className="ai-overview-icon">

//                         <PawPrint
//                             size={24}
//                         />

//                     </div>

//                     <div>

//                         <h3>
//                             🐾 มาดูภาพรวมกัน!
//                         </h3>

//                         <p>
//                             {summaryText}
//                         </p>

//                         {aiError && (

//                             <p className="ai-no-data">
//                                 ({aiError})
//                             </p>

//                         )}

//                     </div>

//                 </div>


//                 {/* ANALYSIS GRID */}

//                 <div className="ai-analysis-grid">


//                     {/* STRENGTHS */}

//                     <AIBox
//                         type="strength"
//                         icon={
//                             <CheckCircle2
//                                 size={21}
//                             />
//                         }
//                         title="✨ จุดแข็ง"
//                         items={strengths}
//                         loading={aiLoading}
//                         empty="ยังไม่มีข้อมูลเพียงพอ"
//                         numbered={false}
//                     />


//                     {/* PROBLEMS */}

//                     <AIBox
//                         type="problem"
//                         icon={
//                             <AlertTriangle
//                                 size={21}
//                             />
//                         }
//                         title="⚠️ สิ่งที่น้องเหมียวพบ"
//                         items={problems}
//                         loading={aiLoading}
//                         empty="ยังไม่พบปัญหาหลัก"
//                         numbered={false}
//                     />


//                     {/* RECOMMENDATIONS */}

//                     <AIBox
//                         type="recommendation"
//                         icon={
//                             <Lightbulb
//                                 size={21}
//                             />
//                         }
//                         title="💡 น้องเหมียวแนะนำว่า"
//                         items={recommendations}
//                         loading={aiLoading}
//                         empty="ยังไม่มีคำแนะนำ"
//                         numbered={true}
//                     />

//                 </div>


//                 {/* METRICS */}

//                 {metrics && (

//                     <div className="ai-analysis-metrics">

//                         <AIMetric
//                             label="ยอดขายสุทธิ"
//                             value={`฿${formatMoney(
//                                 metrics.netSales
//                             )}`}
//                         />


//                         <AIMetric
//                             label="ออเดอร์"
//                             value={
//                                 metrics.orders
//                             }
//                         />


//                         <AIMetric
//                             label="สินค้าที่ขาย"
//                             value={
//                                 metrics.items
//                             }
//                         />


//                         <AIMetric
//                             label="Margin"
//                             value={
//                                 `${metrics.margin.toFixed(
//                                     2
//                                 )}%`
//                             }
//                         />


//                         <AIMetric
//                             label="กำไรสุทธิ"
//                             value={
//                                 `${
//                                     metrics.profit >= 0
//                                         ? "+"
//                                         : "-"
//                                 }฿${formatMoney(
//                                     Math.abs(
//                                         metrics.profit
//                                     )
//                                 )}`
//                             }
//                             className={
//                                 metrics.profit >= 0
//                                     ? "ai-profit"
//                                     : "ai-loss"
//                             }
//                         />


//                         <AIMetric
//                             label="สต็อกคงเหลือ"
//                             value={
//                                 `${metrics.availableItems} ชิ้น`
//                             }
//                         />

//                     </div>

//                 )}

//             </div>

//         </section>

//     );

// }


// // ======================================================
// // AI BOX
// // ======================================================

// function AIBox({
//     type,
//     icon,
//     title,
//     items,
//     loading,
//     empty,
//     numbered
// }) {

//     return (

//         <div
//             className={
//                 `ai-analysis-box ${type}`
//             }
//         >

//             <div className="ai-box-title">

//                 <div className="ai-box-icon">
//                     {icon}
//                 </div>

//                 <h3>
//                     {title}
//                 </h3>

//             </div>


//             {items.length > 0 ? (

//                 numbered ? (

//                     <ol>

//                         {items.map(
//                             (
//                                 item,
//                                 index
//                             ) => (

//                                 <li
//                                     key={index}
//                                 >

//                                     <span className="ai-number">
//                                         {index + 1}
//                                     </span>

//                                     <span>
//                                         {item}
//                                     </span>

//                                 </li>

//                             )
//                         )}

//                     </ol>

//                 ) : (

//                     <ul>

//                         {items.map(
//                             (
//                                 item,
//                                 index
//                             ) => (

//                                 <li
//                                     key={index}
//                                 >

//                                     <span className="ai-list-dot">
//                                         {type === "problem"
//                                             ? "!"
//                                             : "✓"
//                                         }
//                                     </span>

//                                     <span>
//                                         {item}
//                                     </span>

//                                 </li>

//                             )
//                         )}

//                     </ul>

//                 )

//             ) : (

//                 <p className="ai-no-data">

//                     {
//                         loading
//                             ? "กำลังวิเคราะห์..."
//                             : empty
//                     }

//                 </p>

//             )}

//         </div>

//     );

// }


// // ======================================================
// // AI METRIC
// // ======================================================

// function AIMetric({
//     label,
//     value,
//     className = ""
// }) {

//     return (

//         <div className="ai-analysis-metric">

//             <span>
//                 {label}
//             </span>

//             <strong
//                 className={className}
//             >
//                 {value}
//             </strong>

//         </div>

//     );

// }


// // ======================================================
// // POSITION CARD
// // ======================================================

// function PositionCard({
//     icon,
//     title,
//     value,
//     description,
//     type
// }) {

//     return (

//         <div
//             className={`position-card ${type}`}
//         >

//             <div className="position-icon">
//                 {icon}
//             </div>

//             <div className="position-content">

//                 <span>
//                     {title}
//                 </span>

//                 <strong>
//                     {value}
//                 </strong>

//                 <small>
//                     {description}
//                 </small>

//             </div>

//         </div>

//     );

// }


// // ======================================================
// // STOCK CARD
// // ======================================================

// function StockCard({
//     icon,
//     title,
//     value,
//     suffix,
//     money,
//     description,
//     type
// }) {

//     return (

//         <div
//             className={`stock-card ${type}`}
//         >

//             <div className="stock-icon">
//                 {icon}
//             </div>

//             <div className="stock-title">
//                 {title}
//             </div>

//             <strong>
//                 {value || 0} {suffix}
//             </strong>

//             <div className="stock-money">

//                 ฿{Number(
//                     money || 0
//                 ).toLocaleString(
//                     "th-TH",
//                     {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2
//                     }
//                 )}

//             </div>

//             <small>
//                 {description}
//             </small>

//         </div>

//     );

// }


// // ======================================================
// // FINANCIAL ITEM
// // ======================================================

// function FinancialItem({
//     icon,
//     title,
//     value,
//     type,
//     prefix = ""
// }) {

//     return (

//         <div
//             className={`financial-item ${type}`}
//         >

//             <div className="financial-icon">
//                 {icon}
//             </div>

//             <div>

//                 <span>
//                     {title}
//                 </span>

//                 <strong>

//                     {prefix}฿{Number(
//                         value || 0
//                     ).toLocaleString(
//                         "th-TH",
//                         {
//                             minimumFractionDigits: 2,
//                             maximumFractionDigits: 2
//                         }
//                     )}

//                 </strong>

//             </div>

//         </div>

//     );

// }


// // ======================================================
// // EXPORT
// // ======================================================

// export default Dashboard;