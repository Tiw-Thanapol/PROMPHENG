import React from "react";

import {
UserRound,
Phone,
MapPin,
Mail,
FileText,
AlertCircle
} from "lucide-react";

// ======================================================
// CUSTOMER FORM
// ======================================================

export default function CustomerForm({
customer = {},
onChange,
errors = {},
disabled = false
}) {


// ==================================================
// CHANGE HANDLER
// ==================================================

function handleChange(field, value) {

    if (!onChange) {
        return;
    }

    onChange({
        ...customer,
        [field]: value
    });

}


// ==================================================
// FIELD ERROR
// ==================================================

function FieldError({ message }) {

    if (!message) {
        return null;
    }

    return (

        <div className="customer-field-error">

            <AlertCircle
                size={13}
            />

            <span>
                {message}
            </span>

        </div>

    );

}


// ==================================================
// INPUT WRAPPER
// ==================================================

function InputWrap({
    icon,
    field,
    type = "text",
    placeholder = "",
    autoComplete,
    textarea = false,
    rows = 3
}) {

    const hasError =
        Boolean(errors[field]);

    const value =
        customer[field] ?? "";

    return (

        <div className="customer-form-field">

            <label>

                {icon}

                <span>
                    {field === "name" && "ชื่อลูกค้า"}
                    {field === "phone" && "เบอร์โทรศัพท์"}
                    {field === "address" && "ที่อยู่จัดส่ง"}
                    {field === "email" && "อีเมล"}
                    {field === "note" && "หมายเหตุ"}
                </span>

                {(

                    field === "name" ||
                    field === "phone" ||
                    field === "address"

                ) && (

                    <span className="required">
                        *
                    </span>

                )}

                {(

                    field === "email" ||
                    field === "note"

                ) && (

                    <span className="optional">
                        (ไม่บังคับ)
                    </span>

                )}

            </label>


            <div
                className={

                    "customer-input-wrap " +

                    (

                        textarea
                            ? "customer-textarea-wrap "
                            : ""

                    ) +

                    (

                        hasError
                            ? "has-error"
                            : ""

                    )

                }
            >

                {React.cloneElement(
                    icon,
                    {
                        size: 17
                    }
                )}


                {textarea ? (

                    <textarea

                        placeholder={
                            placeholder
                        }

                        value={
                            value
                        }

                        onChange={e =>
                            handleChange(
                                field,
                                e.target.value
                            )
                        }

                        disabled={
                            disabled
                        }

                        rows={
                            rows
                        }

                    />

                ) : (

                    <input

                        type={
                            type
                        }

                        placeholder={
                            placeholder
                        }

                        value={
                            value
                        }

                        onChange={e =>
                            handleChange(
                                field,
                                e.target.value
                            )
                        }

                        disabled={
                            disabled
                        }

                        autoComplete={
                            autoComplete
                        }

                    />

                )}

            </div>


            <FieldError
                message={
                    errors[field]
                }
            />

        </div>

    );

}


// ==================================================
// RENDER
// ==================================================

return (

    <div className="customer-form">


        {/* ==========================================
            FORM HEADER
        ========================================== */}

        <div className="customer-form-header">

            <div className="customer-form-icon">

                <UserRound
                    size={19}
                />

            </div>


            <div>

                <strong>
                    Customer Information
                </strong>

                <span>
                    ข้อมูลลูกค้า
                </span>

            </div>

        </div>


        {/* ==========================================
            NAME
        ========================================== */}

        <InputWrap

            icon={
                <UserRound
                    size={15}
                />
            }

            field="name"

            placeholder="กรอกชื่อลูกค้า"

            autoComplete="name"

        />


        {/* ==========================================
            PHONE
        ========================================== */}

        <InputWrap

            icon={
                <Phone
                    size={15}
                />
            }

            field="phone"

            type="tel"

            placeholder="08xxxxxxxx"

            autoComplete="tel"

        />


        {/* ==========================================
            ADDRESS
        ========================================== */}

        <InputWrap

            icon={
                <MapPin
                    size={15}
                />
            }

            field="address"

            textarea

            rows={4}

            placeholder={
                "บ้านเลขที่ / หมู่ / ถนน / ตำบล / อำเภอ / จังหวัด / รหัสไปรษณีย์"
            }

        />


        {/* ==========================================
            EMAIL
        ========================================== */}

        <InputWrap

            icon={
                <Mail
                    size={15}
                />
            }

            field="email"

            type="email"

            placeholder="example@email.com"

            autoComplete="email"

        />


        {/* ==========================================
            NOTE
        ========================================== */}

        <InputWrap

            icon={
                <FileText
                    size={15}
                />
            }

            field="note"

            textarea

            rows={3}

            placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับลูกค้า..."

        />

    </div>

);


}
