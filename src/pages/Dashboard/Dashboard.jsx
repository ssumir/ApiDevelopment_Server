import React, { useEffect, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Container,
    Box,
    CircularProgress,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Snackbar,
    Alert,
    Menu,
    MenuItem,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import SchoolIcon from "@mui/icons-material/School";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import Courses from "../Courses/Courses";
import CourseCategories from "../CourseCategories/CourseCategories";
import Enrollments from "../Enrollments/Enrollments";
import Users from "../Users/Users";
import NotFound from "../NotFound/NotFound";
import DashboardSummary from "./DashboardSummary";
import ViewUserInformation from "./ViewUserInformation";

const drawerWidth = 200;
const appBarColor = "#1f257aff";

// Welcome box for counts (desktop only)
const WelcomeBox = ({ courseCount, courseCategoriesCount, enrollmentCount, usersCount }) => {
    return (
        <Box
            sx={{
                position: "fixed",
                top: 64,
                left: 0,
                width: drawerWidth,
                bgcolor: appBarColor,
                color: "#fff",
                pt: 2,
                textAlign: "center",
                height: "100%",
            }}
        >
            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                Welcome to the Dashboard!
            </Typography>
            <Typography variant="body2" align="center">
                Courses: {courseCount}
                <br />
                Course Categories: {courseCategoriesCount}
                <br />
                Enrollments: {enrollmentCount}
                <br />
                Users: {usersCount}
            </Typography>
        </Box>
    );
};

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [viewMode, setViewMode] = useState("summary");
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "info",
    });
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const navigate = useNavigate();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    // Counts state
    const [courseCount, setCourseCount] = useState(0);
    const [courseCategoriesCount, setCourseCategoriesCount] = useState(0);
    const [enrollmentCount, setEnrollmentCount] = useState(0);
    const [usersCount, setUsersCount] = useState(0);

    // Fetch counts
    const fetchCounts = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const [coursesRes, categoriesRes, enrollmentsRes, usersRes] = await Promise.all([
                fetch("https://apibeta.fellow.one/api/Courses", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("https://apibeta.fellow.one/api/CourseCategories", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("https://apibeta.fellow.one/api/Enrollments", { headers: { Authorization: `Bearer ${token}` } }),
                fetch("https://apibeta.fellow.one/api/Users", { headers: { Authorization: `Bearer ${token}` } }),
            ]);

            const [coursesData, categoriesData, enrollmentsData, usersData] = await Promise.all([
                coursesRes.ok ? coursesRes.json() : [],
                categoriesRes.ok ? categoriesRes.json() : [],
                enrollmentsRes.ok ? enrollmentsRes.json() : [],
                usersRes.ok ? usersRes.json() : [],
            ]);

            setCourseCount(coursesData.length);
            setCourseCategoriesCount(categoriesData.length);
            setEnrollmentCount(enrollmentsData.length);
            setUsersCount(usersData.length);
        } catch (error) {
            console.error("Failed to fetch counts:", error);
            showNotification("Failed to load dashboard data.", "error");
        }
    };

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
                setUser(JSON.parse(storedUser));
                fetchCounts();
            } else {
                navigate("/auth/login");
            }
        } catch (error) {
            console.error("Failed to retrieve user:", error);
            navigate("/auth/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/");
    };

    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    const showNotification = (message, severity = "info") => {
        setNotification({ open: true, message, severity });
    };

    const handleCloseNotification = (_, reason) => {
        if (reason === "clickaway") return;
        setNotification({ ...notification, open: false });
    };

    if (!user) {
        return (
            <Container
                maxWidth="sm"
                sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
            >
                <CircularProgress />
            </Container>
        );
    }

    const drawerItems = [
        { text: "Dashboard Summary", mode: "summary", icon: <DashboardIcon /> },
        { text: "Course Categories", mode: "coursecategories", icon: <CategoryIcon /> },
        { text: "Courses", mode: "courses", icon: <SchoolIcon /> },
        { text: "Enrollments", mode: "enrollments", icon: <AssignmentTurnedInIcon /> },
        { text: "Users", mode: "users", icon: <GroupIcon /> },
        { text: "View User Information", mode: "user_info", icon: <PersonIcon /> },
    ];

    const handleDrawerClick = (mode) => () => {
        setViewMode(mode);
        if (isMobile) setDrawerOpen(false);
    };

    const drawerContent = (
        <Box sx={{ width: drawerWidth, bgcolor: appBarColor, height: "100%", color: "#fff" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                    Welcome, {user.fullName}!
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                    Role: {user.role}
                </Typography>
            </Box>
            <List>
                {drawerItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton
                            onClick={handleDrawerClick(item.mode)}
                            selected={viewMode === item.mode}
                            sx={{
                                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
                                "&.Mui-selected": { backgroundColor: "rgba(255,255,255,0.2)" },
                            }}
                        >
                            <ListItemIcon sx={{ color: "#fff" }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    const renderContent = () => {
        switch (viewMode) {
            case "summary":
                return (
                    <DashboardSummary
                        courseCount={courseCount}
                        courseCategoriesCount={courseCategoriesCount}
                        enrollmentCount={enrollmentCount}
                        usersCount={usersCount}
                    />
                );
            case "coursecategories":
                return <CourseCategories showNotification={showNotification} setCourseCategoriesCount={setCourseCategoriesCount} />;
            case "courses":
                return <Courses showNotification={showNotification} setCourseCount={setCourseCount} />;
            case "enrollments":
                return <Enrollments showNotification={showNotification} setEnrollmentCount={setEnrollmentCount} />;
            case "users":
                return <Users showNotification={showNotification} setUsersCount={setUsersCount} />;
            case "user_info":
                return <ViewUserInformation user={user} />;
            default:
                return <NotFound />;
        }
    };

    return (
        <Box sx={{ display: "flex", height: "100vh" }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                sx={{
                    zIndex: (theme) => theme.zIndex.drawer + 1,
                    bgcolor: appBarColor,
                    ...(drawerOpen && !isMobile && {
                        marginLeft: drawerWidth,
                        width: `calc(100% - ${drawerWidth}px)`,
                    }),
                }}
            >
                <Toolbar>
                    <IconButton size="large" edge="start" color="inherit" onClick={toggleDrawer} sx={{ mr: 2 }}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
                        Course Management System
                    </Typography>
                    <Typography variant="subtitle1" sx={{ mr: 2, fontStyle: "italic", color: "#fff" }}>
                        Welcome, {user.fullName}!
                    </Typography>
                    <IconButton onClick={handleMenuClick} color="inherit">
                        <PersonIcon />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        anchorOrigin={{ vertical: "top", horizontal: "right" }}
                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                        open={open}
                        onClose={handleMenuClose}
                    >
                        <MenuItem onClick={handleLogout}>
                            <ListItemIcon>
                                <LogoutIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Logout</ListItemText>
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            {/* Drawer */}
            <Drawer
                variant={isMobile ? "temporary" : "persistent"}
                anchor="top"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                        width: drawerWidth,
                        height: "100%",
                        bgcolor: appBarColor,
                        color: "#fff",
                        transition: "transform 0.2s ease-in-out",
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* WelcomeBox (desktop only when Drawer closed) */}
            {!drawerOpen && !isMobile && (
                <WelcomeBox
                    courseCount={courseCount}
                    courseCategoriesCount={courseCategoriesCount}
                    enrollmentCount={enrollmentCount}
                    usersCount={usersCount}
                />
            )}

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    m: 2,
                    // border: '5px solid #f77d0cff',
                    bgcolor: "transparent",
                    height: "calc(100vh - 64px)",
                    overflowY: "auto",
                    // ...( !drawerOpen && !isMobile && { marginLeft: `${drawerWidth}px` } ),
                }}
            >
                {renderContent()}
            </Box>

            {/* Notification */}
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: "100%" }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}
