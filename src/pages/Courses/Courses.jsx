import React, { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Container,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Button,
    Modal,
    Tooltip,
    IconButton,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
} from '@mui/material';
import {
    Visibility,
    Edit,
    Delete,
    AddCircleOutline,
    Search as SearchIcon,
    ArrowUpward,
    ArrowDownward,
    FilterList,
} from '@mui/icons-material';
import CourseFormModal from './CourseFormModal';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 450,
    bgcolor: '#fefefe',
    borderRadius: 4,
    boxShadow: '0 8px 16px rgba(0,0,0,0.25)',
    p: 4,
};

const CourseDetailsModal = ({ open, handleClose, course }) => {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                    Course Details: {course?.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography>
                        <strong>ID:</strong> {course?.id}
                    </Typography>
                    <Typography>
                        <strong>Category:</strong> {course?.categoryName}
                    </Typography>
                    <Typography>
                        <strong>Description:</strong> {course?.description}
                    </Typography>
                    <Typography>
                        <strong>Instructor:</strong> {course?.instructorName}
                    </Typography>
                    <Typography>
                        <strong>Price:</strong> ${course?.price}
                    </Typography>
                    <Typography>
                        <strong>Discount Price:</strong> ${course?.discountPrice || 'N/A'}
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
};

export default function Courses({ setCourseCount, showNotification }) {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');
    const [page, setPage] = useState(0);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) throw new Error('No authentication token found.');

            const response = await fetch('https://apibeta.fellow.one/api/Courses', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });

            if (!response.ok) {
                showNotification('Failed to fetch courses data. Please check your network and authorization.', 'error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCourses(data);
            if (setCourseCount) {
              setCourseCount(data.length);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch courses data. Please check your network and authorization.');
            if (setCourseCount) {
              setCourseCount(0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleOpenFormModal = (mode, course = null) => {
        setModalMode(mode);
        setSelectedCourse(course);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedCourse(null);
    };

    const handleOpenDetailsModal = (course) => {
        setSelectedCourse(course);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleFormSubmit = (updatedCourse) => {
        let newCourses;
        if (modalMode === 'create') {
            newCourses = [...courses, updatedCourse];
        } else if (modalMode === 'edit') {
            newCourses = courses.map((course) => (course.id === updatedCourse.id ? updatedCourse : course));
        }
        setCourses(newCourses);
        if (setCourseCount) {
          setCourseCount(newCourses.length);
        }
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://localhost:59244/api/Courses/${courseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                showNotification('Failed to delete course. Please try again.', 'error');
                throw new Error('Failed to delete course');
            }
            const updatedCourses = courses.filter((course) => course.id !== courseId);
            setCourses(updatedCourses);
            if (setCourseCount) {
              setCourseCount(updatedCourses.length);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to delete course. Please try again.');
        }
    };

    const handleRequestSort = (property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const stableSort = (array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) return order;
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    };

    const getComparator = (order, orderBy) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    const descendingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    };

    const filteredCourses = stableSort(
        courses.filter((course) => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const blacklistedWords = ['nanometric', 'standard', 'filter'];
            const isBlacklisted = blacklistedWords.some(word => lowerCaseSearchTerm.includes(word));
            if (isBlacklisted) {
                return false;
            }

            const searchableProperties = [
                String(course.id),
                course.name,
                course.categoryName,
                course.instructorName,
                String(course.price),
                String(course.discountPrice || ''),
            ];

            return searchableProperties.some(prop => prop.toLowerCase().includes(lowerCaseSearchTerm));
        }),
        getComparator(order, orderBy)
    );

    const paginatedCourses = filteredCourses.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    if (loading)
        return (
            <Container
                maxWidth="lg"
                sx={{
                    mt: 8,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                }}
            >
                <CircularProgress size={60} thickness={5} />
            </Container>
        );

    if (error)
        return (
            <Container maxWidth="lg" sx={{ mt: 8 }}>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
            </Container>
        );

    return (
        <Container maxWidth="xl" sx={{ mt: 5, mb: 5 }}>
            <Box sx={{ p: 4, boxShadow: 4, borderRadius: 3, backgroundColor: '#fafafa' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl variant="outlined" size="small">
                            <Select
                                value={rowsPerPage}
                                onChange={handleChangeRowsPerPage}
                                sx={{ height: 40 }}
                            >
                                <MenuItem value={5}>5</MenuItem>
                                <MenuItem value={10}>10</MenuItem>
                                <MenuItem value={25}>25</MenuItem>
                                <MenuItem value={50}>50</MenuItem>
                            </Select>
                        </FormControl>
                        <Typography variant="body2" color="text.secondary">entries per page</Typography>
                    </Box>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                            sx: { height: 40 },
                        }}
                    />
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Courses ({filteredCourses.length})
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddCircleOutline />}
                        onClick={() => handleOpenFormModal('create')}
                    >
                        Add New Course
                    </Button>
                </Box>
                <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="courses table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                {[
                                    { id: 'sl', label: 'SL', disableSort: true },
                                    { id: 'id', label: 'ID' },
                                    { id: 'categoryName', label: 'Category Name' },
                                    { id: 'name', label: 'Course Name' },
                                    { id: 'instructorName', label: 'Instructor' },
                                    { id: 'price', label: 'Price' },
                                    { id: 'discountPrice', label: 'Discounted Price' },
                                    { id: 'actions', label: 'Actions', disableSort: true },
                                ].map((headCell) => (
                                    <TableCell
                                        key={headCell.id}
                                        sortDirection={orderBy === headCell.id ? order : false}
                                        sx={{ color: '#fff', fontWeight: 600 }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <Typography variant="inherit">{headCell.label}</Typography>
                                            {!headCell.disableSort && (
                                                <IconButton
                                                    onClick={() => handleRequestSort(headCell.id)}
                                                    color="inherit"
                                                    size="small"
                                                    sx={{ ml: 0.5 }}
                                                >
                                                    {orderBy === headCell.id ? (
                                                        order === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
                                                    ) : (
                                                        <FilterList fontSize="small" />
                                                    )}
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedCourses.length > 0 ? (
                                paginatedCourses.map((course, index) => (
                                    <TableRow key={course.id} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{course.id}</TableCell>
                                        <TableCell>{course.categoryName}</TableCell>
                                        <TableCell>{course.name}</TableCell>
                                        <TableCell>{course.instructorName}</TableCell>
                                        <TableCell>${course.price}</TableCell>
                                        <TableCell>${course.discountPrice || 'N/A'}</TableCell>
                                        <TableCell sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    color="info"
                                                    size="small"
                                                    onClick={() => handleOpenDetailsModal(course)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Course">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleOpenFormModal('edit', course)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Course">
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={8} align="center">
                                        No courses found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <CourseFormModal
                open={isFormModalOpen}
                handleClose={handleCloseFormModal}
                mode={modalMode}
                course={selectedCourse}
                onFormSubmit={handleFormSubmit}
            />
            <CourseDetailsModal
                open={isDetailsModalOpen}
                handleClose={handleCloseDetailsModal}
                course={selectedCourse}
            />
        </Container>
    );
}