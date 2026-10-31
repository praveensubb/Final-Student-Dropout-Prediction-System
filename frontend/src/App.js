import React from "react";







import {



    BrowserRouter,



    Routes,



    Route,



    Navigate



} from "react-router-dom";







// =====================================================



// FRONT PAGE



// =====================================================







import RoleSelection from "./pages/RoleSelection";







// =====================================================



// ADMIN



// =====================================================







import AdminLogin from "./pages/Login";



import AdminDashboard from "./pages/AdminDashboard";



import RiskCluster from "./pages/RiskCluster";



import InterventionTracker from "./pages/InterventionTracker";



import Counselling from "./pages/Counselling";



import ParentAlert from "./pages/ParentAlert";



import FacultyAssignment from "./pages/FacultyAssignment";



import AdminFacultyActivities from "./pages/AdminFacultyActivities";



import StudentMonitoring from "./pages/StudentMonitoring";



import MentorReports from "./pages/MentorReports";
import FacultyTimetable from "./pages/FacultyTimetable";
import FacultyAttendance from "./pages/FacultyAttendance";
import AdminMentorActivities from "./pages/AdminMentorActivities";
import MentorParentAlerts from "./pages/MentorParentAlerts";
import AdminMentorActivityDetails from "./pages/AdminMentorActivityDetails";
import MentorAssignment from "./pages/MentorAssignment";










// =====================================================



// MENTOR



// =====================================================







import MentorLogin from "./pages/MentorLogin";



import MentorDashboard from "./pages/MentorDashboard";



import Mentoring from "./pages/Mentoring";



import MentorStudentMonitoring from "./pages/MentorStudentMonitoring";



import MentorNotifications from "./pages/MentorNotifications";







// =====================================================



// STUDENT



// =====================================================







import StudentLogin from "./pages/StudentLogin";



import StudentRegistration from "./pages/StudentRegistration";



import StudentDashboard from "./pages/StudentDashboard";



import Academics from "./pages/Academics";



import Prediction from "./pages/Prediction";



import WhatIfSimulator from "./pages/WhatIfSimulator";



import Profile from "./pages/Profile";



import MoodBurnout from "./pages/MoodBurnout";



import StudyHabitMirror from "./pages/StudyHabitMirror";



import AnonymousPeerNudge from "./pages/AnonymousPeerNudge";



import MicroGoalEngine from "./pages/MicroGoalEngine";







// =====================================================



// FACULTY



// =====================================================







import FacultyLogin from "./pages/FacultyLogin";



import FacultyDashboard from "./pages/FacultyDashboard";



import FacultyStudentDetails from "./pages/FacultyStudentDetails";

import FacultyStudents from "./pages/FacultyStudents";







// =====================================================



// AUTHENTICATION CHECKS



// =====================================================







function isStudentLoggedIn() {



    return Boolean(



        localStorage.getItem("studentToken")



    );



}







function isAdminLoggedIn() {



    return Boolean(



        localStorage.getItem("adminToken")



    );



}







function isFacultyLoggedIn() {



    return Boolean(



        localStorage.getItem("facultyToken")



    );



}







function isMentorLoggedIn() {



    return Boolean(



        localStorage.getItem("mentorToken")



    );



}







// =====================================================



// STUDENT PROTECTED ROUTE



// =====================================================







function StudentProtectedRoute({ children }) {







    if (!isStudentLoggedIn()) {



        return (



            <Navigate



                to="/student-login"



                replace



            />



        );



    }







    return children;



}







// =====================================================



// ADMIN PROTECTED ROUTE



// =====================================================







function AdminProtectedRoute({ children }) {







    if (!isAdminLoggedIn()) {



        return (



            <Navigate



                to="/admin-login"



                replace



            />



        );



    }







    return children;



}







// =====================================================



// FACULTY PROTECTED ROUTE



// =====================================================







function FacultyProtectedRoute({ children }) {







    if (!isFacultyLoggedIn()) {



        return (



            <Navigate



                to="/faculty-login"



                replace



            />



        );



    }







    return children;



}







// =====================================================



// MENTOR PROTECTED ROUTE



// =====================================================







function MentorProtectedRoute({ children }) {







    if (!isMentorLoggedIn()) {



        return (



            <Navigate



                to="/mentor-login"



                replace



            />



        );



    }







    return children;



}







// =====================================================



// APPLICATION



// =====================================================







