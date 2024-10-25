// // import React from 'react'

// // const App = () => {
// //   return (
// //     <div>App helooooooooooooo</div>
// //   )
// // }

// // export default App;


// import React from 'react';
// import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
// import { ThemeProvider, CssBaseline } from '@mui/material';
// import Layout from './components/Layout.jsx';
// import HomePage from './pages/HomePage.jsx';
// import Page1 from './pages/Page1.jsx';
// import Page2 from './pages/Page2.jsx';
// import Page3 from './pages/Page3.jsx';
// import Page4 from './pages/Page4.jsx';
// import Page5 from './pages/Page5.jsx';
// import ProfilePage from './pages/ProfilePage.jsx';
// import NotificationsPage from './pages/NotificationsPage.jsx';
// import theme from './theme.jsx';

// function App() {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <Router>
//         <Layout>
//           <Routes>
//             <Route exact path="/" element={HomePage} />
//             <Route path="/page1" element={Page1} />
//             <Route path="/page2" element={Page2} />
//             <Route path="/page3" element={Page3} />
//             <Route path="/page4" element={Page4} />
//             <Route path="/page5" element={Page5} />
//             <Route path="/profile" element={ProfilePage} />
//             <Route path="/notifications" element={NotificationsPage} />
//           </Routes>
//         </Layout>
//       </Router>
//     </ThemeProvider>
//   );
// }

// export default App;


// File: src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import HomePage from './pages/HomePage';
import Layout from './components/Layout.jsx';
import Page1 from './pages/YourStatus.jsx';
import Page2 from './pages/Events.jsx';
import Page3 from './pages/Success.jsx';
import Page4 from './pages/Profile.jsx';
import Page5 from './pages/Page5';
import ProfilePage from './pages/ProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import theme from './theme';
import YourStatus from './pages/YourStatus.jsx';
import Events from './pages/Events.jsx';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/yourStatus" element={<YourStatus />} />
          <Route path="/events" element={<Events />} />
          <Route path="/success" element={<Page3 />} />
          <Route path="/profile" element={<Page4 />} />
          {/* <Route path="/page5" element={<Page5 />} /> */}
          <Route path="/profile" element={<Page4 />} />
          <Route path="/notifications" element={<NotificationsPage />} />
        </Routes>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;