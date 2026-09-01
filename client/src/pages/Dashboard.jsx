import { useEffect, useMemo, useState, useRef } from "react";

import api from "../api/axios";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    Cell
} from "recharts";

import {
    ShoppingBag,
    Package,
    Wallet,
    TrendingUp,
    TrendingDown,
    Boxes,
    CircleDollarSign,
    PiggyBank,
    PawPrint,
    Sparkles,
    AlertTriangle,
    Lightbulb,
    CheckCircle2,
    CalendarDays,
    CalendarRange,
    CalendarClock,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    X
} from "lucide-react";

import "../styles/Dashboard.css";

/* ==========================================================
   DECORATIVE SVG ART — shared visual language with Login/Register
========================================================== */

function Moon() {
    return (
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="60" cy="60" r="52" fill="#FFE8B8" />
            <path
                d="M60 8a52 52 0 1 0 52 52c0-2-.1-4-.3-6a40 40 0 1 1-45.7-45.7c-2-.2-4-.3-6-.3Z"
                fill="#FFDA8C"
            />
            <circle cx="42" cy="46" r="7" fill="#FBC978" opacity=".7" />
            <circle cx="72" cy="34" r="4.5" fill="#FBC978" opacity=".6" />
            <circle cx="80" cy="66" r="8" fill="#FBC978" opacity=".6" />
            <circle cx="46" cy="80" r="5" fill="#FBC978" opacity=".55" />
            <path d="M50 58c1.5-2 5.5-2 7 0" stroke="#B9863F" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M64 58c1.5-2 5.5-2 7 0" stroke="#B9863F" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M55 70c2.5 2.5 7.5 2.5 10 0" stroke="#B9863F" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <ellipse cx="46" cy="66" rx="4" ry="2.6" fill="#FFB4B4" opacity=".6" />
            <ellipse cx="74" cy="66" rx="4" ry="2.6" fill="#FFB4B4" opacity=".6" />
        </svg>
    )
}


function Spaceship({ gradientId }) {
    return (
        <svg viewBox="0 0 140 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 78c14 6 24 6 34 2" stroke="#FFD37A" strokeWidth="5" strokeLinecap="round" opacity=".55" />
            <path d="M14 64c10 5 18 6 26 3" stroke="#FF9ECB" strokeWidth="4" strokeLinecap="round" opacity=".45" />
            <ellipse cx="80" cy="55" rx="34" ry="26" fill="#FFF7EC" />
            <ellipse cx="80" cy="55" rx="34" ry="26" fill={`url(#${gradientId})`} />
            <path d="M52 60c4 18 20 30 28 30s24-12 28-30" fill="#B587FF" opacity=".18" />
            <circle cx="82" cy="50" r="13" fill="#9AD8FF" />
            <circle cx="82" cy="50" r="13" stroke="#6FB8E8" strokeWidth="3" />
            <circle cx="77" cy="45" r="3.2" fill="#fff" opacity=".8" />
            <path d="M52 62c-10 2-16 10-16 18 8 0 16-4 20-12Z" fill="#FF9ECB" />
            <path d="M108 62c10 2 16 10 16 18-8 0-16-4-20-12Z" fill="#FF9ECB" />
            <path d="M70 84c2 8 6 14 10 16 4-2 8-8 10-16-6 4-14 4-20 0Z" fill="#FFD37A" />
            <defs>
                <linearGradient id={gradientId} x1="46" y1="30" x2="114" y2="80" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffffff" />
                    <stop offset="1" stopColor="#F0E4FF" />
                </linearGradient>
            </defs>
        </svg>
    )
}


function CatAstronaut() {
    return (
        <svg viewBox="0 0 160 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="80" cy="82" r="58" fill="#EAF6FF" opacity=".9" />
            <circle cx="80" cy="82" r="58" stroke="#DCEBF7" strokeWidth="6" />
            <circle cx="60" cy="62" r="10" fill="#ffffff" opacity=".6" />
            <path d="M42 46 L52 18 L68 44Z" fill="#F5A468" />
            <path d="M118 46 L108 18 L92 44Z" fill="#F5A468" />
            <path d="M48 42 L54 26 L62 40Z" fill="#FFD3B0" />
            <path d="M112 42 L106 26 L98 40Z" fill="#FFD3B0" />
            <circle cx="80" cy="90" r="46" fill="#F8B57E" />
            <path d="M34 88a46 46 0 0 0 92 4c-10 6-24 9-46 9s-36-3-46-9Z" fill="#FCCB9C" />
            <path d="M50 56c4 4 4 10 0 14" stroke="#E28F52" strokeWidth="4" strokeLinecap="round" />
            <path d="M110 56c-4 4-4 10 0 14" stroke="#E28F52" strokeWidth="4" strokeLinecap="round" />
            <ellipse cx="56" cy="100" rx="9" ry="6" fill="#FF9EAE" opacity=".55" />
            <ellipse cx="104" cy="100" rx="9" ry="6" fill="#FF9EAE" opacity=".55" />
            <ellipse cx="64" cy="86" rx="6" ry="7.5" fill="#4B3F6B" />
            <ellipse cx="96" cy="86" rx="6" ry="7.5" fill="#4B3F6B" />
            <circle cx="66.5" cy="83" r="2" fill="#fff" />
            <circle cx="98.5" cy="83" r="2" fill="#fff" />
            <path d="M76 98c2.5 2.5 5.5 2.5 8 0" stroke="#B9663F" strokeWidth="2.6" strokeLinecap="round" fill="none" />
            <path d="M80 92v6" stroke="#B9663F" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M74 90c-3-1-6 0-7 2M86 90c3-1 6 0 7 2" stroke="#B9663F" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M28 84h20M28 94h18M112 84h20M114 94h18" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" opacity=".9" />
            <path d="M22 92a58 58 0 0 1 116 0" stroke="#DCEBF7" strokeWidth="8" fill="none" />
            <circle cx="122" cy="42" r="6" fill="#FF9ECB" />
            <path d="M112 54c4-6 8-10 10-12" stroke="#DCEBF7" strokeWidth="5" strokeLinecap="round" />
            <path d="M18 60l2 5 5 2-5 2-2 5-2-5-5-2 5-2Z" fill="#FFD37A" />
            <path d="M142 100l1.6 4 4 1.6-4 1.6-1.6 4-1.6-4-4-1.6 4-1.6Z" fill="#FF9ECB" />
        </svg>
    )
}




/* ==========================================================
   SPACE CAT DECORATIONS — shared with Home / Login / Register
   Self-contained so this file can be pasted in directly.
========================================================== */

