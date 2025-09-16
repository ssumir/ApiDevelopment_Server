import React from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GroupIcon from "@mui/icons-material/Group";

export default function DashboardSummary({
  courseCount,
  courseCategoriesCount,
  enrollmentCount,
  usersCount,
}) {
  // Show loading spinner if any count is still undefined
  const loading = [courseCount, courseCategoriesCount, enrollmentCount, usersCount].some(
    (val) => val === undefined
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "50vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  const summaryItems = [
    { label: "Courses", value: courseCount, icon: <SchoolIcon /> },
    { label: "Course Categories", value: courseCategoriesCount, icon: <CategoryIcon /> },
    { label: "Enrollments", value: enrollmentCount, icon: <AssignmentTurnedInIcon /> },
    { label: "Users", value: usersCount, icon: <GroupIcon /> },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2, mt: 6, textAlign: "center" }}>
        Dashboard Summary
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 2,
        }}
      >
        {summaryItems.map((item) => (
          <Paper
            key={item.label}
            sx={{ p: 2, textAlign: "center", bgcolor: "#1f257a", color: "#fff" }}
          >
            {item.icon}
            <Typography variant="h6">{item.value}</Typography>
            <Typography variant="body2">{item.label}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}


