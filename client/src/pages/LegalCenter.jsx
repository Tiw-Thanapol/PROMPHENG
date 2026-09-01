import React from "react";
import {
    ArrowLeft,
    ShieldCheck,
    LockKeyhole,
    Cookie,
    FileText,
    UserRound,
    Mail,
    Database,
    Trash2
} from "lucide-react";

import {
    Link,
    useLocation
} from "react-router-dom";

import "./LegalCenter.css";


// ======================================================
// LEGAL VERSION
// ======================================================

const LEGAL_VERSION = "1.0";

const LAST_UPDATED =
    "1 กันยายน 2026";


// ======================================================
// LEGAL CENTER
// ======================================================

export default function LegalCenter() {

    const location =
        useLocation();

    const pathname =
        location.pathname;


    // ==================================================
    // CURRENT SECTION
    // ==================================================

    let section = "home";

    if (
        pathname ===
        "/legal/terms"
    ) {
        section = "terms";
    }

    if (
        pathname ===
        "/legal/privacy"
    ) {
        section = "privacy";
    }

    if (
        pathname ===
        "/legal/cookies"
    ) {
        section = "cookies";
    }

    if (
        pathname ===
        "/legal/data-deletion"
    ) {
        section = "data-deletion";
    }

    if (
        pathname ===
        "/legal/contact"
    ) {
        section = "contact";
    }


    return (
        <div className="legal-page">

            {/* ==========================================
                HEADER
            ========================================== */}

            <header className="legal-header">

                <div className="legal-header-inner">

                    <Link
                        to="/"
                        className="legal-brand"
                    >
                        Sale Record
                    </Link>

                    <Link
                        to="/"
                        className="legal-back"
                    >
                        <ArrowLeft size={16} />
                        กลับหน้าหลัก
                    </Link>

                </div>

            </header>


            {/* ==========================================
                BODY
            ========================================== */}

            <main className="legal-main">

                <div className="legal-layout">

                    {/* ==================================
                        SIDEBAR
                    ================================== */}

                    <aside className="legal-sidebar">

                        <div className="legal-sidebar-title">
                            Legal Center
                        </div>


                        <Link
                            to="/legal"
                            className={
                                section === "home"
                                    ? "active"
                                    : ""
                            }
                        >
                            <ShieldCheck size={16} />
                            <span>ภาพรวม</span>
                        </Link>


                        <Link
                            to="/legal/terms"
                            className={
                                section === "terms"
                                    ? "active"
                                    : ""
                            }
                        >
                            <FileText size={16} />
                            <span>ข้อกำหนดการใช้บริการ</span>
                        </Link>


                        <Link
                            to="/legal/privacy"
                            className={
                                section === "privacy"
                                    ? "active"
                                    : ""
                            }
                        >
                            <LockKeyhole size={16} />
                            <span>นโยบายความเป็นส่วนตัว</span>
                        </Link>


                        <Link
                            to="/legal/cookies"
                            className={
                                section === "cookies"
                                    ? "active"
                                    : ""
                            }
                        >
                            <Cookie size={16} />
                            <span>นโยบาย Cookies</span>
                        </Link>


                        <Link
                            to="/legal/data-deletion"
                            className={
                                section === "data-deletion"
                                    ? "active"
                                    : ""
                            }
                        >
                            <Trash2 size={16} />
                            <span>การลบบัญชีและข้อมูล</span>
                        </Link>


                        <Link
                            to="/legal/contact"
                            className={
                                section === "contact"
                                    ? "active"
                                    : ""
                            }
                        >
                            <Mail size={16} />
                            <span>ติดต่อเรา</span>
                        </Link>

                    </aside>


                    {/* ==================================
                        CONTENT
                    ================================== */}

                    <section className="legal-content">

                        {section === "home" && (
                            <LegalHome />
                        )}

                        {section === "terms" && (
                            <Terms />
                        )}

                        {section === "privacy" && (
                            <Privacy />
                        )}

                        {section === "cookies" && (
                            <Cookies />
                        )}

                        {section === "data-deletion" && (
                            <DataDeletion />
                        )}

                        {section === "contact" && (
                            <Contact />
                        )}

                    </section>

                </div>

            </main>

        </div>
    );
}


