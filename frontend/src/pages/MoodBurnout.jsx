import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

function MoodBurnout() {
    const navigate = useNavigate();

    const [mood, setMood] = useState("");
    const [stress, setStress] = useState(5);
    const [sleep, setSleep] = useState(5);
    const [studyPressure, setStudyPressure] = useState(5);
    const [result, setResult] = useState(null);

    const analyzeBurnout = () => {
        let score =
            (10 - moodScore(mood)) * 2 +
            stress * 3 +
            (10 - sleep) * 2 +
            studyPressure * 3;

        if (score > 70) {
            setResult({
                level: "HIGH",
                message:
                    "Your responses indicate a high level of burnout risk. Consider reducing workload, improving sleep, and talking to a counsellor."
            });
        } else if (score > 45) {
            setResult({
                level: "MEDIUM",
                message:
                    "You may be experiencing moderate stress or burnout. Improve your sleep, study routine and take regular breaks."
            });
        } else {
            setResult({
                level: "LOW",
                message:
                    "Your current responses indicate a relatively low burnout risk. Continue maintaining a balanced routine."
            });
        }
    };

    const moodScore = (value) => {
        const scores = {
            Happy: 10,
            Good: 8,
            Okay: 6,
            Stressed: 4,
            Sad: 2
        };

        return scores[value] || 5;
    };

    return (
        <div style={{ background: "#f4f6fa", minHeight: "100vh" }}>

            <Sidebar />

            <main
                style={{
                    marginLeft: "240px",
                    padding: "35px"
                }}
            >

                <button
                    onClick={() => navigate("/dashboard")}
                    style={styles.back}
                >
                    ← Back to Dashboard
                </button>

                <div style={styles.header}>
                    <h1>🧠 Mood & Burnout Detector</h1>

                    <p>
                        A private daily check-in to understand your
                        emotional and academic stress levels.
                    </p>
                </div>


                <div style={styles.card}>

                    <h2>How are you feeling today?</h2>

                    <div style={styles.moods}>

                        {[
                            "Happy",
                            "Good",
                            "Okay",
                            "Stressed",
                            "Sad"
                        ].map((item) => (

                            <button
                                key={item}
                                onClick={() => setMood(item)}
                                style={{
                                    ...styles.moodButton,
                                    background:
                                        mood === item
                                            ? "#2563eb"
                                            : "#f1f5f9",
                                    color:
                                        mood === item
                                            ? "white"
                                            : "#1e293b"
                                }}
                            >
                                {item}
                            </button>

                        ))}

                    </div>

                </div>


                <div style={styles.card}>

                    <h2>Stress Level</h2>

                    <p>
                        How stressed do you currently feel?
                    </p>

                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={stress}
                        onChange={(e) =>
                            setStress(Number(e.target.value))
                        }
                        style={styles.slider}
                    />

                    <strong>{stress} / 10</strong>

                </div>


                <div style={styles.card}>

                    <h2>Sleep Quality</h2>

                    <p>
                        How well have you been sleeping recently?
                    </p>

                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={sleep}
                        onChange={(e) =>
                            setSleep(Number(e.target.value))
                        }
                        style={styles.slider}
                    />

                    <strong>{sleep} / 10</strong>

                </div>


                <div style={styles.card}>

                    <h2>Study Pressure</h2>

                    <p>
                        How much academic pressure are you currently experiencing?
                    </p>

                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={studyPressure}
                        onChange={(e) =>
                            setStudyPressure(Number(e.target.value))
                        }
                        style={styles.slider}
                    />

                    <strong>{studyPressure} / 10</strong>

                </div>


                <button
                    onClick={analyzeBurnout}
                    disabled={!mood}
                    style={{
                        ...styles.analyze,
                        opacity: mood ? 1 : 0.5
                    }}
                >
                    Analyze My Burnout Risk
                </button>


                {result && (

                    <div style={styles.result}>

                        <h2>
                            Burnout Risk: {result.level}
                        </h2>

                        <p>
                            {result.message}
                        </p>

                        <p style={styles.private}>
                            🔒 This check-in is private.
                        </p>

                    </div>

                )}

            </main>

        </div>
    );
}


const styles = {

    back: {
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: "#2563eb",
        fontSize: "15px",
        marginBottom: "20px"
    },

    header: {
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        marginBottom: "20px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
    },

    card: {
        background: "white",
        padding: "25px",
        borderRadius: "16px",
        marginBottom: "18px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.05)"
    },

    moods: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
        marginTop: "20px"
    },

    moodButton: {
        border: "none",
        padding: "12px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600"
    },

    slider: {
        width: "80%",
        marginRight: "20px"
    },

    analyze: {
        border: "none",
        background: "#2563eb",
        color: "white",
        padding: "14px 24px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "15px"
    },

    result: {
        background: "white",
        padding: "30px",
        borderRadius: "16px",
        marginTop: "25px",
        boxShadow: "0 4px 15px rgba(0,0,0,0.06)"
    },

    private: {
        color: "#64748b",
        fontSize: "14px",
        marginTop: "20px"
    }
};

export default MoodBurnout;