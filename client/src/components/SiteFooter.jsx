// import React from "react";
// import { Link } from "react-router-dom";
// import {
//     ShieldCheck,
//     FileText,
//     LockKeyhole,
//     Cookie,
//     Mail
// } from "lucide-react";

// import "./SiteFooter.css";


// // ======================================================
// // SITE FOOTER
// // ======================================================
// //
// // ใช้เป็น Footer กลางของระบบ
// //
// // จุดประสงค์:
// // - Copyright
// // - Privacy Policy
// // - Terms of Service
// // - Cookie Policy
// // - Data & Account Deletion
// // - Contact
// //
// // ไม่ผูกกับ authentication
// // สามารถใช้ได้ทั้งหน้า public และ authenticated
// // ======================================================

// const CURRENT_YEAR = new Date().getFullYear();

// export default function SiteFooter() {
//     return (
//         <footer className="site-footer">
//             <div className="site-footer-inner">

//                 {/* ==========================================
//                     BRAND
//                 ========================================== */}

//                 <div className="site-footer-brand">
//                     <div className="site-footer-brand-name">
//                         Sale Record
//                     </div>

//                     <div className="site-footer-brand-description">
//                         ระบบบันทึกการขายและจัดการข้อมูลธุรกิจ
//                     </div>
//                 </div>


//                 {/* ==========================================
//                     LEGAL LINKS
//                 ========================================== */}

//                 <nav
//                     className="site-footer-links"
//                     aria-label="Legal"
//                 >
//                     <Link to="/legal/terms">
//                         <FileText size={14} />
//                         <span>ข้อกำหนดการใช้บริการ</span>
//                     </Link>

//                     <Link to="/legal/privacy">
//                         <LockKeyhole size={14} />
//                         <span>นโยบายความเป็นส่วนตัว</span>
//                     </Link>

//                     <Link to="/legal/cookies">
//                         <Cookie size={14} />
//                         <span>นโยบาย Cookies</span>
//                     </Link>

//                     <Link to="/legal/data-deletion">
//                         <ShieldCheck size={14} />
//                         <span>การลบบัญชีและข้อมูล</span>
//                     </Link>

//                     <Link to="/legal/contact">
//                         <Mail size={14} />
//                         <span>ติดต่อเรา</span>
//                     </Link>
//                 </nav>


//                 {/* ==========================================
//                     BOTTOM
//                 ========================================== */}

//                 <div className="site-footer-bottom">

//                     <span>
//                         © {CURRENT_YEAR} Sale Record.
//                         {" "}All rights reserved.
//                     </span>

//                     <span className="site-footer-version">
//                         Legal v1.0
//                     </span>

//                 </div>

//             </div>
//         </footer>
//     );
// }
