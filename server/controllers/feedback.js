// ======================================================
// FEEDBACK CONTROLLER
// ======================================================

const nodemailer = require("nodemailer")


// ======================================================
// SMTP TRANSPORTER
// ======================================================

const transporter =
    nodemailer.createTransport({

        host:
            process.env.SMTP_HOST,

        port:
            Number(
                process.env.SMTP_PORT || 587
            ),

        secure:
            process.env.SMTP_SECURE === "true",

        auth: {

            user:
                process.env.SMTP_USER,

            pass:
                process.env.SMTP_PASS

        }

    })


// ======================================================
// CONFIG
// ======================================================

const FEEDBACK_EMAIL =
    process.env.FEEDBACK_EMAIL ||
    process.env.SMTP_FROM ||
    "prompheng.services@gmail.com"


const APP_VERSION =
    "v0.1.0-beta"


// ======================================================
// HELPERS
// ======================================================

function cleanText(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return ""

    }


    return String(value)
        .trim()

}


function escapeHtml(value) {

    return cleanText(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        )

}


function getFeedbackTypeLabel(type) {

    const types = {

        bug:
            "🐛 แจ้งปัญหา",

        feature:
            "💡 เสนอฟีเจอร์",

        suggestion:
            "💬 ข้อเสนอแนะ"

    }


    return (
        types[type] ||
        "💬 ข้อเสนอแนะ"
    )

}


// ======================================================
// SUBMIT FEEDBACK
// ======================================================

exports.submitFeedback =
    async (
        req,
        res
    ) => {

        try {

            // ==================================================
            // AUTH
            // ==================================================

            const user =
                req.user ||
                req.currentUser


            if (!user) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Unauthorized"

                })

            }


            // ==================================================
            // BODY
            // ==================================================

            const type =
                cleanText(
                    req.body?.type
                )

            const message =
                cleanText(
                    req.body?.message
                )

            const page =
                cleanText(
                    req.body?.page
                ) ||
                "ไม่ระบุ"


            // ==================================================
            // VALIDATE TYPE
            // ==================================================

            const allowedTypes = [

                "bug",
                "feature",
                "suggestion"

            ]


            if (
                !allowedTypes.includes(type)
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid feedback type"

                })

            }


            // ==================================================
            // VALIDATE MESSAGE
            // ==================================================

            if (!message) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "กรุณากรอกรายละเอียด"

                })

            }


            if (
                message.length < 3
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "รายละเอียดสั้นเกินไป"

                })

            }


            if (
                message.length > 10000
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "รายละเอียดต้องไม่เกิน 10,000 ตัวอักษร"

                })

            }


            // ==================================================
            // USER INFORMATION
            // ==================================================

            const userId =
                user.id ||
                user.userId ||
                "ไม่ระบุ"


            const userEmail =
                user.email ||
                "ไม่ระบุ"


            const userName =
                user.name ||
                user.username ||
                user.displayName ||
                user.email ||
                "ไม่ระบุ"


            // ==================================================
            // REQUEST INFORMATION
            // ==================================================

            const submittedAt =
                new Date()


            const formattedDate =
                submittedAt.toLocaleString(
                    "th-TH",
                    {
                        timeZone:
                            "Asia/Bangkok"
                    }
                )


            const userAgent =
                cleanText(
                    req.headers[
                        "user-agent"
                    ]
                ) ||
                "ไม่ระบุ"


            // ==================================================
            // EMAIL SUBJECT
            // ==================================================

            const typeLabel =
                getFeedbackTypeLabel(
                    type
                )


            const subject =
                `[PROMPHENG Beta] ${typeLabel}`


            // ==================================================
            // EMAIL TEXT
            // ==================================================

            const text = `PROMPHENG Beta Feedback

ประเภท:
${typeLabel}

ผู้ใช้:
${userName}

Email:
${userEmail}

User ID:
${userId}

หน้า:
${page}

Version:
${APP_VERSION}

เวลา:
${formattedDate}

User Agent:
${userAgent}

----------------------------------------

รายละเอียด:

${message}

----------------------------------------

This feedback was submitted from PROMPHENG ${APP_VERSION}.
`


            // ==================================================
            // EMAIL HTML
            // ==================================================

            const html = `

<!DOCTYPE html>

<html lang="th">

<head>

<meta charset="UTF-8">

<title>PROMPHENG Beta Feedback</title>

</head>

<body
    style="
        margin:0;
        padding:24px;
        background:#f8f5ff;
        font-family:Arial,sans-serif;
        color:#333;
    "
>

<div
    style="
        max-width:680px;
        margin:auto;
        background:#ffffff;
        border-radius:20px;
        padding:28px;
        box-shadow:0 8px 30px rgba(0,0,0,0.08);
    "
>

<h2
    style="
        margin-top:0;
        color:#6d5dfc;
    "
>
    🚀 PROMPHENG Beta Feedback
</h2>


<div
    style="
        background:#f3efff;
        border-radius:14px;
        padding:16px;
        margin-bottom:20px;
    "
>

<strong>
    ${escapeHtml(typeLabel)}
</strong>

</div>


<table
    style="
        width:100%;
        border-collapse:collapse;
        margin-bottom:24px;
    "
>

<tr>
<td style="padding:8px 0;font-weight:bold;">
ผู้ใช้
</td>
<td style="padding:8px 0;">
${escapeHtml(userName)}
</td>
</tr>


<tr>
<td style="padding:8px 0;font-weight:bold;">
Email
</td>
<td style="padding:8px 0;">
${escapeHtml(userEmail)}
</td>
</tr>


<tr>
<td style="padding:8px 0;font-weight:bold;">
User ID
</td>
<td style="padding:8px 0;">
${escapeHtml(userId)}
</td>
</tr>


<tr>
<td style="padding:8px 0;font-weight:bold;">
หน้า
</td>
<td style="padding:8px 0;">
${escapeHtml(page)}
</td>
</tr>


<tr>
<td style="padding:8px 0;font-weight:bold;">
Version
</td>
<td style="padding:8px 0;">
${APP_VERSION}
</td>
</tr>


<tr>
<td style="padding:8px 0;font-weight:bold;">
เวลา
</td>
<td style="padding:8px 0;">
${escapeHtml(formattedDate)}
</td>
</tr>

</table>


<div
    style="
        background:#fff8fc;
        border:1px solid #f0ddeb;
        border-radius:14px;
        padding:18px;
        white-space:pre-wrap;
        line-height:1.7;
    "
>

<strong>
รายละเอียด
</strong>

<br><br>

${escapeHtml(message)}

</div>


<p
    style="
        margin-top:24px;
        font-size:12px;
        color:#999;
    "
>

PROMPHENG ${APP_VERSION}

</p>

</div>

</body>

</html>

`


            // ==================================================
            // SEND EMAIL
            // ==================================================

            await transporter.sendMail({

                from:
                    process.env.SMTP_FROM ||
                    process.env.SMTP_USER,

                to:
                    FEEDBACK_EMAIL,

                replyTo:
                    userEmail !== "ไม่ระบุ"
                        ? userEmail
                        : undefined,

                subject,

                text,

                html

            })


            // ==================================================
            // SUCCESS
            // ==================================================

            return res.status(200).json({

                success:
                    true,

                message:
                    "ส่งข้อเสนอแนะเรียบร้อยแล้ว"

            })


        } catch (err) {

            console.error(
                "SUBMIT FEEDBACK ERROR:",
                err
            )


            return res.status(500).json({

                success:
                    false,

                message:
                    "ไม่สามารถส่งข้อเสนอแนะได้ กรุณาลองใหม่อีกครั้ง"

            })

        }

    }