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
} from '@mui/material';
import {
    Edit,
    Delete,
    AddCircleOutline,
    Search as SearchIcon,
    ArrowUpward,
    ArrowDownward,
    FilterList,
    Visibility,
} from '@mui/icons-material';
import CategoryFormModal from './CategoryFormModal';

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

const CourseCategoryDetailsModal = ({ open, handleClose, category }) => {
    return (
        <Modal open={open} onClose={handleClose}>
            <Box sx={style}>
                <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                    Category Details: {category?.name}
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography>
                        <strong>ID:</strong> {category?.id}
                    </Typography>
                    <Typography>
                        <strong>Description:</strong> {category?.description}
                    </Typography>
                    <Typography>
                        <strong>Course Count:</strong> {category?.courseCount}
                    </Typography>
                </Box>
            </Box>
        </Modal>
    );
};

export default function CourseCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');
    const [page, setPage] = useState(0);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found.');
            }

            const response = await fetch('https://apibeta.fellow.one/api/CourseCategories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setCategories(data);
        } catch (err) {
            console.error('Failed to fetch categories:', err);
            setError("Failed to fetch categories data. Please check your network and authorization.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenFormModal = (mode, category = null) => {
        setModalMode(mode);
        setSelectedCategory(category);
        setIsFormModalOpen(true);
    };

    const handleCloseFormModal = () => {
        setIsFormModalOpen(false);
        setSelectedCategory(null);
    };

    const handleOpenDetailsModal = (category) => {
        setSelectedCategory(category);
        setIsDetailsModalOpen(true);
    };

    const handleCloseDetailsModal = () => {
        setIsDetailsModalOpen(false);
        setSelectedCategory(null);
    };

    const handleFormSubmit = (updatedCategory) => {
        if (modalMode === 'create') {
            setCategories([...categories, updatedCategory]);
        } else if (modalMode === 'edit') {
            setCategories(categories.map(cat =>
                cat.id === updatedCategory.id ? updatedCategory : cat
            ));
        }
    };

    const handleDeleteCategory = async (categoryId) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`https://localhost:59244/api/CourseCategories/${categoryId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to delete category');
                }

                setCategories(categories.filter(cat => cat.id !== categoryId));
                console.log(`Category with ID ${categoryId} deleted successfully.`);
            } catch (err) {
                console.error('Error deleting category:', err);
                setError('Failed to delete category. Please try again.');
            }
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

    const filteredCategories = stableSort(
        categories.filter((category) => {
            const lowerCaseSearchTerm = searchTerm.toLowerCase();
            const searchableProperties = [
                String(category.id),
                category.name,
                category.description,
            ];

            return searchableProperties.some(prop => prop.toLowerCase().includes(lowerCaseSearchTerm));
        }),
        getComparator(order, orderBy)
    );

    const paginatedCategories = filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
                        Course Categories ({filteredCategories.length})
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => handleOpenFormModal('create')}
                        startIcon={<AddCircleOutline />}
                    >
                        Add New Category
                    </Button>
                </Box>
                <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
                    <Table sx={{ minWidth: 650 }} aria-label="course categories table">
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#1976d2' }}>
                                {[
                                    { id: 'sl', label: 'SL', disableSort: true },
                                    { id: 'id', label: 'ID' },
                                    { id: 'name', label: 'Category Name' },
                                    { id: 'description', label: 'Description' },
                                    { id: 'courseCount', label: 'Course Count' },
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
                            {paginatedCategories.length > 0 ? (
                                paginatedCategories.map((category, index) => (
                                    <TableRow key={category.id} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                                        <TableCell>{category.id}</TableCell>
                                        <TableCell>{category.name}</TableCell>
                                        <TableCell>{category.description}</TableCell>
                                        <TableCell>{category.courseCount}</TableCell>
                                        <TableCell sx={{ display: 'flex', gap: 1 }}>
                                            <Tooltip title="View Details">
                                                <IconButton
                                                    color="info"
                                                    size="small"
                                                    onClick={() => handleOpenDetailsModal(category)}
                                                >
                                                    <Visibility />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Edit Category">
                                                <IconButton
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => handleOpenFormModal('edit', category)}
                                                >
                                                    <Edit />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Category">
                                                <IconButton
                                                    color="error"
                                                    size="small"
                                                    onClick={() => handleDeleteCategory(category.id)}
                                                >
                                                    <Delete />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        No categories found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
            <CategoryFormModal
                open={isFormModalOpen}
                handleClose={handleCloseFormModal}
                mode={modalMode}
                category={selectedCategory}
                onFormSubmit={handleFormSubmit}
            />
            <CourseCategoryDetailsModal
                open={isDetailsModalOpen}
                handleClose={handleCloseDetailsModal}
                category={selectedCategory}
            />
        </Container>
    );
}