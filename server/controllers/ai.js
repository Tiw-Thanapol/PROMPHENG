// ======================================================
// AI CONTROLLER
// controllers/ai.js
// ======================================================

const {
    buildAIContext
} = require("../services/analyze/aiAnalyzer");

const {
    analyzeWithAI
} = require("../services/ai/aiService");


async function analyzeAI(req, res) {

    try {

        const data = req.body;

        console.log("================================");
        console.log("AI CONTROLLER START");
        console.log("================================");

        const aiContext =
            buildAIContext(data);

        console.log("AI CONTEXT READY");

        const result =
            await analyzeWithAI(
                aiContext,
                {
                    temperature: 0.2
                }
            );

        console.log("AI COMPLETE");

        if (!result.success) {

            return res.status(500).json({

                success: false,

                message:
                    result.error || "AI analysis failed"

            });

        }

        return res.json({

            success: true,

            data: result.data,

            model: result.model,

            responseId: result.responseId

        });

    }
    catch (error) {

        console.error(
            "AI CONTROLLER ERROR",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

}


module.exports = {
    analyzeAI
};