// ======================================================
// LEGAL HOME
// ======================================================

function LegalHome() {

    return (
        <LegalDocument
            icon={<ShieldCheck />}
            title="Legal Center"
            subtitle="ข้อมูลด้านข้อกำหนด ความเป็นส่วนตัว และการจัดการข้อมูล"
        >

            <div className="legal-intro-card">

                <ShieldCheck size={25} />

                <div>
                    <strong>
                        ความโปร่งใสและความปลอดภัยของข้อมูล
                    </strong>

                    <p>
                        Sale Record ให้ความสำคัญกับ
                        ความปลอดภัยของบัญชี
                        ข้อมูลธุรกิจ และข้อมูลส่วนบุคคล
                        ที่ผู้ใช้นำเข้าสู่ระบบ
                    </p>
                </div>

            </div>


            <div className="legal-document-grid">

                <LegalCard
                    icon={<FileText />}
                    title="ข้อกำหนดการใช้บริการ"
                    description="เงื่อนไขและข้อกำหนดสำหรับการใช้งาน Sale Record"
                    to="/legal/terms"
                />

                <LegalCard
                    icon={<LockKeyhole />}
                    title="นโยบายความเป็นส่วนตัว"
                    description="รายละเอียดเกี่ยวกับข้อมูลที่เราเก็บและการใช้งานข้อมูล"
                    to="/legal/privacy"
                />

                <LegalCard
                    icon={<Cookie />}
                    title="นโยบาย Cookies"
                    description="รายละเอียดเกี่ยวกับ Cookies และเทคโนโลยีที่เกี่ยวข้อง"
                    to="/legal/cookies"
                />

                <LegalCard
                    icon={<Trash2 />}
                    title="การลบบัญชีและข้อมูล"
                    description="ข้อมูลเกี่ยวกับการยกเลิกบัญชีและการจัดการข้อมูล"
                    to="/legal/data-deletion"
                />

            </div>


            <div className="legal-meta">

                <span>
                    Legal Version {LEGAL_VERSION}
                </span>

                <span>
                    ปรับปรุงล่าสุด {LAST_UPDATED}
                </span>

            </div>

        </LegalDocument>
    );
}


// ======================================================
// TERMS
// ======================================================

