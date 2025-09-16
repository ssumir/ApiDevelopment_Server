import React, { useEffect, useState } from 'react';
import {
    Box, Typography, Container, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, CircularProgress,
    Button, IconButton, Tooltip, TextField, InputAdornment, FormControl,
    Select, MenuItem, Modal, Menu, TablePagination, ListItemIcon, ListItemText
} from '@mui/material';
import {
    Edit, Delete, AddCircleOutline, Search as SearchIcon,
    ArrowUpward, ArrowDownward, FilterList, Visibility,
    Print, PictureAsPdf, Description, TableChart, MoreVert
} from '@mui/icons-material';
import CategoryFormModal from './CategoryFormModal';

const modalStyle = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: 500,
    bgcolor: '#fefefe', borderRadius: 4,
    boxShadow: '0 8px 16px rgba(0,0,0,0.25)', p: 4,
};

const CourseCategoryDetailsModal = ({ open, handleClose, category }) => (
    <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                Category Details: {category?.name}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>ID:</strong> {category?.id}</Typography>
                <Typography><strong>Name:</strong> {category?.name}</Typography>
                <Typography><strong>Description:</strong> {category?.description}</Typography>
                <Typography><strong>Course Count:</strong> {category?.courseCount}</Typography>
            </Box>
        </Box>
    </Modal>
);

export default function CourseCategories({ showNotification, setCourseCategoriesCount }) {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');
    const [page, setPage] = useState(0);

    // Dropdown Menu
    const [anchorEl, setAnchorEl] = useState(null);
    const openMenu = Boolean(anchorEl);
    const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                if (showNotification) showNotification('No authentication token found.', 'error');
                throw new Error('No authentication token found.');
            }
            const response = await fetch('https://apibeta.fellow.one/api/CourseCategories', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                if (showNotification) showNotification('Failed to fetch categories data.', 'error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setCategories(data);
            if (setCourseCategoriesCount) setCourseCategoriesCount(data.length);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch categories. Check your token or network.");
            if (setCourseCategoriesCount) setCourseCategoriesCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    const handleDeleteCategory = async (categoryId) => {
        // Your delete logic here
        // Then, after a successful deletion, you can call fetchCategories() to refresh the data
    };

    // Export PDF
    const handleExportPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.text("Course Categories Report", 20, 20);
        let y = 40;
        categories.forEach((c, idx) => {
            doc.text(`${idx + 1}. ${c.name} | ${c.description}`, 20, y);
            y += 10;
        });
        doc.save("course-categories-report.pdf");
        handleMenuClose();
    };

    // Export Word
    const handleExportWord = async () => {
        const { Document, Packer, Paragraph, TextRun } = await import("docx");
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ children: [new TextRun({ text: "Course Categories Report", bold: true, size: 28 })] }),
                    ...categories.map((c, idx) => new Paragraph(`${idx + 1}. ${c.name} | ${c.description}`))
                ]
            }]
        });
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "course-categories-report.docx";
        link.click();
        handleMenuClose();
    };

    // Export Excel
    const handleExportExcel = async () => {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(categories);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Categories");
        XLSX.writeFile(wb, "course-categories-report.xlsx");
        handleMenuClose();
    };

    // Sorting
    const descendingComparator = (a, b, orderBy) => (b[orderBy] < a[orderBy] ? -1 : b[orderBy] > a[orderBy] ? 1 : 0);
    const getComparator = (order, orderBy) => order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
    const stableSort = (array, comparator) => {
        const stabilized = array.map((el, i) => [el, i]);
        stabilized.sort((a, b) => { const order = comparator(a[0], b[0]); return order !== 0 ? order : a[1] - b[1]; });
        return stabilized.map(el => el[0]);
    };
    const handleRequestSort = (property) => { setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc'); setOrderBy(property); };

    // Pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };
    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    // Search
    const filteredCategories = categories.filter(c => Object.values(c).join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    const sortedCategories = stableSort(filteredCategories, getComparator(order, orderBy));

    if (loading) return <Container sx={{ mt: 5, display: 'flex', justifyContent: 'center', height: '50vh' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Typography color="error">{error}</Typography></Container>;

    const headCells = [
        { id: 'sl', label: 'SL', disableSort: true },
        { id: 'id', label: 'ID' },
        { id: 'name', label: 'Category Name' },
        { id: 'description', label: 'Description' },
        { id: 'courseCount', label: 'Course Count' },
        { id: 'actions', label: 'Actions', disableSort: true },
    ];

    return (
        <Container maxWidth="xl" sx={{ mt: 5 }}>
            <Box sx={{ p: 4, boxShadow: 4, borderRadius: 3, backgroundColor: '#fafafa' }}>
                {/* Controls */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <FormControl size="small">
                            <Select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                                {[5, 10, 25, 50].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                            </Select>
                        </FormControl>
                        <Typography variant="body2" color="text.secondary">entries per page</Typography>
                    </Box>
                    <TextField
                        size="small"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setPage(0); }}
                        InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
                    />
                </Box>

                {/* Header + Export */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Course Categories ({filteredCategories.length})</Typography>
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
                        <Button variant="contained" onClick={() => { setModalMode('add'); setSelectedCategory(null); setIsFormModalOpen(true); }} startIcon={<AddCircleOutline />}>Add New Category</Button>
                    </Box>
                </Box>

                {/* Table */}
                <TableContainer component={Paper} className="printableArea">
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                {headCells.map(head => (
                                    <TableCell key={head.id} sx={{ color: '#fff', fontWeight: 600 }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            {head.label}
                                            {!head.disableSort && (
                                                <IconButton size="small" color="inherit" onClick={() => handleRequestSort(head.id)} sx={{ ml: 0.5 }}>
                                                    {orderBy === head.id ? (order === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />) : <FilterList fontSize="small" />}
                                                </IconButton>
                                            )}
                                        </Box>
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? sortedCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((category, i) => (
                                <TableRow key={category.id} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                                    <TableCell>{category.id}</TableCell>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>{category.courseCount}</TableCell>
                                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="View Details"><IconButton color="info" size="small" onClick={() => { setSelectedCategory(category); setIsDetailsModalOpen(true); }}><Visibility /></IconButton></Tooltip>
                                        <Tooltip title="Edit Category"><IconButton color="primary" size="small" onClick={() => { setSelectedCategory(category); setModalMode('edit'); setIsFormModalOpen(true); }}><Edit /></IconButton></Tooltip>
                                        <Tooltip title="Delete Category"><IconButton color="error" size="small" onClick={() => handleDeleteCategory(category.id)}><Delete /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={6} align="center">No categories found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>

                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredCategories.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>

            <CategoryFormModal open={isFormModalOpen} handleClose={() => setIsFormModalOpen(false)} mode={modalMode} category={selectedCategory} onFormSubmit={fetchCategories} />
            <CourseCategoryDetailsModal open={isDetailsModalOpen} handleClose={() => setIsDetailsModalOpen(false)} category={selectedCategory} />
        </Container>
    );
}