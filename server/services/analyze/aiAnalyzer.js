// ======================================================
// AI ANALYZER
// server/services/ai/aiAnalyze.js
// ======================================================
//
// Business Analysis
//
// รับข้อมูลจาก Dashboard
// ↓
// สร้าง Prompt
// ↓
// Gemini
// ↓
// JSON Analysis
//
// ======================================================

const {
    GoogleGenAI
} = require("@google/genai");


// ======================================================
// GEMINI CLIENT
// ======================================================

const apiKey =
    process.env.GEMINI_API_KEY;


let ai = null;


if (apiKey) {

    ai =
        new GoogleGenAI({
            apiKey
        });

}


// ======================================================
// SAFE JSON
// ======================================================

function safeJSON(data) {

    try {

        return JSON.stringify(
            data ?? {},
            null,
            2
        );

    }
    catch (error) {

        return "{}";

    }

}


// ======================================================
// CLEAN AI JSON
// ======================================================

function cleanAIResponse(text) {

    if (!text) {

        return null;

    }


    let cleaned =
        String(text)
            .trim();


    // ==================================================
    // Remove markdown code block
    // ==================================================

    cleaned =
        cleaned.replace(
            /^```json\s*/i,
            ""
        );


    cleaned =
        cleaned.replace(
            /^```\s*/i,
            ""
        );


    cleaned =
        cleaned.replace(
            /\s*```$/i,
            ""
        );


    // ==================================================
    // Find JSON
    // ==================================================

    const firstBrace =
        cleaned.indexOf("{");


    const lastBrace =
        cleaned.lastIndexOf("}");


    if (
        firstBrace !== -1 &&
        lastBrace !== -1 &&
        lastBrace > firstBrace
    ) {

        cleaned =
            cleaned.slice(
                firstBrace,
                lastBrace + 1
            );

    }


    try {

        return JSON.parse(
            cleaned
        );

    }
    catch (error) {

        return null;

    }

}


// ======================================================
// DEFAULT RESULT
// ======================================================

function getDefaultAnalysis() {

    return {

        summary:
            "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้",

        strengths: [],

        problems: [],

        recommendations: []

    };

}


// ======================================================
// BUILD AI CONTEXT
// ======================================================

function buildAIContext(
    analysis = {}
) {

    const {

        sales = {},

        profit = {},

        inventory = {},

        product = {},

        trends = {},

        findings = {}

    } = analysis;


    const systemInstruction = `

คุณคือ "น้องเหมียว" AI Business Analyst
สำหรับระบบจัดการธุรกิจและยอดขาย

บุคลิก: ฉลาด วิเคราะห์แม่นยำ พูดจาดี รู้จักชมเชย ให้กำลังใจ เป็นกันเอง มีความกวนติดตลกแบบน่ารัก
เหมือนเพื่อนที่ปรึกษาธุรกิจให้แบบจริงจัง ที่ซีเรียสเรื่องการทำธุรกิจ แต่พูดหยอดมุกได้ เพื่อสร้างบรรยาศ และกำลังใจสำหรับคนทำธุรกิจ

หน้าที่ของคุณคือ:

- วิเคราะห์ยอดขาย
- วิเคราะห์รายได้
- วิเคราะห์ต้นทุน
- วิเคราะห์กำไร
- วิเคราะห์สินค้า
- วิเคราะห์ Stock
- วิเคราะห์แนวโน้มธุรกิจ
- ค้นหาจุดแข็ง
- ค้นหาปัญหา
- ให้คำแนะนำทางธุรกิจ (recommendations)
- ให้คำแนะนำทางธุรกิจที่ทำได้จริง



กฎสำคัญ:

1. ตอบภาษาไทยเท่านั้น
2. ใช้ข้อมูลที่ได้รับเท่านั้น
3. ห้ามสร้างตัวเลขขึ้นเอง
4. ห้ามเดาตัวเลข
5. หากข้อมูลไม่เพียงพอ ให้ระบุว่า ขอข้อมูลเพิ่มหน่อย เผื่อจะช่วยได้
6. ห้ามสมมติข้อมูลที่ไม่มีในระบบ
7. วิเคราะห์ภาพรวมก่อนรายละเอียด
8. คำแนะนำต้องสัมพันธ์กับข้อมูลจริง
9. อย่าแสดงข้อมูลดิบทั้งหมด
10. อย่าใช้ Markdown


กฎเรื่อง "recommendations" (สำคัญมาก):

- ให้คำแนะนำทั้งหมด 3-5 ข้อ
- ข้อแรกเสมอ ต้องเป็นคำแนะนำเชิงกลยุทธ์จริงจัง อิงข้อมูลจริง ทำได้จริง
  เช่น "ลดต้นทุนหรือปรับราคาเสื้อ C เพื่อเพิ่มกำไรต่อชิ้น"
- อนุญาตให้แทรกคำแนะนำแบบ "กวนๆ น่ารักๆ" ได้ไม่เกิน 1 ข้อ จากทั้งหมด
  โทนกวนที่อนุญาต:
    - ปลอบใจแบบเข้าใจโลกธุรกิจ เช่น "บางครั้งก็ต้องยอมกำไรน้อยลง เพื่อระบายสต๊อก ถือว่าคืนทุนเร็วดีกว่าจมสต๊อก"
    - แซวแบบมูเตลู/ความเชื่อ เช่น "ถ้าขายซบเซาต่อเนื่อง ลองไปมูเรื่องการค้าดูสักหน่อย เผื่อดวงช่วยดันยอดขาย"
    - ให้กำลังใจแบบกวนๆ เช่น "ยอดยังไม่ดีไม่ใช่จุดจบ ปรับกลยุทธ์นิดหน่อยแล้วลุยใหม่" ,
     "ท้อได้แต่อย่าถอย ถ้าจะถอยต้องถอยป้ายแดง" ,
    "จะขาขึ้นหรือขาลง ไม่ต้องสน เพราะมีแต่ขาเราเท่านั้น ที่พาชีวิตไปข้างหน้า"
- ข้อกวนต้องอ่านแล้วรู้สึกเอ็นดู ไม่ทำให้ผู้ใช้รู้สึกแย่ ไม่เสียดสีแรง
  ห้ามใช้แทนคำแนะนำจริงจัง ต้องมีคำแนะนำจริงจังอย่างน้อย 70% ของลิสต์เสมอ
- ห้ามใส่มุกกวนติดกัน 2 ข้อ และห้ามใส่มุกถ้าไม่มีคำแนะนำจริงจังอย่างน้อย 2 ข้ออยู่ในลิสต์แล้ว
- อย่าใช้มุกเดิมซ้ำทุกครั้ง ให้สุ่มโทนความกวนแต่ละครั้งที่วิเคราะห์
- ให้คำแนะนำทั้งหมด 2-5 ข้อ ขึ้นกับจำนวนประเด็นที่พบจริงจากข้อมูล
  ไม่ต้องยัดให้ครบ 3-5 ข้อถ้าข้อมูลไม่พอ
- ถ้ามีคำแนะนำจริงจังอย่างน้อย 1 ข้อ อนุญาตให้แทรกมุกกวนๆ ได้ 1 ข้อ
  (ลดจากเดิมที่ต้องมี 2 ข้อขึ้นไป)
- ถ้ามีคำแนะนำจริงจังแค่ 1 ข้อ ให้เพิ่มมุกให้กำลังใจแนวนี้ต่อท้ายได้เลย
  เพื่อไม่ให้คำแนะนำดูสั้นห้วนเกินไป


ต้องตอบเป็น JSON เท่านั้น

รูปแบบ:

{
    "summary": "สรุปภาพรวมธุรกิจ",
    "strengths": [
        "จุดแข็ง"
    ],
    "problems": [
        "ปัญหาหรือความเสี่ยง"
    ],
    "recommendations": [
        "คำแนะนำที่ทำได้จริง"
    ]
}


ห้ามตอบ:

- Markdown
- Code block
- ข้อความก่อน JSON
- ข้อความหลัง JSON

`;


    const userPrompt = `

วิเคราะห์ธุรกิจจากข้อมูล Dashboard ต่อไปนี้


==============================
SALES
==============================

${safeJSON(sales)}


==============================
PROFIT
==============================

${safeJSON(profit)}


==============================
INVENTORY
==============================

${safeJSON(inventory)}


==============================
PRODUCT
==============================

${safeJSON(product)}


==============================
TREND
==============================

${safeJSON(trends)}


==============================
FINDINGS
==============================

${safeJSON(findings)}


==============================

สร้าง Business Analysis JSON

`;


    return {

        systemInstruction,

        userPrompt

    };

}


// ======================================================
// ANALYZE BUSINESS
// ======================================================

async function analyzeBusiness(
    analysis = {}
) {

    // ==================================================
    // No API KEY
    // ==================================================

    if (!apiKey || !ai) {

        console.warn(
            "GEMINI_API_KEY is not configured"
        );


        return {

            ...getDefaultAnalysis(),

            error:
                "GEMINI_API_KEY is not configured"

        };

    }


    // ==================================================
    // BUILD CONTEXT
    // ==================================================

    const context =
        buildAIContext(
            analysis
        );


    try {

        // ==================================================
        // GEMINI
        // ==================================================

        const response =
            await ai.models.generateContent({

                model:
                    "gemini-2.5-flash",

                contents:
                    context.userPrompt,

                config: {

                    systemInstruction:
                        context.systemInstruction,

                    temperature:
                        0.5,

                    responseMimeType:
                        "application/json"

                }

            });


        // ==================================================
        // RESPONSE TEXT
        // ==================================================

        const text =
            response.text;


        const result =
            cleanAIResponse(
                text
            );


        // ==================================================
        // INVALID JSON
        // ==================================================

        if (!result) {

            console.error(
                "Gemini returned invalid JSON:",
                text
            );


            return {

                ...getDefaultAnalysis(),

                error:
                    "Gemini returned invalid JSON"

            };

        }


        // ==================================================
        // NORMALIZE
        // ==================================================

        return {

            summary:
                typeof result.summary === "string"
                    ? result.summary
                    : "",

            strengths:
                Array.isArray(
                    result.strengths
                )
                    ? result.strengths
                    : [],

            problems:
                Array.isArray(
                    result.problems
                )
                    ? result.problems
                    : [],

            recommendations:
                Array.isArray(
                    result.recommendations
                )
                    ? result.recommendations
                    : []

        };

    }
    catch (error) {

        console.error(
            "AI Analyzer Error:",
            error
        );


        return {

            ...getDefaultAnalysis(),

            error:
                error.message

        };

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    buildAIContext,

    analyzeBusiness

};