function Terms() {

    return (
        <LegalDocument
            icon={<FileText />}
            title="ข้อกำหนดและเงื่อนไขการใช้บริการ"
            subtitle={`ฉบับ ${LEGAL_VERSION} · ปรับปรุงล่าสุด ${LAST_UPDATED}`}
        >

            <LegalSection
                number="1"
                title="การสมัครสมาชิก"
            >
                <p>
                    ผู้สมัครต้องให้ข้อมูลที่ถูกต้อง
                    เป็นปัจจุบัน และไม่แอบอ้างเป็นบุคคลอื่น
                    การสมัครสมาชิกถือว่าผู้ใช้ยอมรับ
                    ข้อกำหนดที่ใช้บังคับกับบริการ
                </p>
            </LegalSection>


            <LegalSection
                number="2"
                title="บัญชีผู้ใช้งาน"
            >
                <p>
                    ผู้ใช้มีหน้าที่รักษาข้อมูลเข้าสู่ระบบ
                    และรับผิดชอบกิจกรรมที่เกิดขึ้น
                    ภายใต้บัญชีของตน
                </p>

                <p>
                    หากพบการใช้งานที่ผิดปกติ
                    หรือสงสัยว่าบัญชีถูกเข้าถึงโดยไม่ได้รับอนุญาต
                    ผู้ใช้ควรติดต่อผู้ให้บริการโดยเร็ว
                </p>
            </LegalSection>


            <LegalSection
                number="3"
                title="การใช้งานระบบ"
            >
                <p>
                    ห้ามใช้ระบบเพื่อกระทำการที่ผิดกฎหมาย
                    หลอกลวงผู้อื่น รบกวนการทำงานของระบบ
                    หรือพยายามเข้าถึงระบบหรือข้อมูล
                    โดยไม่ได้รับอนุญาต
                </p>
            </LegalSection>


            <LegalSection
                number="4"
                title="ข้อมูลที่ผู้ใช้นำเข้าสู่ระบบ"
            >
                <p>
                    ผู้ใช้รับผิดชอบข้อมูลสินค้า
                    รายการขาย ลูกค้า และข้อมูลทางธุรกิจ
                    ที่นำเข้าสู่ระบบ รวมถึงความถูกต้อง
                    และความเหมาะสมในการนำข้อมูลดังกล่าว
                    มาใช้กับบริการ
                </p>
            </LegalSection>


            <LegalSection
                number="5"
                title="สิทธิในข้อมูลของผู้ใช้"
            >
                <p>
                    ข้อมูลที่ผู้ใช้นำเข้าสู่ระบบ
                    ยังคงอยู่ภายใต้สิทธิและความรับผิดชอบ
                    ของผู้ใช้ตามกฎหมายที่เกี่ยวข้อง
                    ผู้ให้บริการประมวลผลข้อมูลดังกล่าว
                    เท่าที่จำเป็นเพื่อให้บริการ
                    รักษาความปลอดภัย และดำเนินการตามข้อกำหนด
                </p>
            </LegalSection>


            <LegalSection
                number="6"
                title="การปรับปรุงบริการ"
            >
                <p>
                    เราอาจปรับปรุง แก้ไข
                    หรือเพิ่มเติมฟังก์ชันของระบบ
                    เพื่อความปลอดภัย ประสิทธิภาพ
                    และการพัฒนาบริการ
                </p>
            </LegalSection>


            <LegalSection
                number="7"
                title="การระงับหรือจำกัดบัญชี"
            >
                <p>
                    เราอาจระงับหรือจำกัดการใช้งานบัญชี
                    หากพบการใช้งานที่ผิดกฎหมาย
                    ผิดเงื่อนไข ก่อให้เกิดความเสี่ยงต่อระบบ
                    หรือส่งผลกระทบต่อผู้ใช้อื่น
                </p>
            </LegalSection>


            <LegalSection
                number="8"
                title="การยกเลิกบัญชี"
            >
                <p>
                    ผู้ใช้สามารถดำเนินการยกเลิกบัญชี
                    ตามช่องทางที่ผู้ให้บริการกำหนด
                    การลบข้อมูลอาจอยู่ภายใต้ระยะเวลา
                    การเก็บรักษาที่จำเป็นตามกฎหมาย
                    หรือเพื่อป้องกันการทุจริตและข้อพิพาท
                </p>
            </LegalSection>


            <LegalSection
                number="9"
                title="ทรัพย์สินทางปัญญา"
            >
                <p>
                    ซอฟต์แวร์ ระบบ การออกแบบ
                    เครื่องหมาย เนื้อหา และองค์ประกอบ
                    ที่ผู้ให้บริการจัดทำขึ้น
                    เป็นทรัพย์สินทางปัญญาของผู้ให้บริการ
                    หรือผู้ให้สิทธิแก่ผู้ให้บริการ
                    เว้นแต่ระบุไว้เป็นอย่างอื่น
                </p>
            </LegalSection>


            <LegalSection
                number="10"
                title="การเปลี่ยนแปลงข้อกำหนด"
            >
                <p>
                    เราอาจปรับปรุงข้อกำหนดนี้เมื่อมีการเปลี่ยนแปลง
                    การให้บริการ เทคโนโลยี หรือข้อกำหนดทางกฎหมาย
                    โดยจะแสดงเวอร์ชันและวันที่ปรับปรุง
                    ให้ผู้ใช้สามารถตรวจสอบได้
                </p>
            </LegalSection>

        </LegalDocument>
    );
}


// ======================================================
// PRIVACY
// ======================================================

