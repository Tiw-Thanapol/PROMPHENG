import React from "react";

import {
    Link
} from "react-router-dom";

import "../../styles/Footer.css";


function Footer() {

    const year = new Date().getFullYear();


    return (
        <footer className="app-footer">

            <div className="app-footer-inner">


                {/* ======================================
                    COPYRIGHT
                ====================================== */}

                <div className="app-footer-copyright">
                    © {year} PROMPHENG. All rights reserved.
                </div>


                {/* ======================================
                    LEGAL LINKS
                ====================================== */}

                <nav className="app-footer-links">

                    <Link to="/terms">
                        ข้อกำหนดและเงื่อนไข
                    </Link>

                    <Link to="/privacy">
                        นโยบายความเป็นส่วนตัว
                    </Link>

                    <Link to="/cookies">
                        นโยบาย Cookies
                    </Link>

                </nav>


            </div>

        </footer>
    );
}


export default Footer;