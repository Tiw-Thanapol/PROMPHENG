// ======================================================
// AI SERVICE
// server/services/ai/aiService.js
// ======================================================
//
// หน้าที่:
//
// Controller
//    ↓
// analyzeEngine
//    ↓
// analysis.aiContext
//    ↓
// analyzeWithAI()
//    ↓
// Gemini
//    ↓
// JSON
//
// ======================================================

const {
    GoogleGenerativeAI
} = require("@google/generative-ai");


// ======================================================
// CONFIG
// ======================================================

const API_KEY =
    process.env.GEMINI_API_KEY;

const MODEL =
    process.env.GEMINI_MODEL ||
    "gemini-2.5-flash";


if (!API_KEY) {

    console.warn(
        "⚠ GEMINI_API_KEY is not configured"
    );

}


// ======================================================
// GEMINI CLIENT
// ======================================================

const genAI =
    API_KEY
        ? new GoogleGenerativeAI(API_KEY)
        : null;


// ======================================================
// DEFAULT RESPONSE
// ======================================================

function defaultAIResponse() {

    return {

        summary:
            "ยังไม่สามารถวิเคราะห์ข้อมูลด้วย AI ได้",

        strengths: [],

        problems: [],

        recommendations: []

    };

}


// ======================================================
// EXTRACT JSON
// ======================================================

function extractJSON(text) {

    if (!text) {

        return null;

    }


    let clean =
        String(text)
            .trim();


    // --------------------------------------------------
    // Remove markdown
    // --------------------------------------------------

    clean =
        clean.replace(
            /^```json\s*/i,
            ""
        );


    clean =
        clean.replace(
            /^```\s*/i,
            ""
        );


    clean =
        clean.replace(
            /\s*```$/i,
            ""
        );


    clean =
        clean.trim();


    // --------------------------------------------------
    // Direct JSON
    // --------------------------------------------------

    try {

        return JSON.parse(
            clean
        );

    }
    catch (error) {

        // Continue
    }


    // --------------------------------------------------
    // Find JSON object
    // --------------------------------------------------

    const firstBrace =
        clean.indexOf("{");


    const lastBrace =
        clean.lastIndexOf("}");


    if (
        firstBrace === -1 ||
        lastBrace === -1 ||
        lastBrace <= firstBrace
    ) {

        return null;

    }


    const jsonText =
        clean.slice(
            firstBrace,
            lastBrace + 1
        );


    try {

        return JSON.parse(
            jsonText
        );

    }
    catch (error) {

        return null;

    }

}


// ======================================================
// NORMALIZE AI RESPONSE
// ======================================================

function normalizeAIResponse(
    json
) {

    if (
        !json ||
        typeof json !== "object"
    ) {

        return defaultAIResponse();

    }


    return {

        summary:
            typeof json.summary === "string"
                ? json.summary
                : "",


        strengths:
            Array.isArray(
                json.strengths
            )
                ? json.strengths
                : [],


        problems:
            Array.isArray(
                json.problems
            )
                ? json.problems
                : [],


        recommendations:
            Array.isArray(
                json.recommendations
            )
                ? json.recommendations
                : []

    };

}


// ======================================================
// ANALYZE WITH AI
// ======================================================

async function analyzeWithAI(
    context,
    options = {}
) {

    // ==================================================
    // VALIDATE CONTEXT
    // ==================================================

    if (
        !context ||
        typeof context !== "object"
    ) {

        throw new Error(
            "Invalid AI Context"
        );

    }


    if (
        !context.systemInstruction ||
        !context.userPrompt
    ) {

        throw new Error(
            "AI Context requires systemInstruction and userPrompt"
        );

    }


    // ==================================================
    // CHECK API KEY
    // ==================================================

    if (!API_KEY || !genAI) {

        return {

            success: false,

            text: null,

            data:
                defaultAIResponse(),

            model: MODEL,

            responseId: null,

            error:
                "GEMINI_API_KEY is not configured"

        };

    }


    // ==================================================
    // DEBUG
    // ==================================================

    console.log("");

    console.log(
        "========================================"
    );

    console.log(
        " GEMINI AI REQUEST "
    );

    console.log(
        "========================================"
    );

    console.log(
        "MODEL:",
        MODEL
    );


    // ==================================================
    // CREATE MODEL
    // ==================================================

    const model =
        genAI.getGenerativeModel({

            model: MODEL,

            systemInstruction:
                context.systemInstruction

        });


    // ==================================================
    // GENERATE CONTENT
    // ==================================================

    try {

        const result =
            await model.generateContent({

                contents: [

                    {

                        role: "user",

                        parts: [

                            {

                                text:
                                    context.userPrompt

                            }

                        ]

                    }

                ],

                generationConfig: {

                    temperature:
                        options.temperature ?? 0.5,

                    // เพิ่มจาก 3000 เป็น 4096 กัน Gemini
                    // ตอบยาว (วิเคราะห์ระดับ order/product id)
                    // แล้วโดนตัดท้าย ทำให้ parse JSON ไม่สำเร็จ

                    maxOutputTokens:
                        options.maxOutputTokens ?? 4096,

                    responseMimeType:
                        "application/json"

                }

            });


        // ==================================================
        // GEMINI RESPONSE
        // ==================================================

        const response =
            result.response;


        const text =
            response.text();


        console.log("");

        console.log(
            "GEMINI RESPONSE RECEIVED"
        );


        console.log(
            "TEXT LENGTH:",
            text?.length || 0
        );


        // ==================================================
        // FINISH REASON DEBUG
        // ตรวจว่า Gemini หยุดตอบเพราะโดนตัด token หรือไม่
        // ==================================================

        const finishReason =
            response.candidates?.[0]?.finishReason;


        if (finishReason) {

            console.log(
                "FINISH REASON:",
                finishReason
            );


            if (finishReason === "MAX_TOKENS") {

                console.warn(
                    "⚠ Gemini response was cut off due to maxOutputTokens limit"
                );

            }

        }


        // ==================================================
        // PARSE JSON
        // ==================================================

        const parsed =
            extractJSON(text);


        if (!parsed) {

            console.error(
                "Gemini returned invalid JSON"
            );


            console.error(
                text
            );


            return {

                success: false,

                text:

                    text || null,

                data:
                    defaultAIResponse(),

                model: MODEL,

                responseId:
                    response.responseId || null,

                error:
                    finishReason === "MAX_TOKENS"
                        ? "Gemini response was cut off (max tokens reached)"
                        : "Gemini returned invalid JSON"

            };

        }


        // ==================================================
        // NORMALIZE
        // ==================================================

        const data =
            normalizeAIResponse(
                parsed
            );


        // ==================================================
        // SUCCESS
        // ==================================================

        console.log("");

        console.log(
            "AI ANALYSIS SUCCESS"
        );

        console.log(
            "========================================"
        );

        console.log("");


        return {

            success: true,

            // Raw text
            text:

                JSON.stringify(
                    data
                ),

            // Parsed JSON
            data,

            model: MODEL,

            responseId:
                response.responseId || null

        };

    }
    catch (error) {

        // ==================================================
        // ERROR
        // ==================================================

        console.error("");

        console.error(
            "========================================"
        );

        console.error(
            " GEMINI AI ERROR "
        );

        console.error(
            "========================================"
        );

        console.error(
            error.message
        );

        console.error("");


        return {

            success: false,

            text: null,

            data:
                defaultAIResponse(),

            model: MODEL,

            responseId: null,

            error:
                error.message

        };

    }

}


// ======================================================
// EXPORT
// ======================================================

module.exports = {

    analyzeWithAI,

    defaultAIResponse,

    normalizeAIResponse

};