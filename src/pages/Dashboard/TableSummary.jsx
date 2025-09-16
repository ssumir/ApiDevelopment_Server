import React from 'react';
import { Box, Typography } from '@mui/material';
import SchoolIcon from "@mui/icons-material/School";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GroupIcon from "@mui/icons-material/Group";

export default function TableSummary({ courseCount, courseCategoriesCount, enrollmentCount, usersCount }) {
  return (
    <Box sx={{ pt: 2, textAlign: "center" }}>
      <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
        Welcome to the Dashboard!
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <SchoolIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="body2" sx={{ color: '#fff' }}>
            Courses: {courseCount}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CategoryIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="body2" sx={{ color: '#fff' }}>
            Course Categories: {courseCategoriesCount}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <AssignmentTurnedInIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="body2" sx={{ color: '#fff' }}>
            Enrollments: {enrollmentCount}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <GroupIcon sx={{ mr: 1, color: '#fff' }} />
          <Typography variant="body2" sx={{ color: '#fff' }}>
            Users: {usersCount}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}