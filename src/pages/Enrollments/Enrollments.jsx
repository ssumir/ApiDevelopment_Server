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
    IconButton,
    Tooltip,
    TextField,
    InputAdornment,
    FormControl,
    Select,
    MenuItem,
    Modal,
    TablePagination,
    Menu,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import {
    Edit,
    Delete,
    AddCircleOutline,
    Search as SearchIcon,
    ArrowUpward,
    ArrowDownward,
    Visibility,
    Print,
    PictureAsPdf,
    Description,
    TableChart,
    MoreVert,
} from '@mui/icons-material';

import EnrollmentFormModal from './EnrollmentFormModal';

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

const EnrollmentDetailsModal = ({ open, handleClose, enrollment }) => {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                    Enrollment Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography>
                        <strong>ID:</strong> {enrollment?.id}
                    </Typography>
                    <Typography>
                        <strong>User:</strong> {enrollment?.userName || "N/A"}
                    </Typography>
                    <Typography>
                        <strong>Course:</strong> {enrollment?.courseName || "N/A"}
                    </Typography>
                    <Typography>
                        <strong>Enrollment Date:</strong>{" "}
                        {enrollment?.enrollmentDate
                            ? new Date(enrollment.enrollmentDate).toLocaleDateString()
                            : "N/A"}
                    </Typography>
                    <Typography>
                        <strong>Enrollment Status:</strong> {enrollment?.enrollmentStatus === 0 ? 'Pending' : 'Active'}
                    </Typography>
                    <Typography>
                        <strong>Payment Status:</strong> {enrollment?.paymentStatus}
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
};

