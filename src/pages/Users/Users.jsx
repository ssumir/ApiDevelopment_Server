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
import UserFormModal from './UserFormModal';

const modalStyle = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: 500,
    bgcolor: '#fefefe', borderRadius: 4,
    boxShadow: '0 8px 16px rgba(0,0,0,0.25)', p: 4,
};

const UserDetailsModal = ({ open, handleClose, user }) => (
    <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, mb: 2 }}>
                User Details: {user?.fullName}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography><strong>ID:</strong> {user?.id}</Typography>
                <Typography><strong>Full Name:</strong> {user?.fullName}</Typography>
                <Typography><strong>Email:</strong> {user?.email}</Typography>
                <Typography><strong>Phone Number:</strong> {user?.phoneNumber}</Typography>
                <Typography><strong>Role ID:</strong> {user?.roleId}</Typography>
                <Typography><strong>Role Name:</strong> {user?.roleName}</Typography>
                <Typography><strong>Date Created:</strong> {new Date(user?.dateCreated).toLocaleString()}</Typography>
            </Box>
        </Box>
    </Modal>
);

export default function Users({ showNotification, setUsersCount }) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
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

    // Fetch users
    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('token');
            if (!token) {
                if (showNotification) showNotification('No authentication token found.', 'error');
                throw new Error('No authentication token found.');
            }
            const response = await fetch('https://apibeta.fellow.one/api/Users', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            });
            if (!response.ok) {
                if (showNotification) showNotification('Failed to fetch user data.', 'error');
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setUsers(data);
            if (setUsersCount) setUsersCount(data.length);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch users. Check your token or network.");
            if (setUsersCount) setUsersCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleDeleteUser = async (userId) => {
        // Your delete logic here
        // Then, after a successful deletion, you can call fetchUsers() to refresh the data
    };

    // Export PDF
    const handleExportPDF = async () => {
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        doc.text("Users Report", 20, 20);
        let y = 40;
        users.forEach((u, idx) => {
            doc.text(`${idx + 1}. ${u.fullName} | ${u.email} | ${u.phoneNumber}`, 20, y);
            y += 10;
        });
        doc.save("users-report.pdf");
        handleMenuClose();
    };

    // Export Word
    const handleExportWord = async () => {
        const { Document, Packer, Paragraph, TextRun } = await import("docx");
        const doc = new Document({
            sections: [{
                children: [
                    new Paragraph({ children: [new TextRun({ text: "Users Report", bold: true, size: 28 })] }),
                    ...users.map((u, idx) => new Paragraph(`${idx + 1}. ${u.fullName} | ${u.email} | ${u.phoneNumber}`))
                ]
            }]
        });
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "users-report.docx";
        link.click();
        handleMenuClose();
    };

    // Export Excel
    const handleExportExcel = async () => {
        const XLSX = await import("xlsx");
        const ws = XLSX.utils.json_to_sheet(users);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Users");
        XLSX.writeFile(wb, "users-report.xlsx");
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
    const filteredUsers = users.filter(u => Object.values(u).join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
    const sortedUsers = stableSort(filteredUsers, getComparator(order, orderBy));
    
    if (loading) return <Container sx={{ mt: 5, display: 'flex', justifyContent: 'center', height: '50vh' }}><CircularProgress /></Container>;
    if (error) return <Container sx={{ mt: 5 }}><Typography color="error">{error}</Typography></Container>;

    const headCells = [
        { id: 'sl', label: 'SL', disableSort: true },
        { id: 'id', label: 'ID' },
        { id: 'fullName', label: 'Full Name' },
        { id: 'email', label: 'Email' },
        { id: 'phoneNumber', label: 'Phone' },
        { id: 'roleId', label: 'Role ID' },
        { id: 'roleName', label: 'Role Name' },
        { id: 'dateCreated', label: 'Date Created' },
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
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>Users ({filteredUsers.length})</Typography>
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
                        <Button variant="contained" onClick={() => { setModalMode('add'); setSelectedUser(null); setIsFormModalOpen(true); }} startIcon={<AddCircleOutline />}>Add New User</Button>
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
                            {sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).length > 0 ? sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user, i) => (
                                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#e3f2fd' } }}>
                                    <TableCell>{page * rowsPerPage + i + 1}</TableCell>
                                    <TableCell>{user.id}</TableCell>
                                    <TableCell>{user.fullName}</TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>{user.phoneNumber}</TableCell>
                                    <TableCell>{user.roleId}</TableCell>
                                    <TableCell>{user.roleName}</TableCell>
                                    <TableCell>{new Date(user.dateCreated).toLocaleString()}</TableCell>
                                    <TableCell sx={{ display: 'flex', gap: 1 }}>
                                        <Tooltip title="View Details"><IconButton color="info" size="small" onClick={() => { setSelectedUser(user); setIsDetailsModalOpen(true); }}><Visibility /></IconButton></Tooltip>
                                        <Tooltip title="Edit User"><IconButton color="primary" size="small" onClick={() => { setSelectedUser(user); setModalMode('edit'); setIsFormModalOpen(true); }}><Edit /></IconButton></Tooltip>
                                        <Tooltip title="Delete User"><IconButton color="error" size="small" onClick={() => handleDeleteUser(user.id)}><Delete /></IconButton></Tooltip>
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={9} align="center">No users found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </TableContainer>
    
                {/* Pagination */}
                <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Box>
    
            <UserFormModal open={isFormModalOpen} handleClose={() => setIsFormModalOpen(false)} mode={modalMode} user={selectedUser} onFormSubmit={fetchUsers} />
            <UserDetailsModal open={isDetailsModalOpen} handleClose={() => setIsDetailsModalOpen(false)} user={selectedUser} />
        </Container>
    );
}