function Privacy() {

    return (
        <LegalDocument
            icon={<LockKeyhole />}
            title="นโยบายความเป็นส่วนตัว"
            subtitle={`ฉบับ ${LEGAL_VERSION} · ปรับปรุงล่าสุด ${LAST_UPDATED}`}
        >

            <LegalSection
                number="1"
                title="ข้อมูลที่เราเก็บ"
            >
                <p>
                    เราอาจเก็บข้อมูลที่ผู้ใช้ให้แก่เรา
                    เช่น ชื่อ อีเมล เบอร์โทรศัพท์
                    ข้อมูลบัญชี และข้อมูลที่จำเป็น
                    ต่อการให้บริการ
                </p>

                <p>
                    ระบบอาจประมวลผลข้อมูลที่ผู้ใช้นำเข้าสู่ระบบ
                    เช่น ข้อมูลสินค้า รายการขาย
                    และข้อมูลลูกค้าของผู้ใช้
                </p>
            </LegalSection>


            <LegalSection
                number="2"
                title="ข้อมูลทางเทคนิค"
            >
                <p>
                    ระบบอาจเก็บข้อมูลทางเทคนิค
                    เช่น IP Address ข้อมูลอุปกรณ์
                    Browser ข้อมูลการเข้าสู่ระบบ
                    และ Log ที่จำเป็นต่อการรักษาความปลอดภัย
                    และการตรวจสอบปัญหาของระบบ
                </p>
            </LegalSection>


            <LegalSection
                number="3"
                title="วัตถุประสงค์ในการประมวลผล"
            >
                <p>
                    เราใช้ข้อมูลเพื่อสร้างและดูแลบัญชี
                    ให้บริการระบบ ยืนยันตัวตน
                    รักษาความปลอดภัย ป้องกันการทุจริต
                    แก้ไขปัญหาทางเทคนิค
                    และปรับปรุงบริการ
                </p>
            </LegalSection>


            <LegalSection
                number="4"
                title="Cookies และเทคโนโลยีที่เกี่ยวข้อง"
            >
                <p>
                    เว็บไซต์อาจใช้ Cookies
                    และเทคโนโลยีที่เกี่ยวข้อง
                    เพื่อให้ระบบทำงาน ปลอดภัย
                    จดจำการตั้งค่า และปรับปรุงการให้บริการ
                </p>

                <p>
                    สำหรับ Cookies ที่ไม่จำเป็นต่อการทำงาน
                    เราจะจัดการตามการตั้งค่าความยินยอม
                    และนโยบาย Cookies ที่เกี่ยวข้อง
                </p>
            </LegalSection>


            <LegalSection
                number="5"
                title="การใช้ผู้ให้บริการภายนอก"
            >
                <p>
                    เราอาจใช้ผู้ให้บริการภายนอก
                    ที่จำเป็นต่อการให้บริการ เช่น
                    Cloud Infrastructure ระบบส่งอีเมล
                    ระบบรักษาความปลอดภัย
                    หรือระบบวิเคราะห์การใช้งาน
                    โดยพิจารณาตามความจำเป็น
                    และมาตรการที่เหมาะสม
                </p>
            </LegalSection>


            <LegalSection
                number="6"
                title="การเปิดเผยข้อมูล"
            >
                <p>
                    เราจะไม่เปิดเผยข้อมูลส่วนบุคคล
                    เกินกว่าความจำเป็นของวัตถุประสงค์
                    ในการให้บริการ เว้นแต่มีฐานทางกฎหมาย
                    ได้รับความยินยอมเมื่อจำเป็น
                    หรือจำเป็นต้องดำเนินการตามกฎหมาย
                </p>
            </LegalSection>


            <LegalSection
                number="7"
                title="การเก็บรักษาข้อมูล"
            >
                <p>
                    เราจะเก็บข้อมูลเท่าที่จำเป็น
                    ต่อวัตถุประสงค์ของการให้บริการ
                    หรือเท่าที่กฎหมายกำหนด
                    และจะดำเนินการลบ
                    หรือทำให้ข้อมูลไม่สามารถระบุตัวบุคคลได้
                    เมื่อหมดความจำเป็นตามหลักเกณฑ์ที่เกี่ยวข้อง
                </p>
            </LegalSection>


            <LegalSection
                number="8"
                title="สิทธิของเจ้าของข้อมูล"
            >
                <p>
                    ผู้ใช้สามารถใช้สิทธิของเจ้าของข้อมูลส่วนบุคคล
                    ตามกฎหมายที่เกี่ยวข้อง เช่น
                    ขอเข้าถึง แก้ไข ลบ
                    หรือขอให้จำกัดการประมวลผล
                    ภายใต้เงื่อนไขของกฎหมาย
                </p>
            </LegalSection>


            <LegalSection
                number="9"
                title="การรักษาความปลอดภัย"
            >
                <p>
                    เราใช้มาตรการทางเทคนิคและการจัดการ
                    ที่เหมาะสมเพื่อป้องกันข้อมูลจาก
                    การเข้าถึง การใช้ การเปลี่ยนแปลง
                    การเปิดเผย หรือการทำลาย
                    โดยไม่ได้รับอนุญาต
                </p>
            </LegalSection>


            <LegalSection
                number="10"
                title="การเปลี่ยนแปลงนโยบาย"
            >
                <p>
                    เราอาจปรับปรุงนโยบายนี้
                    เมื่อมีการเปลี่ยนแปลงการให้บริการ
                    เทคโนโลยี หรือข้อกำหนดทางกฎหมาย
                    โดยจะแสดงเวอร์ชันและวันที่ปรับปรุง
                </p>
            </LegalSection>

        </LegalDocument>
    );
}


