import React from "react";
import "./CampusLogo.css";

const CampusLogo = ({ compact = false }) => {
    return (
        <div
            className={`campus-logo ${
                compact ? "campus-logo-compact" : ""
            }`}
        >

            {/* Logo Symbol */}
            <div className="campus-logo-symbol">

                <div className="campus-cap">
                    <span></span>
                </div>

                <div className="campus-building">
                    <div className="building-roof"></div>

                    <div className="building-body">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div className="campus-person campus-person-blue">
                    👤
                </div>

                <div className="campus-person campus-person-green">
                    👤
                </div>

            </div>

            {/* Logo Text */}
            <div className="campus-logo-text">

                <div className="campus-logo-name">
                    Campus<span>Sphere</span>
                </div>

                <div className="campus-logo-tagline">
                    One Campus. One Connected Platform.
                </div>

            </div>

        </div>
    );
};

export default CampusLogo;