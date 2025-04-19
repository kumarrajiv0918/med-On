'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  Grid,
  Dialog,
  Card,
  CardContent,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const initialFormData = {
    _id: '',
    name: '',
    businessName: '',
    address: '',
    pinCode: '',
    email: '',
    password: '',
    roleId: 'user',
    confirmPassword: '',
    createdBy: 'system',
  };

  const router = useRouter();
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const token = localStorage.getItem('authToken');
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      console.log('user.roleId', user.roleId);
      if (user.roleId !== 'admin' && !token) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        router.push('/auth');
      }
    }
  }, []);

  const validate = () => {
    const newErrors = {};
    for (const key in formData) {
      if (!formData[key] && key !== '_id' && key !== 'confirmPassword' && key !== 'password') {
        newErrors[key] = 'This field is required';
      }
    }
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Enter a valid email';
    }
    if (!formData._id) {
      if (!formData.password || formData.password.length < 6) {
        newErrors.password = 'Password should be at least 6 characters';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else {
      if (formData.password) {
        if (formData.password.length < 6) {
          newErrors.password = 'Password should be at least 6 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors((prev) => ({
      ...prev,
      [e.target.name]: '',
    }));
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      setError('');
      setMessage('');
      setLoading(true);

      if (formData._id) {
        const payload = { ...formData };
        delete payload._id;
        delete payload.confirmPassword;
        const res = await axios.put(
          `http://localhost:3001/api/updateUser/${formData._id}`,
          updatePayload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setMessage(res.data.message);
      } else {
        const payload = { ...formData };
        delete payload._id;
        delete payload.confirmPassword;
        const res = await axios.post('http://localhost:3001/api/register', payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setMessage(res.data.message);
      }

      fetchUsers();
      setFormData(initialFormData);
      setOpenDialog(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:3001/getAlluserApi/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if(!res){
        console.log('Failed to fetch users:', err);
      }
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setMessage('');
    setError('');
    setErrors({});
    setFormData(initialFormData);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setMessage('');
    setError('');
    setErrors({});
    setFormData(initialFormData);
  };

  const handleEditUser = (row) => {
    setFormData({
      _id: row._id,
      name: row.name,
      businessName: row.businessName,
      email: row.email,
      pinCode: row.pinCode,
      address: row.address,
      password: '',
      roleId: 'user',
      confirmPassword: '',
      createdBy: 'system',
    });
    setOpenDialog(true);
    setMessage('');
    setError('');
    setErrors({});
  };

  const handleToggleUserStatus = async (row) => {
    try {
      const newStatus = row.status === 'enable' ? 'disable' : 'enable';
      const payload = {
        status: newStatus,
        roleId: row.roleId,
      };

      const res = await axios.put(
        `http://localhost:3001/auth/updateUserStatus/${row._id}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMessage(res.data.message);
      fetchUsers(); // refresh list
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status');
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'businessName', headerName: 'Business', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 1 },
    { field: 'pinCode', headerName: 'Pin Code', flex: 1 },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <IconButton color="primary" onClick={() => handleEditUser(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton
            color={params.row.status === 'enable' ? 'success' : 'error'}
            onClick={() => handleToggleUserStatus(params.row)}
          >
            <BlockIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Register Users
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 6, mt: 6 }}>
            <Button variant="contained" color="primary" onClick={handleOpenDialog}>
              Add User
            </Button>
          </Box>

          <Card elevation={3} sx={{ mt: 3, borderRadius: 3 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                Users:
              </Typography>
              <div style={{ height: '50vh', width: '100%' }}>
                <DataGrid
                  rows={users}
                  columns={columns}
                  pageSize={5}
                  rowsPerPageOptions={[5]}
                  getRowId={(row) => row._id}
                />
              </div>
            </CardContent>
          </Card>

          <Dialog open={openDialog} onClose={handleCloseDialog} fullWidth maxWidth="sm">
            <DialogTitle>{formData._id ? 'Update User' : 'Register New User'}</DialogTitle>
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <DialogContent>
              <Grid container spacing={2} m={1}>
                <Grid item xs={6}>
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={!!formData._id}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Business Name"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.businessName}
                    helperText={errors.businessName}
                  />
                </Grid>
                {!formData._id && (
                  <>
                    <Grid item xs={6}>
                      <TextField
                        label="Password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.password}
                        helperText={errors.password}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        fullWidth
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword}
                      />
                    </Grid>
                  </>
                )}
                <Grid item xs={6}>
                  <TextField
                    label="Pin Code"
                    name="pinCode"
                    type="number"
                    value={formData.pinCode}
                    onChange={handleChange}
                    fullWidth
                    error={!!errors.pinCode}
                    helperText={errors.pinCode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    fullWidth
                    variant="outlined"
                    error={!!errors.address}
                    helperText={errors.address}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="secondary" variant="outlined">
                Cancel
              </Button>
              <Button
                onClick={handleRegister}
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? 'Submitting...' : formData._id ? 'Update' : 'Submit'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}