// ======================================================
// COOKIES
// ======================================================

function Cookies() {

    return (
        <LegalDocument
            icon={<Cookie />}
            title="นโยบาย Cookies"
            subtitle={`ฉบับ ${LEGAL_VERSION} · ปรับปรุงล่าสุด ${LAST_UPDATED}`}
        >

            <LegalSection
                number="1"
                title="Cookies คืออะไร"
            >
                <p>
                    Cookies คือข้อมูลขนาดเล็ก
                    ที่เว็บไซต์อาจจัดเก็บไว้ใน Browser
                    เพื่อช่วยให้เว็บไซต์จดจำข้อมูล
                    และทำงานได้ตามวัตถุประสงค์
                </p>
            </LegalSection>


            <LegalSection
                number="2"
                title="Necessary Cookies"
            >
                <p>
                    Cookies ประเภทนี้จำเป็นต่อการทำงาน
                    ของระบบ เช่น การเข้าสู่ระบบ
                    ความปลอดภัย และการรักษาสถานะ
                    การทำงานของบริการ
                </p>
            </LegalSection>


            <LegalSection
                number="3"
                title="Analytics Cookies"
            >
                <p>
                    อาจใช้ในอนาคตเพื่อวิเคราะห์
                    การใช้งานเว็บไซต์และประสิทธิภาพของบริการ
                    โดยจะดำเนินการตามกลไก
                    การจัดการความยินยอมที่เหมาะสม
                </p>
            </LegalSection>


            <LegalSection
                number="4"
                title="Marketing Cookies"
            >
                <p>
                    อาจใช้ในอนาคตสำหรับการตลาด
                    การวัดผลแคมเปญ หรือเทคโนโลยีติดตาม
                    โดยจะดำเนินการตามการตั้งค่า
                    และความยินยอมที่เกี่ยวข้อง
                </p>
            </LegalSection>


            <LegalSection
                number="5"
                title="การเปลี่ยนแปลงการตั้งค่า"
            >
                <p>
                    เมื่อระบบรองรับ Cookies
                    ที่ไม่จำเป็น ผู้ใช้จะสามารถ
                    จัดการการตั้งค่า Cookies
                    ผ่าน Cookie Preferences
                    ของเว็บไซต์
                </p>
            </LegalSection>

        </LegalDocument>
    );
}


// ======================================================
// DATA DELETION
// ======================================================

