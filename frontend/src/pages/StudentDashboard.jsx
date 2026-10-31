import React from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import AccessTimeIcon from "@mui/icons-material/AccessTime";
import GroupsIcon from "@mui/icons-material/Groups";
import TrackChangesIcon from "@mui/icons-material/TrackChanges";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PsychologyIcon from "@mui/icons-material/Psychology";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import "./studentDashboard.css";


function StudentDashboard() {

    const navigate = useNavigate();


    const features = [

        {
            number: "01",

            title: "Study Habit Mirror",

            icon: <AccessTimeIcon />,

            description:
                "Understand your study hours, inactive periods, procrastination patterns and learning consistency.",

            badge: "PERSONAL ANALYSIS",

            path: "/study-habits"
        },


        {
            number: "02",

            title: "Anonymous Peer Nudge",

            icon: <GroupsIcon />,

            description:
                "Compare your academic progress anonymously with students showing similar academic patterns.",

            badge: "PEER INSIGHT",

            path: "/peer-nudge"
        },


        {
            number: "03",

            title: "Micro Goal Engine",

            icon: <TrackChangesIcon />,

            description:
                "Get small, achievable goals designed around your academic performance and improvement needs.",

            badge: "PERSONALIZED",

            path: "/goals"
        },


        {
            number: "04",

            title: "What-If Simulator",

            icon: <AutorenewIcon />,

            description:
                "Experiment with attendance, CGPA, backlogs and study hours to understand possible risk changes.",

            badge: "AI SIMULATION",

            path: "/what-if"
        }

    ];


    return (

        <div className="student-dashboard">


            {/* ================================================= */}
            {/* SIDEBAR */}
            {/* ================================================= */}

            <Sidebar />


            {/* ================================================= */}
            {/* MAIN CONTENT */}
            {/* ================================================= */}

            <main className="student-main">


                {/* ================================================= */}
                {/* HEADER */}
                {/* ================================================= */}

                <header className="student-header">

                    <div className="student-header-content">

                        <div className="dashboard-eyebrow">
                            STUDENT SUCCESS PLATFORM
                        </div>

                        <h1>
                            Student Dashboard
                        </h1>

                        <p>
                            Your academic improvement journey,
                            organized step by step.
                        </p>

                    </div>


                    <span className="student-role">
                        Student
                    </span>

                </header>


                {/* ================================================= */}
                {/* JOURNEY INTRO */}
                {/* ================================================= */}

                <section className="journey-intro">

                    <div className="journey-intro-content">

                        <span className="journey-label">
                            YOUR IMPROVEMENT JOURNEY
                        </span>

                        <h2>
                            Understand → Improve → Predict
                        </h2>

                        <p>
                            Follow these four tools to understand
                            your academic behaviour and reduce
                            your dropout risk.
                        </p>

                    </div>


                    <div className="journey-count">

                        <strong>
                            4
                        </strong>

                        <span>
                            Steps
                        </span>

                    </div>

                </section>


                {/* ================================================= */}
                {/* JOURNEY FEATURES */}
                {/* ================================================= */}

                <section className="journey-list">

                    {features.map((feature, index) => (

                        <React.Fragment
                            key={feature.number}
                        >


                            {/* FEATURE CARD */}

                            <div
                                className="journey-card"

                                onClick={() =>
                                    navigate(feature.path)
                                }

                                role="button"

                                tabIndex={0}

                                onKeyDown={(event) => {

                                    if (
                                        event.key === "Enter" ||
                                        event.key === " "
                                    ) {

                                        navigate(feature.path);

                                    }

                                }}
                            >


                                {/* NUMBER */}

                                <div className="journey-number">

                                    {feature.number}

                                </div>


                                {/* ICON */}

                                <div className="journey-icon">

                                    {feature.icon}

                                </div>


                                {/* CONTENT */}

                                <div className="journey-content">

                                    <span className="journey-step">

                                        STEP {feature.number}

                                    </span>


                                    <h3>

                                        {feature.title}

                                    </h3>


                                    <p>

                                        {feature.description}

                                    </p>


                                    <span className="feature-badge">

                                        {feature.badge}

                                    </span>

                                </div>


                                {/* ARROW */}

                                <div className="journey-arrow">

                                    <ArrowForwardIcon />

                                </div>

                            </div>


                            {/* CONNECTOR */}

                            {index < features.length - 1 && (

                                <div className="journey-connector">

                                    <span></span>

                                </div>

                            )}

                        </React.Fragment>

                    ))}

                </section>


                {/* ================================================= */}
                {/* AI RISK SUMMARY */}
                {/* ================================================= */}

                <section className="risk-summary">


                    {/* ICON */}

                    <div className="risk-icon">

                        <PsychologyIcon />

                    </div>


                    {/* CONTENT */}

                    <div className="risk-content">

                        <span>
                            FINAL AI ASSESSMENT
                        </span>

                        <h2>
                            Your AI Dropout Risk
                        </h2>

                        <p>
                            Analyze your academic performance,
                            attendance, backlogs and study habits
                            to understand your current dropout risk.
                        </p>

                    </div>


                    {/* BUTTON */}

                    <button
                        type="button"

                        onClick={() =>
                            navigate("/prediction")
                        }
                    >

                        <span>
                            View AI Prediction
                        </span>

                        <ArrowForwardIcon />

                    </button>

                </section>


            </main>

        </div>
    );
}


export default StudentDashboard;