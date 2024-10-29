// // import React from 'react'

// // const App = () => {
// //   return (
// //     <div>App helooooooooooooo</div>
// //   )
// // }

// // export default App;


import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import theme from './theme';
import HomePage from './pages/HomePage';
import Layout from './components/Layout.jsx';
import Page1 from './pages/YourStatus.jsx';
import Page2 from './pages/Events.jsx';
import Success from './pages/Success.jsx';
import Page4 from './pages/Profile.jsx';
import Page5 from './pages/Page5';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import YourStatus from './pages/YourStatus.jsx';
import Events from './pages/Events.jsx';
import AuthComponent from './components/AuthComponent.js';


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
  const location = useLocation();
  const isAuthRoute = location.pathname === '/';

  return (
    <>
      {isAuthRoute ? (
        <Routes>
          <Route path="/" element={<AuthComponent />} />
        </Routes>
      ) : (
        <Layout>
          <Routes>
            <Route path="/home" element={<HomePage />} />
            <Route path="/yourStatus" element={<YourStatus />} />
            <Route path="/events" element={<Events />} />
            <Route path="/success" element={<Success />} />
            <Route path="/profile" element={<Page4 />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Routes>
        </Layout>
      )}
    </>
  );
}

export default App;