function DataDeletion() {

    return (
        <LegalDocument
            icon={<Trash2 />}
            title="การลบบัญชีและข้อมูล"
            subtitle={`ฉบับ ${LEGAL_VERSION} · ปรับปรุงล่าสุด ${LAST_UPDATED}`}
        >

            <LegalSection
                number="1"
                title="การลบบัญชี"
            >
                <p>
                    ผู้ใช้สามารถร้องขอการยกเลิกบัญชี
                    และการลบข้อมูลที่เกี่ยวข้องกับบัญชี
                    ผ่านช่องทางที่ผู้ให้บริการกำหนด
                </p>
            </LegalSection>


            <LegalSection
                number="2"
                title="ข้อมูลที่อาจถูกลบ"
            >
                <p>
                    ข้อมูลบัญชี ข้อมูลธุรกิจ
                    และข้อมูลอื่นที่เกี่ยวข้อง
                    อาจถูกลบตามขอบเขตของคำขอ
                    และนโยบายการเก็บรักษาข้อมูล
                </p>
            </LegalSection>


            <LegalSection
                number="3"
                title="ข้อมูลที่ต้องเก็บรักษา"
            >
                <p>
                    ข้อมูลบางประเภทอาจจำเป็นต้องเก็บรักษา
                    ต่อไปตามกฎหมาย ความปลอดภัย
                    การป้องกันการทุจริต
                    หรือเพื่อการตรวจสอบข้อพิพาท
                </p>
            </LegalSection>


            <LegalSection
                number="4"
                title="Backup"
            >
                <p>
                    ข้อมูลที่อยู่ในระบบสำรองข้อมูล
                    อาจไม่สามารถลบออกจาก Backup
                    ได้ทันที และจะถูกจัดการตาม
                    รอบการเก็บรักษา Backup
                    และมาตรการด้านความปลอดภัย
                </p>
            </LegalSection>

        </LegalDocument>
    );
}


// ======================================================
// CONTACT
// ======================================================

function Contact() {

    return (
        <LegalDocument
            icon={<Mail />}
            title="ติดต่อเรา"
            subtitle="ช่องทางสำหรับเรื่องทั่วไปและเรื่องข้อมูลส่วนบุคคล"
        >

            <div className="legal-contact-card">

                <Mail size={24} />

                <div>

                    <strong>
                        ติดต่อฝ่ายบริการ
                    </strong>

                    <p>
                        สำหรับคำถามเกี่ยวกับบริการ
                        บัญชี หรือปัญหาการใช้งาน
                    </p>

                    <div className="legal-placeholder">
                        กรุณากำหนดอีเมล Support
                        ก่อนเปิดให้บริการจริง
                    </div>

                </div>

            </div>


            <div className="legal-contact-card">

                <Database size={24} />

                <div>

                    <strong>
                        คำขอเกี่ยวกับข้อมูลส่วนบุคคล
                    </strong>

                    <p>
                        สำหรับคำขอเข้าถึง แก้ไข ลบ
                        หรือใช้สิทธิอื่นเกี่ยวกับข้อมูลส่วนบุคคล
                    </p>

                    <div className="legal-placeholder">
                        กรุณากำหนดช่องทาง Privacy Request
                        ก่อนเปิดให้บริการจริง
                    </div>

                </div>

            </div>

        </LegalDocument>
    );
}


// ======================================================
// SHARED DOCUMENT
// ======================================================

function LegalDocument({
    icon,
    title,
    subtitle,
    children
}) {

    return (
        <article className="legal-document">

            <div className="legal-document-heading">

                <div className="legal-document-icon">
                    {icon}
                </div>

                <div>

                    <h1>
                        {title}
                    </h1>

                    <p>
                        {subtitle}
                    </p>

                </div>

            </div>


            <div className="legal-document-body">
                {children}
            </div>

        </article>
    );
}


// ======================================================
// SECTION
// ======================================================

function LegalSection({
    number,
    title,
    children
}) {

    return (
        <section className="legal-section">

            <div className="legal-section-title">

                <span>
                    {number}
                </span>

                <h2>
                    {title}
                </h2>

            </div>

            <div className="legal-section-body">
                {children}
            </div>

        </section>
    );
}


// ======================================================
// CARD
// ======================================================

function LegalCard({
    icon,
    title,
    description,
    to
}) {

    return (
        <Link
            to={to}
            className="legal-card"
        >

            <div className="legal-card-icon">
                {icon}
            </div>

            <div>

                <strong>
                    {title}
                </strong>

                <span>
                    {description}
                </span>

            </div>

        </Link>
    );
}