function App() {







    return (



        <BrowserRouter>







            <Routes>







                {/* =================================================



                    FRONT PAGE



                ================================================= */}







                <Route
    path="*"



                    element={



                        isStudentLoggedIn() ? (



                            <Navigate



                                to="/dashboard"



                                replace



                            />



                        ) : isFacultyLoggedIn() ? (



                            <Navigate



                                to="/faculty-dashboard"



                                replace



                            />



                        ) : isMentorLoggedIn() ? (



                            <Navigate



                                to="/mentor-dashboard"



                                replace



                            />



                        ) : isAdminLoggedIn() ? (



                            <Navigate



                                to="/admin"



                                replace



                            />



                        ) : (



                            <RoleSelection />



                        )



                    }



                />







                {/* =================================================



                    STUDENT REGISTRATION



                ================================================= */}







                <Route



                    path="/register"



                    element={



                        isStudentLoggedIn() ? (



                            <Navigate



                                to="/dashboard"



                                replace



                            />



                        ) : (



                            <StudentRegistration />



                        )



                    }



                />







                {/* =================================================



                    STUDENT LOGIN



                ================================================= */}







                <Route



                    path="/student-login"



                    element={



                        <StudentLogin />



                    }



                />







                {/* =================================================



                    STUDENT DASHBOARD



                ================================================= */}







                <Route



                    path="/dashboard"



                    element={



                        <StudentProtectedRoute>



                            <StudentDashboard />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - ACADEMICS



                ================================================= */}







                <Route



                    path="/academics"



                    element={



                        <StudentProtectedRoute>



                            <Academics />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - AI PREDICTION



                ================================================= */}







                <Route



                    path="/prediction"



                    element={



                        <StudentProtectedRoute>



                            <Prediction />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - WHAT IF SIMULATOR



                ================================================= */}







                <Route



                    path="/what-if"



                    element={



                        <StudentProtectedRoute>



                            <WhatIfSimulator />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - PROFILE



                ================================================= */}







                <Route



                    path="/profile"



                    element={



                        <StudentProtectedRoute>



                            <Profile />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - STUDY HABIT MIRROR



                ================================================= */}







                <Route



                    path="/study-habits"



                    element={



                        <StudentProtectedRoute>



                            <StudyHabitMirror />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - ANONYMOUS PEER NUDGE



                ================================================= */}







                <Route



                    path="/peer-nudge"



                    element={



                        <StudentProtectedRoute>



                            <AnonymousPeerNudge />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - MICRO GOAL ENGINE



                ================================================= */}







                <Route



                    path="/goals"



                    element={



                        <StudentProtectedRoute>



                            <MicroGoalEngine />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    STUDENT - MOOD & BURNOUT



                ================================================= */}







                <Route



                    path="/mood"



                    element={



                        <StudentProtectedRoute>



                            <MoodBurnout />



                        </StudentProtectedRoute>



                    }



                />







                {/* =================================================



                    FACULTY LOGIN



                ================================================= */}







                <Route



                    path="/faculty-login"



                    element={



                        isFacultyLoggedIn() ? (



                            <Navigate



                                to="/faculty-dashboard"



                                replace



                            />



                        ) : (



                            <FacultyLogin />



                        )



                    }



                />







                {/* =================================================



                    FACULTY DASHBOARD



                ================================================= */}







                <Route



                    path="/faculty-dashboard"



                    element={



                        <FacultyProtectedRoute>



                            <FacultyDashboard />



                        </FacultyProtectedRoute>



                    }



                />







                {/* =================================================



                    FACULTY - STUDENT DETAILS



                ================================================= */}







                <Route



                    path="/faculty/student/:studentId"



                    element={



                        <FacultyProtectedRoute>



                            <FacultyStudentDetails />



                        </FacultyProtectedRoute>



                    }



                />







                {/*
                    FACULTY - MY STUDENTS

                ================================================= */}



                <Route

                    path="/faculty/students"

                    element={

                        <FacultyProtectedRoute>

                            <FacultyStudents />

                        </FacultyProtectedRoute>

                    }

                />



{/* =================================================



                    FACULTY - COUNSELLING



                ================================================= */}







                <Route



                    path="/counselling"



                    element={



                        <FacultyProtectedRoute>



                            <Counselling />



                        </FacultyProtectedRoute>



                    }



                />







                {/* =================================================



                    FACULTY - INTERVENTION TRACKER



                ================================================= */}







                <Route



                    path="/intervention-tracker"



                    element={



                        <FacultyProtectedRoute>



                            <InterventionTracker />



                        </FacultyProtectedRoute>



                    }



                />







                {/* =================================================



                    FACULTY - PARENT ALERTS



                ================================================= */}







                <Route



                    path="/faculty/parent-alerts"



                    element={



                        <FacultyProtectedRoute>



                            <ParentAlert />



                        </FacultyProtectedRoute>



                    }



                />







                {/* =================================================



                    MENTOR LOGIN



                ================================================= */}







                <Route



                    path="/mentor-login"



                    element={



                        <MentorLogin />



                    }



                />







                {/* =================================================



                    MENTOR DASHBOARD



                ================================================= */}







                <Route



                    path="/mentor-dashboard"



                    element={



                        <MentorProtectedRoute>



                            <MentorDashboard />



                        </MentorProtectedRoute>



                    }



                />







                {/* =================================================



                    MENTOR - STUDENT MONITORING



                ================================================= */}







                <Route



                    path="/mentor/student-monitoring"



                    element={



                        <MentorProtectedRoute>



                            <MentorStudentMonitoring />



                        </MentorProtectedRoute>



                    }



                />







                {/* =================================================



                    MENTOR - MENTORING



                ================================================= */}







                <Route



                    path="/mentor/mentoring"



                    element={



                        <MentorProtectedRoute>



                            <Mentoring />



                        </MentorProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN LOGIN



                ================================================= */}







                <Route



                    path="/admin-login"



                    element={



                        isAdminLoggedIn() ? (



                            <Navigate



                                to="/admin"



                                replace



                            />



                        ) : (



                            <AdminLogin />



                        )



                    }



                />







                {/* =================================================



                    ADMIN COMMAND CENTER



                ================================================= */}







                <Route



                    path="/admin"



                    element={



                        <AdminProtectedRoute>



                            <AdminDashboard />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN - STUDENT MONITORING



                ================================================= */}







                <Route



                    path="/admin/student-monitoring"



                    element={



                        <AdminProtectedRoute>



                            <StudentMonitoring />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN - STUDENT/FACULTY/Mentor ASSIGNMENT



                ================================================= */}







                <Route



                    path="/faculty-assignment"



                    element={



                        <AdminProtectedRoute>



                            <FacultyAssignment />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN - RISK INTELLIGENCE



                ================================================= */}







                <Route



                    path="/risk-cluster"



                    element={



                        <AdminProtectedRoute>



                            <RiskCluster />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN - INTERVENTIONS



                ================================================= */}







                <Route



                    path="/interventions"



                    element={



                        <AdminProtectedRoute>



                            <InterventionTracker />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN - COUNSELLING



                ================================================= */}







                <Route



                    path="/admin/counselling"



                    element={



                        <AdminProtectedRoute>



                            <Counselling />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN - PARENT ALERTS



                ================================================= */}







                <Route



                    path="/parent-alerts"



                    element={



                        <AdminProtectedRoute>



                            <ParentAlert />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    ADMIN - FACULTY ACTIVITIES



                ================================================= */}







                <Route



                    path="/admin/faculty-activities"



                    element={



                        <AdminProtectedRoute>



                            <AdminFacultyActivities />



                        </AdminProtectedRoute>



                    }



                />







                {/* =================================================



                    UNKNOWN PAGE



                ================================================= */}







                <Route



                    path="\*"



                    element={



                        isStudentLoggedIn() ? (



                            <Navigate



                                to="/dashboard"



                                replace



                            />



                        ) : isFacultyLoggedIn() ? (



                            <Navigate



                                to="/faculty-dashboard"



                                replace



                            />



                        ) : isMentorLoggedIn() ? (



                            <Navigate



                                to="/mentor-dashboard"



                                replace



                            />



                        ) : isAdminLoggedIn() ? (



                            <Navigate



                                to="/admin"



                                replace



                            />



                        ) : (



                            <Navigate



                                to="/"



                                replace



                            />



                        )



                    }



                />



                <Route



    path="/mentor/reports"



    element={



        <MentorProtectedRoute>



            <MentorReports />



        </MentorProtectedRoute>



    }



/>



<Route



    path="/mentor/notifications"



    element={



        <MentorProtectedRoute>



            <MentorNotifications />



        </MentorProtectedRoute>



    }



/>
<Route
    path="/faculty/timetable"
    element={
        <FacultyProtectedRoute>
            <FacultyTimetable />
        </FacultyProtectedRoute>
    }
/>
<Route
  path="/faculty-attendance"
  element={
    <FacultyProtectedRoute>
      <FacultyAttendance />
    </FacultyProtectedRoute>
  }
/>
<Route
    path="/admin/mentor-activities"
    element={
        <AdminProtectedRoute>
            <AdminMentorActivities />
        </AdminProtectedRoute>
    }
/>
<Route
    path="/mentor/parent-alerts"
    element={
        <MentorProtectedRoute>
            <MentorParentAlerts />
        </MentorProtectedRoute>
    }
/>
<Route
    path="/admin/mentor-activities/mentor/:mentorId"
    element={
        <AdminProtectedRoute>
            <AdminMentorActivityDetails />
        </AdminProtectedRoute>
    }
/>
<Route
    path="/mentor-assignment"
    element={
        <AdminProtectedRoute>
            <MentorAssignment />
        </AdminProtectedRoute>
    }
/>






            </Routes>







        </BrowserRouter>



    );



}







export default App;
