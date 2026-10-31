import React from "react";
import Sidebar from "../components/Sidebar";

function Profile() {
  const name = localStorage.getItem("studentName");

  return (
    <div>
      <Sidebar />

      <main
        style={{
          marginLeft: "240px",
          padding: "40px",
          background: "#f5f7fb",
          minHeight: "100vh",
        }}
      >
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "15px",
          }}
        >
          <h1>My Profile</h1>

          <h2>{name}</h2>

          <p>
            Your personal and academic profile information will appear here.
          </p>
        </div>
      </main>
    </div>
  );
}

export default Profile;