function DashboardSpaceDecor() {
    return (
        <>
            <style>{`
                .dashboard-space-scene {
                    position: absolute;
                    inset: 0;
                    z-index: 0;
                    overflow: hidden;
                    pointer-events: none;
                    background:
                        radial-gradient(circle at 85% 8%, rgba(255,232,176,.16), transparent 32%),
                        radial-gradient(circle at 12% 45%, rgba(255,158,203,.10), transparent 38%),
                        radial-gradient(circle at 50% 0%, #3a2a6e 0%, transparent 55%),
                        linear-gradient(160deg, #1b1440 0%, #2a1f5c 35%, #3a2a6e 65%, #4a2f6b 100%);
                }

                .dashboard-space-scene::before,
                .dashboard-space-scene::after {
                    content: "";
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    background-repeat: repeat;
                    background-image:
                        radial-gradient(1.6px 1.6px at 10% 10%, #fff, transparent),
                        radial-gradient(1.6px 1.6px at 80% 6%, #fff, transparent),
                        radial-gradient(1.2px 1.2px at 60% 22%, #ffe8b0, transparent),
                        radial-gradient(1.4px 1.4px at 30% 32%, #fff, transparent),
                        radial-gradient(1.2px 1.2px at 90% 28%, #fff, transparent),
                        radial-gradient(1.6px 1.6px at 45% 42%, #ffe8b0, transparent),
                        radial-gradient(1.2px 1.2px at 15% 24%, #fff, transparent),
                        radial-gradient(1.4px 1.4px at 70% 38%, #fff, transparent);
                    background-size: 340px 340px;
                    animation: dashboardSpaceTwinkle 4s ease-in-out infinite;
                }

                .dashboard-space-scene::after {
                    background-size: 260px 260px;
                    background-position: 40px 60px;
                    animation-duration: 3.2s;
                    animation-delay: .6s;
                    opacity: .7;
                }

                .dashboard-space-moon {
                    position: absolute;
                    top: 2%;
                    right: 4%;
                    width: 116px;
                    height: 116px;
                    filter: drop-shadow(0 0 40px rgba(255,236,179,.55)) drop-shadow(0 18px 26px rgba(20,10,50,.35));
                    animation: dashboardMoonFloat 7s ease-in-out infinite;
                }

                .dashboard-space-ship {
                    position: absolute;
                    width: 96px;
                    filter: drop-shadow(0 14px 18px rgba(20,10,50,.4));
                    animation: dashboardShipDrift 6.5s ease-in-out infinite;
                }

                .dashboard-space-ship-one { top: 6%; left: 1%; }
                .dashboard-space-ship-two { bottom: 4%; right: 0; width: 58px; opacity: .85; animation-duration: 8s; animation-direction: reverse; }

                .dashboard-space-cat {
                    position: absolute;
                    top: 82px;
                    left: 50%;
                    width: 108px;
                    transform: translateX(-50%);
                    filter: drop-shadow(0 12px 14px rgba(60,30,90,.35));
                    animation: dashboardCatBob 3.4s ease-in-out infinite;
                }

                .dashboard-space-star {
                    position: absolute;
                    color: #ffd37a;
                    font-size: 22px;
                    line-height: 1;
                    text-shadow: 0 5px 10px rgba(210,160,70,.3);
                    user-select: none;
                    animation: dashboardStarSpin 3.6s ease-in-out infinite;
                }
                .dashboard-space-star.one { top: 8%; left: 40%; font-size: 20px; }
                .dashboard-space-star.two { top: 4%; right: 28%; font-size: 16px; color: #ff9ecb; animation-delay: .8s; }
                .dashboard-space-star.three { bottom: 12%; left: 46%; font-size: 16px; color: #b587ff; animation-delay: 1.6s; }
                .dashboard-space-star.four { top: 30%; right: 12%; font-size: 13px; color: #ffd37a; animation-delay: 2.1s; }

                @keyframes dashboardSpaceTwinkle {
                    0%, 100% { opacity: .5; }
                    50% { opacity: 1; }
                }
                @keyframes dashboardMoonFloat {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes dashboardShipDrift {
                    0%, 100% { transform: translate(0,0) rotate(-6deg); }
                    50% { transform: translate(14px,-16px) rotate(-2deg); }
                }
                @keyframes dashboardCatBob {
                    0%, 100% { transform: translateX(-50%) translateY(0) rotate(-1.5deg); }
                    50% { transform: translateX(-50%) translateY(-6px) rotate(1.5deg); }
                }
                @keyframes dashboardStarSpin {
                    0%, 100% { transform: rotate(-12deg) scale(1); opacity: .8; }
                    50% { transform: rotate(12deg) scale(1.15); opacity: 1; }
                }

                .dashboard-space-scene + * {
                    position: relative;
                    z-index: 2;
                }

                @media (max-width: 1000px) {
                    .dashboard-space-moon { width: 90px; height: 90px; }
                    .dashboard-space-ship-one { width: 76px; left: -2%; }
                    .dashboard-space-star { opacity: .55; }
                    .dashboard-space-cat { width: 92px; }
                }

                @media (max-width: 650px) {
                    .dashboard-space-moon { width: 66px; height: 66px; top: 1%; right: 4%; }
                    .dashboard-space-ship-one { width: 58px; }
                    .dashboard-space-ship-two { width: 40px; }
                    .dashboard-space-cat { width: 80px; top: 74px; }
                    .dashboard-space-star { opacity: .45; }
                }

                @media (prefers-reduced-motion: reduce) {
                    .dashboard-space-moon,
                    .dashboard-space-ship,
                    .dashboard-space-cat,
                    .dashboard-space-star,
                    .dashboard-space-scene::before,
                    .dashboard-space-scene::after {
                        animation: none;
                    }
                }
            `}</style>

            <div className="dashboard-space-scene" aria-hidden="true">
                <div className="dashboard-space-moon"><Moon /></div>
                <div className="dashboard-space-ship dashboard-space-ship-one"><Spaceship gradientId="dashboardShipShade1" /></div>
                <div className="dashboard-space-ship dashboard-space-ship-two"><Spaceship gradientId="dashboardShipShade2" /></div>
                <div className="dashboard-space-star one">✦</div>
                <div className="dashboard-space-star two">✦</div>
                <div className="dashboard-space-star three">✦</div>
                <div className="dashboard-space-star four">✧</div>
                <div className="dashboard-space-cat"><CatAstronaut /></div>
            </div>
        </>
    );
}


// ======================================================
// AI FEATURE
// ======================================================

// false = ปิด AI
// true  = เปิด AI
const AI_ENABLED = false;


// ======================================================
// PERIOD OPTIONS (สถานะการเงิน / สรุปยอดด้านบน)
// ======================================================

const PERIOD_OPTIONS = [
    { value: "today", label: "วันนี้" },
    { value: "week", label: "สัปดาห์นี้" },
    { value: "month", label: "เดือนนี้" },
    { value: "year", label: "ปีนี้" },
    { value: "all", label: "ทั้งหมด" }
];


// ======================================================
// CHART OPTIONS
// ======================================================

const CHART_MODE_OPTIONS = [
    { value: "daily", label: "รายวัน", icon: CalendarDays },
    { value: "weekly", label: "รายสัปดาห์", icon: CalendarRange },
    { value: "monthly", label: "รายเดือน", icon: CalendarRange },
    { value: "yearly", label: "รายปี", icon: CalendarClock }
];

const RANKING_LIMIT_OPTIONS = [
    { value: 5, label: "Top 5" },
    { value: 10, label: "Top 10" },
    { value: 20, label: "Top 20" },
    { value: 0, label: "ทั้งหมด" }
];

function toDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function fromDateKey(value) {
    if (!value) return new Date();
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

function startOfWeekMonday(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    result.setHours(0, 0, 0, 0);
    return result;
}

function addDays(date, amount) {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
}

function getChartRange(mode, dateKey, selectedMonth, selectedYear) {
    if (mode === "daily") {
        const end = fromDateKey(dateKey);
        const start = addDays(end, -6);
        return { from: toDateKey(start), to: toDateKey(end) };
    }

    if (mode === "weekly") {
        const end = startOfWeekMonday(fromDateKey(dateKey));
        const start = addDays(end, -42);
        const final = addDays(end, 6);
        return { from: toDateKey(start), to: toDateKey(final) };
    }

    if (mode === "monthly") {
        const [year, month] = selectedMonth.split("-").map(Number);
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        return { from: toDateKey(start), to: toDateKey(end) };
    }

    const year = Number(selectedYear);
    return {
        from: `${year}-01-01`,
        to: `${year}-12-31`
    };
}

function formatDisplayDate(value) {
    if (!value) return "";
    return fromDateKey(value).toLocaleDateString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function formatMonthLabel(value) {
    if (!value) return "";
    const [year, month] = value.split("-").map(Number);
    return new Date(year, month - 1, 1).toLocaleDateString("th-TH", {
        month: "long",
        year: "numeric"
    });
}

function emptyTrend(date) {
    return {
        date,
        items: 0,
        grossSales: 0,
        refund: 0,
        netSales: 0,
        cost: 0,
        shipping: 0,
        profit: 0
    };
}


// ======================================================
// DASHBOARD

// ======================================================

function Dashboard() {

    // ==================================================
    // STATE
    // ==================================================

    const [data, setData] = useState(null);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState("");

    // period ตอนนี้เปลี่ยนได้จริงแล้ว (เดิมเป็น useState แบบไม่มี
    // setter เลย ทำให้ล็อกอยู่ที่ "today" ตลอด เปลี่ยนไม่ได้)
    const [period, setPeriod] = useState("today");

    const todayKey = useMemo(() => toDateKey(new Date()), []);
    const [chartMode, setChartMode] = useState("daily");
    const [selectedDate, setSelectedDate] = useState(todayKey);
    const [selectedMonth, setSelectedMonth] = useState(todayKey.slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(Number(todayKey.slice(0, 4)));
    const [chartDataSource, setChartDataSource] = useState([]);
    const [productLimit, setProductLimit] = useState(5);
    const [customerLimit, setCustomerLimit] = useState(5);
    const [chartLoading, setChartLoading] = useState(true);
    const [chartError, setChartError] = useState("");
    const [calendarOpen, setCalendarOpen] = useState(false);


    // ==================================================
    // AI STATE
    // ==================================================

    const [aiResult, setAiResult] = useState(null);

    const [aiLoading, setAiLoading] = useState(true);

    const [aiError, setAiError] = useState("");

    const aiRequestIdRef = useRef(0);


    // ==================================================
    // FETCH DASHBOARD
    //
    // เดิม effect นี้ deps เป็น [] เฉยๆ (ยิงครั้งเดียวตอน mount)
    // พอ period เปลี่ยนไม่มีทางรีเฟรชข้อมูลสรุปด้านบนเลย
    // ตอนนี้ผูกกับ period แล้ว
    // ==================================================

    useEffect(() => {
        fetchDashboard();
    }, [period]);


    async function fetchDashboard() {

        try {

            setLoading(true);

            setError("");


            const res = await api.get(
                "/dashboard",
                {
                    params: {
                        period
                    }
                }
            );


            console.log(
                "Dashboard Response:",
                res.data
            );


            if (
                !res.data ||
                typeof res.data !== "object"
            ) {

                throw new Error(
                    "Dashboard response ไม่ถูกต้อง"
                );

            }


            setData(
                res.data
            );

        }
        catch (err) {

            console.error(
                "Dashboard Error:",
                err
            );


            setData(null);


            setError(
                err?.response?.data?.message ||
                err?.message ||
                "ไม่สามารถโหลดข้อมูล Dashboard ได้"
            );

        }
        finally {

            setLoading(false);

        }

    }


    // ==================================================
    // FETCH PERFORMANCE CHART
    // ==================================================

    const chartRange = useMemo(
        () => getChartRange(chartMode, selectedDate, selectedMonth, selectedYear),
        [chartMode, selectedDate, selectedMonth, selectedYear]
    );

    useEffect(() => {
        fetchChartData();
    }, [chartRange.from, chartRange.to, chartMode]);

    async function fetchChartData() {
        try {
            setChartLoading(true);
            setChartError("");

            const res = await api.get("/dashboard", {
                params: {
                    // สำคัญ: ต้องส่ง period: "custom" ไปด้วยเสมอ
                    // ไม่งั้น backend จะไม่มองเห็น from/to เลย
                    // (backend ใช้ from/to ก็ต่อเมื่อ period === "custom"
                    // เท่านั้น ไม่งั้นจะ fallback ไปใช้ period: "today"
                    // ทุกครั้ง ทำให้กราฟเห็นข้อมูลแค่วันนี้เสมอ
                    // ไม่ว่าจะเลือกช่วงไหนก็ตาม)
                    period: "custom",
                    from: chartRange.from,
                    to: chartRange.to,
                    trend: chartMode === "yearly" ? "monthly" : chartMode
                }
            });

            if (!res.data) {
                throw new Error("ไม่สามารถโหลดข้อมูลกราฟได้");
            }

            setChartDataSource(Array.isArray(res.data.salesTrend) ? res.data.salesTrend : []);
        } catch (err) {
            console.error("Performance Chart Error:", err);
            setChartDataSource([]);
            setChartError(
                err?.response?.data?.message ||
                err?.message ||
                "ไม่สามารถโหลดข้อมูลกราฟได้"
            );
        } finally {
            setChartLoading(false);
        }
    }


    // ==================================================
    // FETCH AI ANALYSIS
    // ==================================================

    useEffect(() => {

        // ==============================================
        // AI ถูกปิดอยู่
        // ไม่เรียก API /ai/analyze
        // ==============================================

        if (!AI_ENABLED) {

            setAiLoading(false);

            setAiResult(null);

            setAiError("");

            return;

        }


        fetchAIAnalysis();

    }, [period]);


    async function fetchAIAnalysis() {

        const requestId =
            ++aiRequestIdRef.current;


        try {

            setAiLoading(true);

            setAiError("");


            const res = await api.post(
                "/ai/analyze",
                {
                    period: "DAY",

                    referenceDate:
                        new Date()
                }
            );


            console.log(
                "AI Analyze Response:",
                res.data
            );


            if (
                requestId !==
                aiRequestIdRef.current
            ) {

                return;

            }


            const ai =
                res.data?.data?.ai;


            if (
                res.data?.success !== true ||
                !ai
            ) {

                throw new Error(
                    "AI response ไม่ถูกต้อง"
                );

            }


            if (
                ai.success &&
                ai.data
            ) {

                setAiResult(
                    ai.data
                );

            }
            else {

                setAiResult({

                    summary:
                        "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้",

                    strengths: [],

                    problems: [],

                    recommendations: []

                });


                setAiError(
                    ai.error || ""
                );

            }

        }
        catch (err) {

            if (
                requestId !==
                aiRequestIdRef.current
            ) {

                return;

            }


            console.error(
                "AI Analysis Error:",
                err
            );


            setAiResult({

                summary:
                    "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้",

                strengths: [],

                problems: [],

                recommendations: []

            });


            setAiError(
                err?.response?.data?.message ||
                err?.message ||
                "เรียก AI ไม่สำเร็จ"
            );

        }
        finally {

            if (
                requestId ===
                aiRequestIdRef.current
            ) {

                setAiLoading(false);

            }

        }

    }


    // ==================================================
    // FORMAT MONEY
    // ==================================================

    function formatMoney(value) {

        return Number(
            value || 0
        ).toLocaleString(
            "th-TH",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        );

    }


    // ==================================================
    // PERIOD LABEL
    // ==================================================

    const periodLabel = {

        today: "วันนี้",

        week: "7 วันล่าสุด",

        month: "เดือนนี้",

        year: "ปีนี้",

        all: "ทั้งหมด"

    };


    // ==================================================
    // SAFE DATA
    // ==================================================

    const summary =
        data?.summary || {};

    const inventory =
        data?.inventory || {};

    const investment =
        data?.investment || {};

    const available =
        inventory.available || {};

    const sold =
        inventory.sold || {};

    // ==================================================
    // FINANCIAL VALUES
    // ==================================================
    //
    // หมายเหตุ:
    //
    // backend (/api/dashboard) แยกค่าใช้จ่ายเป็นหมวดย่อย
    // อยู่แล้ว (SHIPPING / PACKAGING / PLATFORM_FEE / OTHER)
    // ผ่าน getExpenseBreakdown() — เดิม frontend เอา
    // "summary.expense" (ยอดรวมทุกหมวด) มาแปะป้าย
    // "ค่าใช้จ่ายอื่น" ผิด ทำให้ค่าส่งถูกนับซ้ำเวลาดูรวมกับ
    // การ์ด "ค่าส่ง" — แก้โดยแยกตัวแปรให้ตรงกับ field จริง
    // ==================================================

    const netSales =
        Number(
            summary.netSales || 0
        );

    const grossSales =
        Number(
            summary.grossSales || 0
        );

    const shippingRevenue =
        Number(
            summary.shippingRevenue || 0
        );

    const discount =
        Number(
            summary.discount || 0
        );

    const totalCost =
        Number(
            summary.totalCost || 0
        );

    const productCost =
        Number(
            summary.productCost || 0
        );

    /*
     * shippingCost ที่ backend ส่งมา คือค่าส่งจริง
     * (ต้นทุน) ไม่ใช่ค่าส่งที่เรียกเก็บจากลูกค้า
     */

    const shippingCost =
        Number(
            summary.shippingCost || 0
        );

    const packagingExpense =
        Number(
            summary.packagingExpense || 0
        );

    const platformFee =
        Number(
            summary.platformFee || 0
        );

    const otherExpense =
        Number(
            summary.otherExpense || 0
        );

    /*
     * totalExpense = ยอดรวมค่าใช้จ่ายทุกหมวด
     * (shipping + packaging + platform fee + other)
     * ห้ามเอาไปแปะป้าย "ค่าใช้จ่ายอื่น" เฉยๆ
     */

    const totalExpense =
        Number(
            summary.expense || 0
        );

    const refund =
        Number(
            summary.refund || 0
        );

    const profit =
        Number(
            summary.profit || 0
        );

    /*
     * ใช้ profitMargin จาก backend โดยตรง
     * เพื่อให้ตัวเลขตรงกับหน้าบัญชีเสมอ
     * ไม่ต้องคำนวณซ้ำฝั่ง frontend
     */

    const backendMargin =
        Number(
            summary.profitMargin || 0
        );

    const isProfit =
        profit >= 0;


    // ==================================================
    // CHART DATA
    // ==================================================

    const chartData = useMemo(() => {
        const sourceMap = {};

        chartDataSource.forEach(item => {
            if (!item?.date) return;
            sourceMap[item.date] = {
                ...emptyTrend(item.date),
                ...item,
                netSales: Number(item.netSales || 0),
                grossSales: Number(item.grossSales || 0),
                profit: Number(item.profit || 0),
                cost: Number(item.cost ?? item.totalCost ?? 0),
                totalCost: Number(item.totalCost ?? item.cost ?? 0)
            };
        });

        if (chartMode === "daily") {
            const end = fromDateKey(selectedDate);
            const result = [];
            for (let i = 6; i >= 0; i -= 1) {
                const date = addDays(end, -i);
                const key = toDateKey(date);
                result.push(sourceMap[key] || emptyTrend(key));
            }
            return result;
        }

        if (chartMode === "weekly") {
            const selectedWeek = startOfWeekMonday(fromDateKey(selectedDate));
            return Array.from({ length: 7 }, (_, index) => {
                const weekStart = addDays(selectedWeek, -((6 - index) * 7));
                const key = toDateKey(weekStart);
                return sourceMap[key] || emptyTrend(key);
            });
        }

        if (chartMode === "monthly") {
            const [year, month] = selectedMonth.split("-").map(Number);
            const days = new Date(year, month, 0).getDate();
            return Array.from({ length: days }, (_, index) => {
                const key = `${year}-${String(month).padStart(2, "0")}-${String(index + 1).padStart(2, "0")}`;
                return sourceMap[key] || emptyTrend(key);
            });
        }

        const result = [];
        for (let month = 1; month <= 12; month += 1) {
            const key = `${selectedYear}-${String(month).padStart(2, "0")}`;
            const rows = chartDataSource.filter(item => String(item?.date || "").startsWith(key));
            result.push(rows.reduce((acc, item) => ({
                date: key,
                items: acc.items + Number(item.items || 0),
                grossSales: acc.grossSales + Number(item.grossSales || 0),
                refund: acc.refund + Number(item.refund || 0),
                netSales: acc.netSales + Number(item.netSales || 0),
                cost: acc.cost + Number(item.cost ?? item.totalCost ?? 0),
                totalCost: acc.totalCost + Number(item.totalCost ?? item.cost ?? 0),
                shipping: acc.shipping + Number(item.shipping || 0),
                profit: acc.profit + Number(item.profit || 0)
            }), emptyTrend(key)));
        }

        return result;
    }, [chartDataSource, chartMode, selectedDate, selectedMonth, selectedYear]);

    const chartTotals = useMemo(() => {
        return chartData.reduce((acc, item) => ({
            netSales: acc.netSales + Number(item.netSales || 0),
            profit: acc.profit + Number(item.profit || 0),
            totalCost: acc.totalCost + Number(item.totalCost ?? item.cost ?? 0)
        }), { netSales: 0, profit: 0, totalCost: 0 });
    }, [chartData]);

    // ==================================================
    // CHART LABELS
    // ==================================================

    const chartModeLabel = {
        daily: "7 วันย้อนหลัง",
        weekly: "7 สัปดาห์ย้อนหลัง",
        monthly: "รายเดือน",
        yearly: "รายปี"
    };

    const chartRangeLabel = useMemo(() => {
        if (chartMode === "daily") {
            return `${formatDisplayDate(chartRange.from)} – ${formatDisplayDate(chartRange.to)}`;
        }

        if (chartMode === "weekly") {
            // formatDisplayDate ต้องการ date-key string ("YYYY-MM-DD")
            // ไม่ใช่ Date object — เดิมส่ง Date object เข้าไปตรงๆ ทำให้
            // fromDateKey() เรียก .split() บน Date แล้ว throw ทันที
            // (นี่คือสาเหตุที่กดโหมด "รายสัปดาห์" แล้วหน้าเด้ง/ไม่โหลด)
            const end = toDateKey(
                addDays(startOfWeekMonday(fromDateKey(selectedDate)), 6)
            );
            return `${formatDisplayDate(chartRange.from)} – ${formatDisplayDate(end)}`;
        }

        if (chartMode === "monthly") {
            return formatMonthLabel(selectedMonth);
        }

        return `ปี ${Number(selectedYear) + 543}`;
    }, [chartMode, chartRange.from, chartRange.to, selectedMonth, selectedYear]);

    // ==================================================
    // CALENDAR / DATE PICKER
    // ==================================================

    function handleCalendarSelection(value) {
        if (chartMode === "daily" || chartMode === "weekly") setSelectedDate(value);
        if (chartMode === "monthly") setSelectedMonth(value);
        if (chartMode === "yearly") setSelectedYear(Number(value));
        setCalendarOpen(false);
    }

    // ==================================================

    // DATE FORMAT
    // ==================================================

    function formatChartDate(value) {
        if (!value) return "";

        if (chartMode === "yearly") {
            const [year, month] = value.split("-").map(Number);
            return new Date(year, month - 1, 1).toLocaleDateString("th-TH", {
                month: "short"
            });
        }

        const date = fromDateKey(value);
        return date.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short"
        });
    }


    // ==================================================
    // METRICS
    // ==================================================

    const metrics = useMemo(() => {

        if (!data) {

            return null;

        }


        const orders =
            getOrderCount(
                data
            );

        const items =
            getItemCount(
                data
            );

        const availableItems =
            Number(
                available.items || 0
            );


        /*
         * ใช้ margin จาก backend ก่อนเสมอ
         * (fallback คำนวณเองเฉพาะกรณี backend ไม่ส่งมา)
         */

        const margin =
            backendMargin ||
            (
                netSales > 0
                    ? (
                        profit /
                        netSales
                    ) * 100
                    : 0
            );


        return {

            netSales,

            grossSales,

            totalCost,

            profit,

            margin,

            orders,

            items,

            availableItems

        };

    }, [
        data,
        available,
        netSales,
        grossSales,
        totalCost,
        profit,
        backendMargin
    ]);


    // ==================================================
    // LOADING
    // ==================================================

    if (loading) {

        return (

            <div className="dashboard-loading">

                <div className="dashboard-loading-bubble">

                    <div className="loading-sparkle">
                        🐱‍🚀
                    </div>

                    <div className="loading-spinner" />

                    <h3>
                        กำลังเตรียม Dashboard
                    </h3>

                    <p>
                        กำลังรวบรวมข้อมูลร้าน...
                    </p>

                </div>

            </div>

        );

    }


    // ==================================================
    // ERROR
    // ==================================================

    if (
        error &&
        !data
    ) {

        return (

            <div className="dashboard-empty">

                <div className="empty-icon">
                    ⚠️
                </div>

                <h2>
                    โหลดข้อมูลไม่สำเร็จ
                </h2>

                <p>
                    {error}
                </p>

                <button
                    type="button"
                    onClick={fetchDashboard}
                    style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "14px",
                        cursor: "pointer"
                    }}
                >
                    ลองใหม่
                </button>

            </div>

        );

    }


    // ==================================================
    // EMPTY
    // ==================================================

    if (!data) {

        return (

            <div className="dashboard-empty">

                <div className="empty-icon">
                    🧸
                </div>

                <h2>
                    ไม่พบข้อมูล
                </h2>

                <p>
                    ยังไม่มีข้อมูลสำหรับแสดงผล
                </p>

            </div>

        );

    }


    // ==================================================
    // RENDER
    // ==================================================

    return (

        <div className="dashboard-page" style={{ position: "relative", overflow: "hidden" }}>


            {/* =================================================
                BACKGROUND
            ================================================= */}

            <DashboardSpaceDecor />


            {/* =================================================
                HEADER
            ================================================= */}

            <header className="dashboard-header">

                <div className="dashboard-title-row">

                    <div className="dashboard-title-icon">
                        🐱‍🚀
                    </div>

                    <div>

                        <h1>
                            ภาพรวมร้านค้า
                        </h1>

                        <p>
                            ดูสถานะเงิน สต็อก ยอดขาย และกำไรของร้าน
                        </p>

                    </div>

                </div>

            </header>


            {/* =================================================
                FINANCIAL POSITION
            ================================================= */}

            <section className="dashboard-section">

                <div className="dashboard-section-heading">

                    <div>

                        <h2>
                            สถานะการเงิน
                        </h2>

                        <p>
                            ภาพรวมเงินของร้านในช่วง{" "}
                            {periodLabel[period]}
                        </p>

                    </div>

                    <PeriodSelect
                        value={period}
                        onChange={setPeriod}
                        ariaLabel="เลือกช่วงเวลา"
                    />

                </div>


                <div className="position-grid">

                    <PositionCard
                        icon={<Wallet size={24} />}
                        title="ขายไปแล้ว"
                        value={`฿${formatMoney(netSales)}`}
                        description="เงินจากยอดขายสุทธิ"
                        type="purple"
                    />


                    <PositionCard
                        icon={
                            isProfit
                                ? <TrendingUp size={24} />
                                : <TrendingDown size={24} />
                        }
                        title={
                            isProfit
                                ? "กำไรสุทธิ"
                                : "ขาดทุนสุทธิ"
                        }
                        value={`฿${formatMoney(
                            Math.abs(profit)
                        )}`}
                        description={
                            isProfit
                                ? `Margin ${backendMargin.toFixed(2)}%`
                                : "ต้นทุนสูงกว่ายอดขาย"
                        }
                        type={
                            isProfit
                                ? "green"
                                : "pink"
                        }
                    />


                    <PositionCard
                        icon={<PiggyBank size={24} />}
                        title="เงินจมในสต็อก"
                        value={`฿${formatMoney(
                            investment.value
                        )}`}
                        description="มูลค่าสินค้าที่ยังอยู่ในคลัง"
                        type="yellow"
                    />


                    <PositionCard
                        icon={<CircleDollarSign size={24} />}
                        title="ต้นทุน"
                        value={`฿${formatMoney(
                            totalCost
                        )}`}
                        description="ต้นทุนรวมในช่วงที่เลือก"
                        type="blue"
                    />

                </div>

            </section>


            {/* =================================================
                PERFORMANCE CHART
            ================================================= */}

            <section className="dashboard-section">

                <div className="trading-chart-card">

                    <div className="trading-chart-top">

                        <div>

                            <div className="trading-chart-title">

                                <div className="trading-chart-icon">
                                    📈
                                </div>

                                <div>

                                    <h2>
                                        ผลประกอบการ
                                    </h2>

                                    <p>
                                        {chartModeLabel[chartMode]} · {chartRangeLabel}
                                    </p>

                                </div>

                            </div>

                        </div>


                        <div className="chart-controls">

                            <div className="chart-mode-tabs" role="tablist" aria-label="รูปแบบกราฟ">
                                {CHART_MODE_OPTIONS.map(option => {
                                    const Icon = option.icon;
                                    const active = chartMode === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            type="button"
                                            role="tab"
                                            aria-selected={active}
                                            className={`chart-mode-tab ${active ? "active" : ""}`}
                                            onClick={() => setChartMode(option.value)}
                                        >
                                            <Icon size={15} />
                                            <span>{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="chart-date-picker">
                                <button
                                    type="button"
                                    className="chart-date-button"
                                    onClick={() => setCalendarOpen(value => !value)}
                                    aria-expanded={calendarOpen}
                                >
                                    <CalendarDays size={16} />
                                    <span>{
                                        chartMode === "daily"
                                            ? formatDisplayDate(selectedDate)
                                            : chartMode === "weekly"
                                                ? `สัปดาห์ของ ${formatDisplayDate(selectedDate)}`
                                                : chartMode === "monthly"
                                                    ? formatMonthLabel(selectedMonth)
                                                    : `ปี ${Number(selectedYear) + 543}`
                                    }</span>
                                    <ChevronDown size={15} />
                                </button>

                                {calendarOpen && (
                                    <ChartDatePopup
                                        mode={chartMode === "weekly" ? "daily" : chartMode}
                                        selectedDate={selectedDate}
                                        selectedMonth={selectedMonth}
                                        selectedYear={selectedYear}
                                        onSelect={handleCalendarSelection}
                                        onClose={() => setCalendarOpen(false)}
                                    />
                                )}
                            </div>

                        </div>

                    </div>


                    <div className="chart-metrics">

                        <ChartMetric
                            label="ยอดขายสุทธิ"
                            value={`฿${formatMoney(
                                chartTotals.netSales
                            )}`}
                            className="sales-dot"
                        />


                        <ChartMetric
                            label={
                                chartTotals.profit >= 0
                                    ? "กำไร"
                                    : "ขาดทุน"
                            }
                            value={`${
                                chartTotals.profit >= 0
                                    ? "+"
                                    : "-"
                            }฿${formatMoney(
                                Math.abs(chartTotals.profit)
                            )}`}
                            className={
                                chartTotals.profit >= 0
                                    ? "profit-dot"
                                    : "loss-dot"
                            }
                        />


                        <ChartMetric
                            label="ต้นทุน"
                            value={`฿${formatMoney(
                                chartTotals.totalCost
                            )}`}
                            className="cost-dot"
                        />

                    </div>


                    <div className="trading-chart-wrapper">

                        {chartLoading ? (

                            <div className="chart-empty">
                                <div>📊</div>
                                <strong>กำลังโหลดข้อมูลกราฟ...</strong>
                                <span>กำลังรวบรวมข้อมูลผลประกอบการ</span>
                            </div>

                        ) : chartError ? (

                            <div className="chart-empty">
                                <div>⚠️</div>
                                <strong>โหลดข้อมูลกราฟไม่สำเร็จ</strong>
                                <span>{chartError}</span>
                            </div>

                        ) : chartData.length > 0 ? (

                            <ResponsiveContainer
                                width="100%"
                                height={380}
                            >

                                <BarChart
                                    data={chartData}
                                    margin={{
                                        top: 20,
                                        right: 10,
                                        left: 0,
                                        bottom: 10
                                    }}
                                    barGap={5}
                                    barCategoryGap="25%"
                                >

                                    <CartesianGrid
                                        vertical={false}
                                        strokeDasharray="4 5"
                                        stroke="rgba(155,126,219,.13)"
                                    />


                                    <XAxis
                                        dataKey="date"
                                        axisLine={false}
                                        tickLine={false}
                                        tickFormatter={
                                            formatChartDate
                                        }
                                        tick={{
                                            fill: "#95889d",
                                            fontSize: 12,
                                            fontWeight: 700
                                        }}
                                        dy={10}
                                    />


                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{
                                            fill: "#95889d",
                                            fontSize: 11,
                                            fontWeight: 600
                                        }}
                                        tickFormatter={
                                            value => {

                                                if (
                                                    Math.abs(
                                                        value
                                                    ) >= 1000
                                                ) {

                                                    return `${(
                                                        value /
                                                        1000
                                                    ).toFixed(0)}k`;

                                                }

                                                return value;

                                            }
                                        }
                                        width={45}
                                    />


                                    <Tooltip
                                        cursor={{
                                            fill:
                                                "rgba(169,139,232,.07)"
                                        }}
                                        content={({
                                            active,
                                            payload,
                                            label
                                        }) => {

                                            if (
                                                !active ||
                                                !payload ||
                                                !payload.length
                                            ) {

                                                return null;

                                            }


                                            const sales =
                                                payload.find(
                                                    item =>
                                                        item.dataKey ===
                                                        "netSales"
                                                )?.value || 0;


                                            const chartProfit =
                                                payload.find(
                                                    item =>
                                                        item.dataKey ===
                                                        "profit"
                                                )?.value || 0;


                                            return (

                                                <div className="trading-tooltip">

                                                    <div className="tooltip-date">
                                                        {
                                                            formatChartDate(
                                                                label
                                                            )
                                                        }
                                                    </div>


                                                    <div className="tooltip-line">

                                                        <span>
                                                            💜 ยอดขาย
                                                        </span>

                                                        <strong>
                                                            ฿{formatMoney(
                                                                sales
                                                            )}
                                                        </strong>

                                                    </div>


                                                    <div className="tooltip-line">

                                                        <span>
                                                            {
                                                                chartProfit >=
                                                                0
                                                                    ? "✨ กำไร"
                                                                    : "🌸 ขาดทุน"
                                                            }
                                                        </span>

                                                        <strong
                                                            className={
                                                                chartProfit >=
                                                                0
                                                                    ? "tooltip-profit"
                                                                    : "tooltip-loss"
                                                            }
                                                        >

                                                            {
                                                                chartProfit >=
                                                                0
                                                                    ? "+"
                                                                    : "-"
                                                            }

                                                            ฿{formatMoney(
                                                                Math.abs(
                                                                    chartProfit
                                                                )
                                                            )}

                                                        </strong>

                                                    </div>

                                                </div>

                                            );

                                        }}
                                    />


                                    <Bar
                                        dataKey="netSales"
                                        name="ยอดขายสุทธิ"
                                        radius={[
                                            10,
                                            10,
                                            4,
                                            4
                                        ]}
                                        maxBarSize={40}
                                        animationDuration={700}
                                    >

                                        {chartData.map(
                                            (_, index) => (

                                                <Cell
                                                    key={
                                                        `sales-${index}`
                                                    }
                                                    fill="#A98BE8"
                                                />

                                            )
                                        )}

                                    </Bar>


                                    <Bar
                                        dataKey="profit"
                                        name="กำไร"
                                        radius={[
                                            10,
                                            10,
                                            4,
                                            4
                                        ]}
                                        maxBarSize={40}
                                        animationDuration={900}
                                    >

                                        {chartData.map(
                                            (
                                                entry,
                                                index
                                            ) => (

                                                <Cell
                                                    key={
                                                        `profit-${index}`
                                                    }
                                                    fill={
                                                        entry.profit <
                                                        0
                                                            ? "#F3A7B8"
                                                            : "#D7B8EE"
                                                    }
                                                />

                                            )
                                        )}

                                    </Bar>

                                </BarChart>

                            </ResponsiveContainer>

                        ) : (

                            <div className="chart-empty">

                                <div>
                                    📊
                                </div>

                                <strong>
                                    ยังไม่มีข้อมูลในช่วงนี้
                                </strong>

                                <span>
                                    เมื่อมีรายการขาย กราฟจะแสดงตรงนี้
                                </span>

                            </div>

                        )}

                    </div>


                    <div className="chart-legend">

                        <div>
                            <span className="legend-box sales" />
                            ยอดขายสุทธิ
                        </div>

                        <div>
                            <span className="legend-box profit" />
                            กำไร
                        </div>

                        <div>
                            <span className="legend-box loss" />
                            ขาดทุน
                        </div>

                    </div>

                </div>

            </section>


            {/* =================================================
                STOCK POSITION
            ================================================= */}

            <section className="dashboard-section">

                <div className="dashboard-section-heading">

                    <div>

                        <h2>
                            สถานะสินค้าในคลัง
                        </h2>

                        <p>
                            เงินที่อยู่ในสินค้าและสินค้าที่เปลี่ยนเป็นยอดขายแล้ว
                        </p>

                    </div>

                </div>


                <div className="stock-position-grid">

                    <StockCard
                        icon={<Boxes size={24} />}
                        title="สินค้าในระบบ"
                        value={investment.items}
                        suffix="ชิ้น"
                        money={investment.value}
                        description="มูลค่าสินค้าทั้งหมด"
                        type="purple"
                    />


                    <StockCard
                        icon={<Package size={24} />}
                        title="ยังมีของ"
                        value={available.items}
                        suffix="ชิ้น"
                        money={available.value}
                        description="เงินที่ยังจมอยู่ในสต็อก"
                        type="yellow"
                    />


                    <StockCard
                        icon={<ShoppingBag size={24} />}
                        title="ขายไปแล้ว"
                        value={sold.items}
                        suffix="ชิ้น"
                        money={sold.value}
                        description="สินค้าที่ออกจากคลังแล้ว"
                        type="green"
                    />

                </div>

            </section>


            {/* =================================================
                FINANCIAL BREAKDOWN
            ================================================= */}

            <section className="dashboard-section">

                <div className="dashboard-section-heading">
                    <div>
                        <h2>รายละเอียดการขาย</h2>
                        <p>แยกรายรับ ต้นทุน ค่าใช้จ่าย และผลลัพธ์ให้เห็นชัดเจน</p>
                    </div>
                </div>

                <div className="financial-groups">

                    <div className="financial-group income-group">
                        <div className="financial-group-header">
                            <div className="financial-group-icon">💰</div>
                            <div>
                                <h3>รายรับ</h3>
                                <span>เงินที่เกิดจากการขาย</span>
                            </div>
                        </div>

                        <div className="financial-group-grid">
                            <FinancialItem icon="💰" title="ยอดขายสินค้า" value={grossSales} type="sales" />
                            <FinancialItem icon="📮" title="ค่าส่งที่เก็บจากลูกค้า" value={shippingRevenue} type="shipping-revenue" prefix="+" />
                            {/* <FinancialItem icon="🏷️" title="ส่วนลด" value={discount} type="discount" prefix="-" /> */}
                            <FinancialItem icon="↩️" title="คืนเงิน" value={refund} type="refund" prefix="-" />
                            <FinancialItem icon="💜" title="ยอดขายสุทธิ" value={netSales} type="net" />
                        </div>
                    </div>

                    <div className="financial-group expense-group">
                        <div className="financial-group-header">
                            <div className="financial-group-icon">🧾</div>
                            <div>
                                <h3>ต้นทุนและค่าใช้จ่าย</h3>
                                <span>เงินที่ถูกใช้ไปเพื่อให้เกิดการขาย</span>
                            </div>
                        </div>

                        <div className="financial-group-grid">
                            <FinancialItem icon="📦" title="ต้นทุนสินค้า" value={productCost} type="cost" />
                            <FinancialItem icon="🚚" title="ค่าส่งจริง (ต้นทุน)" value={shippingCost} type="shipping" />
                            {/* <FinancialItem icon="📦" title="ค่าแพ็คเกจจิ้ง" value={packagingExpense} type="packaging" /> */}
                            {/* <FinancialItem icon="💳" title="ค่าธรรมเนียมแพลตฟอร์ม" value={platformFee} type="platform" /> */}
                            <FinancialItem icon="🧾" title="ค่าใช้จ่ายอื่นๆ" value={otherExpense} type="other-expense" />
                            <FinancialItem icon="🧮" title="ค่าใช้จ่ายรวม" value={totalExpense} type="expense" />
                        </div>
                    </div>

                    <div className={`financial-result-card ${profit >= 0 ? "profit-result" : "loss-result"}`}>
                        <div className="financial-result-icon">
                            {profit >= 0 ? "📈" : "📉"}
                        </div>
                        <div className="financial-result-content">
                            <span>{profit >= 0 ? "กำไรสุทธิ" : "ขาดทุนสุทธิ"}</span>
                            <strong>{profit >= 0 ? "+" : "-"}฿{formatMoney(Math.abs(profit))}</strong>
                            <small>Margin {backendMargin.toFixed(2)}% · คำนวณจากข้อมูลบัญชีของช่วงที่เลือก</small>
                        </div>
                    </div>

                </div>

            </section>


            {/* =================================================
                TOP PRODUCTS
            ================================================= */}

            <section className="dashboard-section">

                <div className="dashboard-section-heading">

                    <div>

                        <h2>
                            สินค้าขายดี
                        </h2>

                        <p>
                            สินค้าที่สร้างยอดขายสูงสุด
                        </p>

                    </div>

                    <RankingLimitSelect
                        value={productLimit}
                        onChange={setProductLimit}
                        ariaLabel="จำนวนสินค้าที่ต้องการแสดง"
                    />

                </div>


                <div className="dashboard-panel">

                    <div className="dashboard-table-wrapper">

                        <table className="dashboard-table">

                            <thead>

                                <tr>

                                    <th>
                                        สินค้า
                                    </th>

                                    <th>
                                        ขาย
                                    </th>

                                    <th>
                                        ยอดขาย
                                    </th>

                                    <th>
                                        ต้นทุน
                                    </th>

                                    <th>
                                        กำไร
                                    </th>

                                    <th>
                                        Margin
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {data.topProducts?.length > 0 ? (

                                    (productLimit === 0
                                        ? data.topProducts
                                        : data.topProducts.slice(0, productLimit)
                                    ).map(
                                        (
                                            item,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    item?.product?.id ??
                                                    index
                                                }
                                            >

                                                <td>
                                                    {
                                                        item?.product?.name ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        item?.soldItems ||
                                                        0
                                                    }
                                                </td>

                                                <td>
                                                    ฿{formatMoney(
                                                        item?.grossSales
                                                    )}
                                                </td>

                                                <td>
                                                    ฿{formatMoney(
                                                        item?.cost
                                                    )}
                                                </td>

                                                <td
                                                    className={
                                                        Number(
                                                            item?.profit ||
                                                            0
                                                        ) < 0
                                                            ? "text-loss"
                                                            : "text-profit"
                                                    }
                                                >

                                                    {
                                                        Number(
                                                            item?.profit ||
                                                            0
                                                        ) < 0
                                                            ? "-"
                                                            : "+"
                                                    }

                                                    ฿{formatMoney(
                                                        Math.abs(
                                                            Number(
                                                                item?.profit ||
                                                                0
                                                            )
                                                        )
                                                    )}

                                                </td>

                                                <td>
                                                    {
                                                        item?.margin ??
                                                        0
                                                    }%
                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="6"
                                            style={{
                                                textAlign:
                                                    "center"
                                            }}
                                        >
                                            ยังไม่มีข้อมูลสินค้า
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </section>


            {/* =================================================
                CUSTOMERS
            ================================================= */}

            <section className="dashboard-section">

                <div className="dashboard-section-heading">

                    <div>

                        <h2>
                            ลูกค้ายอดซื้อสูงสุด
                        </h2>

                        <p>
                            ลูกค้าที่มียอดซื้อสะสมสูงสุด
                        </p>

                    </div>

                    <RankingLimitSelect
                        value={customerLimit}
                        onChange={setCustomerLimit}
                        ariaLabel="จำนวนลูกค้าที่ต้องการแสดง"
                    />

                </div>


                <div className="dashboard-panel">

                    <div className="dashboard-table-wrapper">

                        <table className="dashboard-table">

                            <thead>

                                <tr>

                                    <th>
                                        ลูกค้า
                                    </th>

                                    <th>
                                        เบอร์
                                    </th>

                                    <th>
                                        Order
                                    </th>

                                    <th>
                                        สินค้า
                                    </th>

                                    <th>
                                        ยอดซื้อ
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {data.topCustomers?.length > 0 ? (

                                    (customerLimit === 0
                                        ? data.topCustomers
                                        : data.topCustomers.slice(0, customerLimit)
                                    ).map(
                                        (
                                            customer,
                                            index
                                        ) => (

                                            <tr
                                                key={
                                                    customer?.id ??
                                                    customer?.phone ??
                                                    index
                                                }
                                            >

                                                <td>
                                                    {
                                                        customer?.name ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        customer?.phone ||
                                                        "-"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        customer?.orders ||
                                                        0
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        customer?.items ||
                                                        0
                                                    }
                                                </td>

                                                <td>
                                                    ฿{formatMoney(
                                                        customer?.total
                                                    )}
                                                </td>

                                            </tr>

                                        )
                                    )

                                ) : (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            style={{
                                                textAlign:
                                                    "center"
                                            }}
                                        >
                                            ยังไม่มีข้อมูลลูกค้า
                                        </td>

                                    </tr>

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </section>


            {/* =================================================
                AI
            ================================================= */}

            {AI_ENABLED && (

                <AIAnalysisSection
                    aiResult={aiResult}
                    aiLoading={aiLoading}
                    aiError={aiError}
                    metrics={metrics}
                    period={
                        periodLabel[period]
                    }
                    formatMoney={formatMoney}
                />

            )}

        </div>

    );

}


// ======================================================
// PERIOD SELECTOR (สถานะการเงินด้านบน)
// ======================================================

function PeriodSelect({ value, onChange, ariaLabel }) {
    return (
        <div className="dashboard-ranking-filter">
            <label>ช่วงเวลา</label>
            <select
                value={value}
                onChange={event => onChange(event.target.value)}
                aria-label={ariaLabel}
            >
                {PERIOD_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}


// ======================================================
// RANKING LIMIT SELECTOR
// ======================================================

function RankingLimitSelect({ value, onChange, ariaLabel }) {
    return (
        <div className="dashboard-ranking-filter">
            <label>แสดง</label>
            <select
                value={value}
                onChange={event => onChange(Number(event.target.value))}
                aria-label={ariaLabel}
            >
                {RANKING_LIMIT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}


// ======================================================
// CHART DATE POPUP
// ======================================================

function ChartDatePopup({ mode, selectedDate, selectedMonth, selectedYear, onSelect, onClose }) {
    const today = new Date();
    const [calendarMonth, setCalendarMonth] = useState(
        mode === "daily"
            ? fromDateKey(selectedDate)
            : mode === "monthly"
                ? fromDateKey(`${selectedMonth}-01`)
                : new Date(Number(selectedYear), 0, 1)
    );

    useEffect(() => {
        setCalendarMonth(
            mode === "daily"
                ? fromDateKey(selectedDate)
                : mode === "monthly"
                    ? fromDateKey(`${selectedMonth}-01`)
                    : new Date(Number(selectedYear), 0, 1)
        );
    }, [mode, selectedDate, selectedMonth, selectedYear]);

    const years = Array.from({ length: 11 }, (_, index) => today.getFullYear() - 5 + index);

    function renderDailyCalendar() {
        const year = calendarMonth.getFullYear();
        const month = calendarMonth.getMonth();
        const first = new Date(year, month, 1);
        const start = startOfWeekMonday(first);
        const days = Array.from({ length: 42 }, (_, index) => addDays(start, index));
        const weekNames = ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"];

        return (
            <>
                <div className="calendar-nav">
                    <button type="button" onClick={() => setCalendarMonth(new Date(year, month - 1, 1))}><ChevronLeft size={16} /></button>
                    <strong>{calendarMonth.toLocaleDateString("th-TH", { month: "long", year: "numeric" })}</strong>
                    <button type="button" onClick={() => setCalendarMonth(new Date(year, month + 1, 1))}><ChevronRight size={16} /></button>
                </div>
                <div className="calendar-weekdays">
                    {weekNames.map(day => <span key={day}>{day}</span>)}
                </div>
                <div className="calendar-days">
                    {days.map(day => {
                        const key = toDateKey(day);
                        const current = day.getMonth() === month;
                        const active = key === selectedDate;
                        return (
                            <button
                                key={key}
                                type="button"
                                className={`calendar-day ${current ? "current-month" : "muted"} ${active ? "selected" : ""}`}
                                onClick={() => onSelect(key)}
                            >
                                {day.getDate()}
                            </button>
                        );
                    })}
                </div>
            </>
        );
    }

    return (
        <div className="chart-calendar-popup" onMouseDown={event => event.stopPropagation()}>
            <div className="calendar-popup-header">
                <div>
                    <strong>เลือกช่วงเวลา</strong>
                    <span>{mode === "daily" ? "เลือกวันที่อ้างอิง · แสดง 7 วันย้อนหลัง" : mode === "monthly" ? "เลือกเดือนที่ต้องการดู" : "เลือกปีที่ต้องการดู"}</span>
                </div>
                <button type="button" className="calendar-close" onClick={onClose}><X size={16} /></button>
            </div>

            {mode === "daily" && renderDailyCalendar()}

            {mode === "monthly" && (
                <div className="month-picker-grid">
                    {Array.from({ length: 12 }, (_, index) => {
                        const value = `${calendarMonth.getFullYear()}-${String(index + 1).padStart(2, "0")}`;
                        const active = value === selectedMonth;
                        return (
                            <button key={value} type="button" className={active ? "selected" : ""} onClick={() => onSelect(value)}>
                                {new Date(calendarMonth.getFullYear(), index, 1).toLocaleDateString("th-TH", { month: "short" })}
                            </button>
                        );
                    })}
                    <div className="picker-year-row">
                        <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear() - 1, calendarMonth.getMonth(), 1))}><ChevronLeft size={15} /></button>
                        <strong>{calendarMonth.getFullYear() + 543}</strong>
                        <button type="button" onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear() + 1, calendarMonth.getMonth(), 1))}><ChevronRight size={15} /></button>
                    </div>
                </div>
            )}

            {mode === "yearly" && (
                <div className="year-picker-grid">
                    {years.map(year => (
                        <button key={year} type="button" className={Number(selectedYear) === year ? "selected" : ""} onClick={() => onSelect(year)}>
                            {year + 543}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}


// ======================================================
// CHART METRIC
// ======================================================

function ChartMetric({
    label,
    value,
    className
}) {

    return (

        <div className="chart-metric">

            <span
                className={`metric-dot ${className}`}
            />

            <div>

                <small>
                    {label}
                </small>

                <strong>
                    {value}
                </strong>

            </div>

        </div>

    );

}


// ======================================================
// GET ORDER COUNT
// ======================================================

function getOrderCount(data) {

    const candidates = [

        data?.summary?.orders,

        data?.summary?.orderCount,

        data?.orders,

        data?.orderCount,

        data?.sales?.orders

    ];


    for (
        const value of candidates
    ) {

        if (
            value !== undefined &&
            value !== null &&
            !Number.isNaN(
                Number(value)
            )
        ) {

            return Number(value);

        }

    }


    return 0;

}


// ======================================================
// GET ITEM COUNT
// ======================================================

function getItemCount(data) {

    const candidates = [

        data?.summary?.items,

        data?.summary?.soldItems,

        data?.items,

        data?.sales?.items,

        data?.inventory?.sold?.items

    ];


    for (
        const value of candidates
    ) {

        if (
            value !== undefined &&
            value !== null &&
            !Number.isNaN(
                Number(value)
            )
        ) {

            return Number(value);

        }

    }


    return 0;

}


// ======================================================
// AI ANALYSIS
// ======================================================

function AIAnalysisSection({
    aiResult,
    aiLoading,
    aiError,
    metrics,
    period,
    formatMoney
}) {

    const strengths =
        aiResult?.strengths || [];

    const problems =
        aiResult?.problems || [];

    const recommendations =
        aiResult?.recommendations || [];


    const summaryText =
        aiLoading
            ? "น้องเหมียวกำลังวิเคราะห์ข้อมูลอยู่นะ รอแป๊บนึง..."
            : (
                aiResult?.summary ||
                "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้"
            );


    return (

        <section className="dashboard-section">

            <div className="ai-analysis-wrapper">


                {/* HEADER */}

                <div className="ai-analysis-header">

                    <div className="ai-analysis-heading">

                        <div className="ai-analysis-icon">

                            <PawPrint
                                size={28}
                            />

                        </div>

                        <div>

                            <h2>
                                🐱 น้องเหมียวผู้ช่วยของคุณ🐾
                            </h2>

                            <p>
                                วิเคราะห์จากข้อมูลร้านในช่วง{" "}
                                {period}
                            </p>

                        </div>

                    </div>


                    <div className="ai-analysis-badge">

                        <Sparkles
                            size={15}
                        />

                        AI Analysis

                    </div>

                </div>


                {/* OVERVIEW */}

                <div className="ai-overview-card">

                    <div className="ai-overview-icon">

                        <PawPrint
                            size={24}
                        />

                    </div>

                    <div>

                        <h3>
                            🐾 มาดูภาพรวมกัน!
                        </h3>

                        <p>
                            {summaryText}
                        </p>

                        {aiError && (

                            <p className="ai-no-data">
                                ({aiError})
                            </p>

                        )}

                    </div>

                </div>


                {/* ANALYSIS GRID */}

                <div className="ai-analysis-grid">


                    {/* STRENGTHS */}

                    <AIBox
                        type="strength"
                        icon={
                            <CheckCircle2
                                size={21}
                            />
                        }
                        title="✨ จุดแข็ง"
                        items={strengths}
                        loading={aiLoading}
                        empty="ยังไม่มีข้อมูลเพียงพอ"
                        numbered={false}
                    />


                    {/* PROBLEMS */}

                    <AIBox
                        type="problem"
                        icon={
                            <AlertTriangle
                                size={21}
                            />
                        }
                        title="⚠️ สิ่งที่น้องเหมียวพบ"
                        items={problems}
                        loading={aiLoading}
                        empty="ยังไม่พบปัญหาหลัก"
                        numbered={false}
                    />


                    {/* RECOMMENDATIONS */}

                    <AIBox
                        type="recommendation"
                        icon={
                            <Lightbulb
                                size={21}
                            />
                        }
                        title="💡 น้องเหมียวแนะนำว่า"
                        items={recommendations}
                        loading={aiLoading}
                        empty="ยังไม่มีคำแนะนำ"
                        numbered={true}
                    />

                </div>


                {/* METRICS */}

                {metrics && (

                    <div className="ai-analysis-metrics">

                        <AIMetric
                            label="ยอดขายสุทธิ"
                            value={`฿${formatMoney(
                                metrics.netSales
                            )}`}
                        />


                        <AIMetric
                            label="ออเดอร์"
                            value={
                                metrics.orders
                            }
                        />


                        <AIMetric
                            label="สินค้าที่ขาย"
                            value={
                                metrics.items
                            }
                        />


                        <AIMetric
                            label="Margin"
                            value={
                                `${metrics.margin.toFixed(
                                    2
                                )}%`
                            }
                        />


                        <AIMetric
                            label="กำไรสุทธิ"
                            value={
                                `${
                                    metrics.profit >= 0
                                        ? "+"
                                        : "-"
                                }฿${formatMoney(
                                    Math.abs(
                                        metrics.profit
                                    )
                                )}`
                            }
                            className={
                                metrics.profit >= 0
                                    ? "ai-profit"
                                    : "ai-loss"
                            }
                        />


                        <AIMetric
                            label="สต็อกคงเหลือ"
                            value={
                                `${metrics.availableItems} ชิ้น`
                            }
                        />

                    </div>

                )}

            </div>

        </section>

    );

}


// ======================================================
// AI BOX
// ======================================================

function AIBox({
    type,
    icon,
    title,
    items,
    loading,
    empty,
    numbered
}) {

    return (

        <div
            className={
                `ai-analysis-box ${type}`
            }
        >

            <div className="ai-box-title">

                <div className="ai-box-icon">
                    {icon}
                </div>

                <h3>
                    {title}
                </h3>

            </div>


            {items.length > 0 ? (

                numbered ? (

                    <ol>

                        {items.map(
                            (
                                item,
                                index
                            ) => (

                                <li
                                    key={index}
                                >

                                    <span className="ai-number">
                                        {index + 1}
                                    </span>

                                    <span>
                                        {item}
                                    </span>

                                </li>

                            )
                        )}

                    </ol>

                ) : (

                    <ul>

                        {items.map(
                            (
                                item,
                                index
                            ) => (

                                <li
                                    key={index}
                                >

                                    <span className="ai-list-dot">
                                        {type === "problem"
                                            ? "!"
                                            : "✓"
                                        }
                                    </span>

                                    <span>
                                        {item}
                                    </span>

                                </li>

                            )
                        )}

                    </ul>

                )

            ) : (

                <p className="ai-no-data">

                    {
                        loading
                            ? "กำลังวิเคราะห์..."
                            : empty
                    }

                </p>

            )}

        </div>

    );

}


// ======================================================
// AI METRIC
// ======================================================

function AIMetric({
    label,
    value,
    className = ""
}) {

    return (

        <div className="ai-analysis-metric">

            <span>
                {label}
            </span>

            <strong
                className={className}
            >
                {value}
            </strong>

        </div>

    );

}


// ======================================================
// POSITION CARD
// ======================================================

function PositionCard({
    icon,
    title,
    value,
    description,
    type
}) {

    return (

        <div
            className={`position-card ${type}`}
        >

            <div className="position-icon">
                {icon}
            </div>

            <div className="position-content">

                <span>
                    {title}
                </span>

                <strong>
                    {value}
                </strong>

                <small>
                    {description}
                </small>

            </div>

        </div>

    );

}


// ======================================================
// STOCK CARD
// ======================================================

function StockCard({
    icon,
    title,
    value,
    suffix,
    money,
    description,
    type
}) {

    return (

        <div
            className={`stock-card ${type}`}
        >

            <div className="stock-icon">
                {icon}
            </div>

            <div className="stock-title">
                {title}
            </div>

            <strong>
                {value || 0} {suffix}
            </strong>

            <div className="stock-money">

                ฿{Number(
                    money || 0
                ).toLocaleString(
                    "th-TH",
                    {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    }
                )}

            </div>

            <small>
                {description}
            </small>

        </div>

    );

}


// ======================================================
// FINANCIAL ITEM
// ======================================================

function FinancialItem({
    icon,
    title,
    value,
    type,
    prefix = ""
}) {

    return (

        <div
            className={`financial-item ${type}`}
        >

            <div className="financial-icon">
                {icon}
            </div>

            <div>

                <span>
                    {title}
                </span>

                <strong>

                    {prefix}฿{Number(
                        value || 0
                    ).toLocaleString(
                        "th-TH",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    )}

                </strong>

            </div>

        </div>

    );

}


// ======================================================
// EXPORT
// ======================================================

export default Dashboard;