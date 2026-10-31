import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PsychologyIcon from "@mui/icons-material/Psychology";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";

function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();

    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = () => {
        // Remove student login information
        localStorage.removeItem("studentToken");
        localStorage.removeItem("studentId");
        localStorage.removeItem("studentName");

        // Make sure the login page is loaded again
        window.location.replace("/");
    };

    // =====================================================
    // MENU ITEM STYLE
    // =====================================================

    const menuItem = (path) => ({
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        marginBottom: "15px",
        borderRadius: "8px",
        cursor: "pointer",

        background:
            location.pathname === path
                ? "#334155"
                : "transparent",

        transition: "background 0.2s ease",
    });

    return (
        <div
            style={{
                width: "240px",
                height: "100vh",
                background: "#1e293b",
                color: "white",
                position: "fixed",
                left: 0,
                top: 0,
                padding: "20px",
                boxSizing: "border-box",
                zIndex: 1000,
            }}
        >

            {/* =================================================
                TITLE
            ================================================= */}

            <h2
                style={{
                    marginBottom: "40px",
                    fontSize: "22px",
                }}
            >
                Student Dropout
            </h2>


            {/* =================================================
                DASHBOARD
            ================================================= */}

            <div
                style={menuItem("/dashboard")}
                onClick={() => navigate("/dashboard")}
            >
                <DashboardIcon />

                <span>
                    Dashboard
                </span>
            </div>


            {/* =================================================
                ACADEMICS
            ================================================= */}

            <div
                style={menuItem("/academics")}
                onClick={() => navigate("/academics")}
            >
                <SchoolIcon />

                <span>
                    Academics
                </span>
            </div>


            {/* =================================================
                AI PREDICTION
            ================================================= */}

            <div
                style={menuItem("/prediction")}
                onClick={() => navigate("/prediction")}
            >
                <PsychologyIcon />

                <span>
                    AI Prediction
                </span>
            </div>


            {/* =================================================
                PROFILE
            ================================================= */}

            <div
                style={menuItem("/profile")}
                onClick={() => navigate("/profile")}
            >
                <PersonIcon />

                <span>
                    Profile
                </span>
            </div>


            {/* =================================================
                LOGOUT
            ================================================= */}

            <div
                onClick={logout}
                style={{
                    position: "absolute",
                    bottom: "30px",
                    left: "20px",
                    right: "20px",

                    display: "flex",
                    alignItems: "center",
                    gap: "12px",

                    padding: "12px",

                    borderRadius: "8px",

                    cursor: "pointer",

                    transition:
                        "background 0.2s ease",
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                        "#334155";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                        "transparent";
                }}
            >

                <LogoutIcon />

                <span>
                    Logout
                </span>

            </div>

        </div>
    );
}

export default Sidebar;