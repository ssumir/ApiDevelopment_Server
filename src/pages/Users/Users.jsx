import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Container, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, CircularProgress,
  Button, IconButton, Tooltip, TextField, InputAdornment, FormControl, Select, MenuItem, Modal
} from '@mui/material';
import { Edit, Delete, AddCircleOutline, Search as SearchIcon, ArrowUpward, ArrowDownward, FilterList, Visibility } from '@mui/icons-material';
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

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('id');
  const [page, setPage] = useState(0);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found.');
      const response = await fetch('https://apibeta.fellow.one/api/Users', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch users. Check your token or network.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleOpenFormModal = (mode, user = null) => { setModalMode(mode); setSelectedUser(user); setIsFormModalOpen(true); };
  const handleCloseFormModal = () => { setIsFormModalOpen(false); setSelectedUser(null); };
  const handleOpenDetailsModal = (user) => { setSelectedUser(user); setIsDetailsModalOpen(true); };
  const handleCloseDetailsModal = () => { setIsDetailsModalOpen(false); setSelectedUser(null); };

  const handleFormSubmit = (updatedUser) => {
    if (modalMode === 'create') setUsers([...users, updatedUser]);
    else if (modalMode === 'edit') setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://apibeta.fellow.one/api/Users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Delete failed');
      setUsers(users.filter(u => u.id !== id));
    } catch (err) { console.error(err); setError('Failed to delete user'); }
  };

  // Sorting
  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) return -1;
    if (b[orderBy] > a[orderBy]) return 1;
    return 0;
  };
  const getComparator = (order, orderBy) =>
    order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  const stableSort = (array, comparator) => {
    const stabilized = array.map((el, i) => [el, i]);
    stabilized.sort((a, b) => { const order = comparator(a[0], b[0]); return order !== 0 ? order : a[1] - b[1]; });
    return stabilized.map(el => el[0]);
  };
  const handleRequestSort = (property) => { setOrder(orderBy === property && order === 'asc' ? 'desc' : 'asc'); setOrderBy(property); };

  const handleChangeRowsPerPage = (e) => { setRowsPerPage(Number(e.target.value)); setPage(0); };

  // Search all fields
  const filteredUsers = users.filter(u => Object.values(u).join(' ').toLowerCase().includes(searchTerm.toLowerCase()));
  const sortedUsers = stableSort(filteredUsers, getComparator(order, orderBy));
  const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  if (loading) return <Container maxWidth={false} sx={{ mt:5, display:'flex', justifyContent:'center', height:'50vh' }}><CircularProgress /></Container>;
  if (error) return <Container maxWidth={false} sx={{ mt:5 }}><Typography color="error">{error}</Typography></Container>;

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
    <Container maxWidth="xl" sx={{ mt:5 }}>
      <Box sx={{ p:4, boxShadow:4, borderRadius:3, backgroundColor:'#fafafa' }}>
        {/* Controls */}
        <Box sx={{ display:'flex', justifyContent:'space-between', mb:2 }}>
          <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
            <FormControl size="small">
              <Select value={rowsPerPage} onChange={handleChangeRowsPerPage}>
                {[5,10,25,50].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">entries per page</Typography>
          </Box>
          <TextField size="small" placeholder="Search..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
        </Box>

        <Box sx={{ display:'flex', justifyContent:'space-between', mb:3 }}>
          <Typography variant="h5" sx={{ fontWeight:600 }}>Users ({filteredUsers.length})</Typography>
          <Button variant="contained" onClick={()=>handleOpenFormModal('create')} startIcon={<AddCircleOutline />}>Add New User</Button>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor:'#1976d2' }}>
                {headCells.map(head => (
                  <TableCell key={head.id} sx={{color:'#fff', fontWeight:600}}>
                    <Box sx={{ display:'flex', alignItems:'center' }}>
                      {head.label}
                      {!head.disableSort && (
                        <IconButton size="small" color="inherit" onClick={()=>handleRequestSort(head.id)} sx={{ ml:0.5 }}>
                          {orderBy===head.id ? (order==='asc' ? <ArrowUpward fontSize="small"/> : <ArrowDownward fontSize="small"/>) : <FilterList fontSize="small"/>}
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedUsers.length>0 ? paginatedUsers.map((user,i)=>(
                <TableRow key={user.id} sx={{ '&:hover': { backgroundColor:'#e3f2fd' } }}>
                  <TableCell>{page*rowsPerPage + i +1}</TableCell>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phoneNumber}</TableCell>
                  <TableCell>{user.roleId}</TableCell>
                  <TableCell>{user.roleName}</TableCell>
                  <TableCell>{new Date(user.dateCreated).toLocaleString()}</TableCell>
                  <TableCell sx={{ display:'flex', gap:1 }}>
                    <Tooltip title="View Details"><IconButton color="info" size="small" onClick={()=>handleOpenDetailsModal(user)}><Visibility /></IconButton></Tooltip>
                    <Tooltip title="Edit User"><IconButton color="primary" size="small" onClick={()=>handleOpenFormModal('edit',user)}><Edit /></IconButton></Tooltip>
                    <Tooltip title="Delete User"><IconButton color="error" size="small" onClick={()=>handleDeleteUser(user.id)}><Delete /></IconButton></Tooltip>
                  </TableCell>
                </TableRow>
              )) : <TableRow><TableCell colSpan={9} align="center">No users found.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <UserFormModal open={isFormModalOpen} handleClose={handleCloseFormModal} mode={modalMode} user={selectedUser} onFormSubmit={handleFormSubmit}/>
      <UserDetailsModal open={isDetailsModalOpen} handleClose={handleCloseDetailsModal} user={selectedUser}/>
    </Container>
  );
}
