import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import theme from "./theme";
import Layout from "./components/Layout.jsx";
import AuthComponent from "./components/AuthComponent.js";
import Home from "./pages/Home.jsx";
import Events from "./pages/Events.jsx";
import Analytics from "./pages/Analytics.jsx";
import Success from "./pages/Success.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";
import ManageCompanies from "./pages/ManageCompanies.jsx";
import ManageEvents from "./pages/ManageEvents.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

function AppRoutes() {
  return (
    <>
      {!sessionStorage.getItem("token") ? (
        <Routes>
          <Route path="/" element={<AuthComponent />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/events" element={<Events />} />
            <Route path="/success" element={<Success />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/notifications" element={<Notifications />} />
            {sessionStorage.getItem("role") !== "student" && (
              <>
                <Route path="/manage-companies" element={<ManageCompanies />} />
                <Route path="/manage-events" element={<ManageEvents />} />
              </>
            )}
          </Routes>
        </Layout>
      )}

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
}

export default App;
