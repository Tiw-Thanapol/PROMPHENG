import React from "react";

import {
Search,
X,
Receipt
} from "lucide-react";

// ======================================================
// ACCOUNTING TOOLBAR
// ======================================================

export default function AccountingToolbar({
search = "",
onSearchChange,
resultCount = 0
}) {

// ==================================================
// SEARCH CHANGE
// ==================================================

function handleSearchChange(event) {

    onSearchChange?.(
        event.target.value
    );

}


// ==================================================
// CLEAR SEARCH
// ==================================================

function handleClearSearch() {

    onSearchChange?.("");

}


// ==================================================
// RENDER
// ==================================================

return (

    <div className="accounting-toolbar">

        {/* ==========================================
            SEARCH
        ========================================== */}

        <div className="accounting-search">

            <Search
                size={17}
                aria-hidden="true"
            />

            <input
                type="text"
                placeholder="ค้นหารายการบัญชี..."
                value={search}
                onChange={
                    handleSearchChange
                }
                aria-label="ค้นหารายการบัญชี"
            />

            {search && (

                <button
                    type="button"
                    onClick={
                        handleClearSearch
                    }
                    aria-label="ล้างการค้นหา"
                    title="ล้างการค้นหา"
                >

                    <X
                        size={14}
                        aria-hidden="true"
                    />

                </button>

            )}

        </div>


        {/* ==========================================
            RESULT COUNT
        ========================================== */}

        <div className="accounting-toolbar-info">

            <Receipt
                size={15}
                aria-hidden="true"
            />

            <span>
                {Number(resultCount) || 0}
                {" "}
                รายการ
            </span>

        </div>

    </div>

);

}