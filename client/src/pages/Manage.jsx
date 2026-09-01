
function Manage() {

    return (

        <div
            style={{
                padding: "20px"
            }}
        >

            <h1
                style={{
                    marginBottom: "10px"
                }}
            >
                จัดการข้อมูล
            </h1>


            <p
                style={{
                    color: "#666"
                }}
            >
                หน้าสำหรับจัดการข้อมูลพื้นฐานของระบบ
            </p>


            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "20px",
                    marginTop: "30px"
                }}
            >


                {/* =========================
                    OWNER
                ========================= */}

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        background: "#fff"
                    }}
                >

                    <h3>
                        👤 เจ้าของสินค้า
                    </h3>

                    <p
                        style={{
                            color: "#666"
                        }}
                    >
                        จัดการข้อมูลเจ้าของสินค้า
                    </p>

                </div>



                {/* =========================
                    CATEGORY
                ========================= */}

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        background: "#fff"
                    }}
                >

                    <h3>
                        📂 หมวดหมู่สินค้า
                    </h3>

                    <p
                        style={{
                            color: "#666"
                        }}
                    >
                        จัดการหมวดหมู่สินค้า
                    </p>

                </div>



                {/* =========================
                    USER
                ========================= */}

                <div
                    style={{
                        border: "1px solid #ddd",
                        borderRadius: "10px",
                        padding: "20px",
                        background: "#fff"
                    }}
                >

                    <h3>
                        👥 ผู้ใช้งาน
                    </h3>

                    <p
                        style={{
                            color: "#666"
                        }}
                    >
                        จัดการผู้ใช้งานระบบ
                    </p>

                </div>


            </div>

        </div>

    )

}


export default Manage
