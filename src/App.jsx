import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Auth/register";
import NotFound from "./pages/NotFound/NotFound";
import Login from "./pages/Auth/login";
import NotAuthorize from "./utils/notAuthorize";
import Dashboard from "./pages/Dashboard/Dashboard";
import Authorize from "./utils/authorize";
import Home from "./pages/Home/Home";
import Courses from './pages/Courses/Courses';
import CourseCategories from './pages/CourseCategories/CourseCategories'; // Placeholder
import Enrollments from './pages/Enrollments/Enrollments'; // Placeholder
import Users from './pages/Users/Users'; // Placeholder

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes - Redirect if already authorized */}
        <Route element={<NotAuthorize />}>
          <Route path="auth/register" element={<Register />} />
          <Route path="auth/login" element={<Login />} />
        </Route>

        {/* Protected Routes - Requires a token */}
        <Route element={<Authorize />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="coursecategories" element={<CourseCategories />} /> {/* Protected */}
          <Route path="enrollments" element={<Enrollments />} />           {/* Protected */}
          <Route path="users" element={<Users />} />                       {/* Protected */}
        </Route>

        {/* Not Found Page (must be last) */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;