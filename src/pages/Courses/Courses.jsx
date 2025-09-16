import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Button, Modal, Tooltip, IconButton, TextField, InputAdornment, FormControl, Select, MenuItem, Menu, TablePagination, ListItemIcon, ListItemText,
} from '@mui/material';
import { Visibility, Edit, Delete, AddCircleOutline, Search as SearchIcon, ArrowUpward, ArrowDownward, FilterList, Print, PictureAsPdf, Description, TableChart, MoreVert } from '@mui/icons-material';
import CourseFormModal from './CourseFormModal';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import * as XLSX from 'xlsx';

const style = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 450, bgcolor: '#fefefe', borderRadius: 4, boxShadow: '0 8px 16px rgba(0,0,0,0.25)', p: 4,
};

const CourseDetailsModal = ({ open, handleClose, course }) => {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                    Course Details: {course?.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography><strong>ID:</strong> {course?.id}</Typography>
                    <Typography><strong>Category:</strong> {course?.categoryName}</Typography>
                    <Typography><strong>Description:</strong> {course?.description}</Typography>
                    <Typography><strong>Instructor:</strong> {course?.instructorName}</Typography>
                    <Typography><strong>Price:</strong> ${course?.price}</Typography>
                    <Typography><strong>Discount Price:</strong> ${course?.discountPrice || 'N/A'}</Typography>
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
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');
    const [page, setPage] = useState(0);

    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

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
                showNotification('Failed to fetch courses data.', 'error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCourses(data);
            if (setCourseCount) {
                setCourseCount(data.length);
            }
        } catch (err) {
            console.error(err);
            setError('Failed to fetch courses data.');
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

    const handleExport = async (format) => {
        if (loading || courses.length === 0) {
            showNotification('Data is not available for export. Please wait or check if there are courses to export.', 'info');
            return;
        }

        const dataForExport = courses.map(course => ({
            id: course.id,
            categoryName: course.categoryName,
            name: course.name,
            instructorName: course.instructorName,
            price: `$${course.price}`,
            discountPrice: `$${course.discountPrice || 'N/A'}`
        }));

        const userName = "Admin"; // You can replace with fetched user data
        const reportDate = new Date().toLocaleDateString();

        switch (format) {
            case 'print':
                const printWindow = window.open('', '', 'height=600,width=800');
                printWindow.document.write('<html><head><title>Course Report</title>');
                printWindow.document.write('<style>body{font-family: Arial, sans-serif;} table{width: 100%; border-collapse: collapse; margin-top: 20px;} th, td{border: 1px solid #ddd; padding: 8px; text-align: left;} th{background-color: #f2f2f2;}</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(`
                    <h2>User and Course Report</h2>
                    <p><strong>User:</strong> ${userName}</p>
                    <p><strong>Report Date:</strong> ${reportDate}</p>
                    <table>
                        <thead>
                            <tr>
                                <th>SL</th>
                                <th>ID</th>
                                <th>Category Name</th>
                                <th>Course Name</th>
                                <th>Instructor</th>
                                <th>Price</th>
                                <th>Discounted Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${dataForExport.map((course, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${course.id}</td>
                                    <td>${course.categoryName}</td>
                                    <td>${course.name}</td>
                                    <td>${course.instructorName}</td>
                                    <td>${course.price}</td>
                                    <td>${course.discountPrice}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.print();
                break;
            case 'pdf':
                try {
                    const doc = new jsPDF();
                    doc.text("User and Course Report", 14, 20);
                    doc.text(`User: ${userName}`, 14, 30);
                    doc.text(`Report Date: ${reportDate}`, 14, 40);

                    const tableColumn = [ "SL", "ID", "Category Name", "Course Name", "Instructor", "Price", "Discounted Price" ];
                    const tableRows = dataForExport.map((row, index) => [
                        index + 1, row.id, row.categoryName, row.name, row.instructorName, row.price, row.discountPrice
                    ]);

                    doc.autoTable({
                        head: [tableColumn], body: tableRows, startY: 50,
                    });
                    doc.save('courses-report.pdf');
                    showNotification('PDF exported successfully!', 'success');
                } catch (error) {
                    console.error("PDF export failed:", error);
                    showNotification('Failed to export PDF.', 'error');
                }
                break;
            case 'word':
                try {
                    const docx = new Document({
                        sections: [{
                            children: [
                                new Paragraph({ children: [new TextRun({ text: "User and Course Report", bold: true, size: 36 })] }),
                                new Paragraph({ children: [new TextRun(`User: ${userName}`)] }),
                                new Paragraph({ children: [new TextRun(`Report Date: ${reportDate}`)] }),
                                new Paragraph(""),
                                new Paragraph({ children: [new TextRun({ text: "Courses Data", bold: true, size: 28 })] }),
                                new Paragraph(""),
                                ...dataForExport.map((course, index) =>
                                    new Paragraph(`${index + 1}. ${course.name} | Category: ${course.categoryName} | Instructor: ${course.instructorName}`)
                                ),
                            ],
                        },],
                    });
                    const blob = await Packer.toBlob(docx);
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "courses-report.docx";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showNotification('Word document exported successfully!', 'success');
                } catch (error) {
                    console.error("Word export failed:", error);
                    showNotification('Failed to export Word document.', 'error');
                }
                break;
            case 'excel':
                try {
                    const ws = XLSX.utils.json_to_sheet(dataForExport);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, "Courses");
                    XLSX.writeFile(wb, "courses-report.xlsx");
                    showNotification('Excel file exported successfully!', 'success');
                } catch (error) {
                    console.error("Excel export failed:", error);
                    showNotification('Failed to export Excel file.', 'error');
                }
                break;
            default:
                break;
        }
    };

    // The rest of your component's JSX remains the same
    const handleOpenFormModal = (mode, course = null) => {
        setModalMode(mode);
        setSelectedCourse(course);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedCourse(null);
        fetchCourses();
    };

    const handleOpenDetailsModal = (course) => {
        setSelectedCourse(course);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm('Are you sure you want to delete this course?')) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`https://apibeta.fellow.one/api/Courses/${courseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                showNotification('Failed to delete course. Please try again.', 'error');
                throw new Error('Failed to delete course');
            }
            await fetchCourses();
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const descendingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) return -1;
        if (b[orderBy] > a[orderBy]) return 1;
        return 0;
    };

    const getComparator = (order, orderBy) => {
        return order === 'desc'
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
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

    const filteredCourses = stableSort(
        courses.filter((course) => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Button
                            variant="contained"
                            endIcon={<MoreVert />}
                            onClick={handleMenuClick}
                        >
                            Export
                        </Button>
                        <Menu anchorEl={anchorEl} open={openMenu} onClose={handleMenuClose}>
                            <MenuItem onClick={() => { handleMenuClose(); handleExport('print'); }}>
                                <ListItemIcon><Print /></ListItemIcon>
                                <ListItemText>Print</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); handleExport('pdf'); }}>
                                <ListItemIcon><PictureAsPdf /></ListItemIcon>
                                <ListItemText>PDF</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); handleExport('word'); }}>
                                <ListItemIcon><Description /></ListItemIcon>
                                <ListItemText>Word</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={() => { handleMenuClose(); handleExport('excel'); }}>
                                <ListItemIcon><TableChart /></ListItemIcon>
                                <ListItemText>Excel</ListItemText>
                            </MenuItem>
                        </Menu>
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<AddCircleOutline />}
                            onClick={() => handleOpenFormModal('create')}
                        >
                            Add New Course
                        </Button>
                    </Box>
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
                                        sx={{
                                            color: '#fff',
                                            fontWeight: 600,
                                            '@media print': { color: 'black' },
                                        }}
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
                                    <TableCell colSpan={8} align="center">No courses found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredCourses.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
            <CourseFormModal open={isFormModalOpen} handleClose={handleCloseFormModal} mode={modalMode} course={selectedCourse} onFormSubmit={fetchCourses} />
            <CourseDetailsModal open={isDetailsModalOpen} handleClose={handleCloseDetailsModal} course={selectedCourse} />
        </Container>
    );
}