export default function Enrollments({ showNotification, setEnrollmentCount }) {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [selectedEnrollment, setSelectedEnrollment] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Dropdown Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const fetchEnrollments = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                if (showNotification) showNotification('No authentication token found.', 'error');
                throw new Error('No authentication token found.');
            }

            const response = await fetch('https://apibeta.fellow.one/api/Enrollments', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (showNotification) showNotification('Failed to fetch enrollments data. Please check your network and authorization.', 'error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setEnrollments(data);
            if (setEnrollmentCount) {
                setEnrollmentCount(data.length);
            }
        } catch (err) {
            console.error('Failed to fetch enrollments:', err);
            setError("Failed to fetch enrollments data. Please check your network and authorization.");
            if (setEnrollmentCount) {
                setEnrollmentCount(0);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEnrollments();
    }, []);

    const handleDeleteEnrollment = async (enrollmentId) => {
        if (!window.confirm('Are you sure you want to delete this enrollment?')) {
            return;
        }
        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`https://apibeta.fellow.one/api/Enrollments/${enrollmentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                if (showNotification) showNotification('Failed to delete enrollment. Please try again.', 'error');
                throw new Error('Failed to delete enrollment');
            }

            await fetchEnrollments(); // Re-fetch all data to ensure consistency
            if (showNotification) showNotification(`Enrollment with ID ${enrollmentId} deleted successfully.`, 'success');
        } catch (err) {
            console.error('Error deleting enrollment:', err);
            setError('Failed to delete enrollment. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleOpenDetailsModal = (enrollment) => {
        setSelectedEnrollment(enrollment);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedEnrollment(null);
    };

    const handleOpenFormModal = (mode, enrollment = null) => {
        setModalMode(mode);
        setSelectedEnrollment(enrollment);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedEnrollment(null);
        fetchEnrollments(); // Re-fetch data after form submission
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

    const getStatusText = (enrollmentStatus, paymentStatus) => {
        const enrollmentStatusMap = { 0: 'Pending', 1: 'Active' };
        const paymentStatusMap = {
            0: 'Pending',
            10: 'Failed',
            20: 'Refunded',
            30: 'Canceled',
            40: 'Completed',
            50: 'Partially Paid',
        };
        const enrollmentText = enrollmentStatusMap[enrollmentStatus] || 'N/A';
        const paymentText = paymentStatusMap[paymentStatus] || 'N/A';
        return `Enrollment: ${enrollmentText}, Payment: ${paymentText}`;
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

    const filteredEnrollments = enrollments.filter((enrollment) => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        const searchableProperties = [
            String(enrollment.id),
            enrollment.userName,
            enrollment.courseName,
            new Date(enrollment.enrollmentDate).toLocaleDateString(),
            getStatusText(enrollment.enrollmentStatus, enrollment.paymentStatus),
        ];
        return searchableProperties.some(prop => prop.toLowerCase().includes(lowerCaseSearchTerm));
    });

    const sortedAndFilteredEnrollments = stableSort(filteredEnrollments, getComparator(order, orderBy));
    const paginatedEnrollments = sortedAndFilteredEnrollments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    // Export PDF
    const handleExportPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.text("Enrollments Report", 20, 20);
        let y = 40;
        filteredEnrollments.forEach((e, idx) => {
            doc.text(`${idx + 1}. User: ${e.userName} | Course: ${e.courseName} | Status: ${getStatusText(e.enrollmentStatus, e.paymentStatus)}`, 20, y);
            y += 10;
        });
        doc.save("enrollments-report.pdf");
        handleMenuClose();
    };

    // Export Word
    const handleExportWord = async () => {
        const { Document, Packer, Paragraph, TextRun } = await import("docx");
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ children: [new TextRun({ text: "Enrollments Report", bold: true, size: 28 })] }),
                    ...filteredEnrollments.map((e, idx) => new Paragraph(`${idx + 1}. User: ${e.userName} | Course: ${e.courseName} | Status: ${getStatusText(e.enrollmentStatus, e.paymentStatus)}`))
                ]
            }]
        });
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "enrollments-report.docx";
        link.click();
        handleMenuClose();
    };

    // Export Excel
    const handleExportExcel = async () => {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(filteredEnrollments.map(e => ({
            ID: e.id,
            User: e.userName,
            Course: e.courseName,
            'Enrollment Date': new Date(e.enrollmentDate).toLocaleDateString(),
            'Enrollment Status': e.enrollmentStatus,
            'Payment Status': e.paymentStatus,
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Enrollments");
        XLSX.writeFile(wb, "enrollments-report.xlsx");
        handleMenuClose();
    };

    if (loading) {
        return (
            <Container
                maxWidth="lg"
                sx={{
                    mt: 5,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '50vh',
                }}
            >
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="lg" sx={{ mt: 5 }}>
                <Typography color="error" variant="h6">
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ mt: 5 }}>
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        Enrollments ({filteredEnrollments.length})
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
                            <MenuItem onClick={() => { window.print(); handleMenuClose(); }}><ListItemIcon><Print /></ListItemIcon><ListItemText>Print</ListItemText></MenuItem>
                            <MenuItem onClick={handleExportPDF}><ListItemIcon><PictureAsPdf /></ListItemIcon><ListItemText>PDF</ListItemText></MenuItem>
                            <MenuItem onClick={handleExportWord}><ListItemIcon><Description /></ListItemIcon><ListItemText>Word</ListItemText></MenuItem>
                            <MenuItem onClick={handleExportExcel}><ListItemIcon><TableChart /></ListItemIcon><ListItemText>Excel</ListItemText></MenuItem>
                        </Menu>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleOpenFormModal('create')}
                            startIcon={<AddCircleOutline />}
                        >
                            Add New Enrollment
                        </Button>
                    </Box>
                </Box>
                <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="enrollments table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                {[
                                    { id: 'sl', label: 'SL', disableSort: true },
                                    { id: 'id', label: 'ID' },
                                    { id: 'userName', label: 'User' },
                                    { id: 'courseName', label: 'Course' },
                                    { id: 'enrollmentDate', label: 'Enrollment Date' },
                                    { id: 'status', label: 'Status' },
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
                                                        <Box sx={{ width: 24, height: 24 }} />
                                                    )}
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {paginatedEnrollments.length > 0 ? (
                                paginatedEnrollments.map((enrollment, index) => (
                                    <TableRow key={enrollment.id} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{enrollment.id}</TableCell>
                                        <TableCell>{enrollment.userName}</TableCell>
                                        <TableCell>{enrollment.courseName}</TableCell>
                                        <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{getStatusText(enrollment.enrollmentStatus, enrollment.paymentStatus)}</TableCell>
                                        <TableCell sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    color="info"
                                                    size="small"
                                                    onClick={() => handleOpenDetailsModal(enrollment)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Enrollment">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleOpenFormModal('edit', enrollment)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Enrollment">
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteEnrollment(enrollment.id)}
                                                    disabled={isDeleting}
                                                >
                                                    {isDeleting && selectedEnrollment?.id === enrollment.id ? <CircularProgress size={20} /> : <Delete />}
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        No enrollments found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <TablePagination
                        component="div"
                        count={filteredEnrollments.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                    />
                </Box>
            </Box>
            <EnrollmentDetailsModal
                open={isDetailsModalOpen}
                handleClose={handleCloseDetailsModal}
                enrollment={selectedEnrollment}
            />
            <EnrollmentFormModal
                open={isFormModalOpen}
                handleClose={handleCloseFormModal}
                mode={modalMode}
                enrollment={selectedEnrollment}
                onFormSubmit={fetchEnrollments}
            />
        </Container>
    );
}