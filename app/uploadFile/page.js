'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LogoutIcon from '@mui/icons-material/Logout';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/Download';
import { DataGrid } from '@mui/x-data-grid';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem('authToken');
  useEffect(() => {
    setIsClient(true);
    if (!token) {
      router.push('/auth');
    }
    fetchFiles();
  }, [router]);
console.log("token",token);
  const fetchFiles = async () => {
    try {
      const res = await axios.get('http://localhost:3001/uploadFile/files',{    
          headers: {
            Authorization: `Bearer ${token}`
          }
      });
      console.log('FILES API RESPONSE:', res.data);
      setFiles(Array.isArray(res.data) ? res.data : res.data.files || []);
    } catch (err) {
      console.error('Failed to fetch files', err);
      setFiles([]);
    }
  };
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/uploadFile/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
           Authorization: `Bearer ${token}`
       },
      });

      setFileUrl(response.data.fileUrl);
      setQrCodeUrl(response.data.qrCodeUrl || null);
      setFileType(response.data.fileType || null);
      setError(null);
      fetchFiles();
    } catch (err) {
      setError('Error uploading file');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setFileUrl(null);
    setQrCodeUrl(null);
    setFileType(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = async (fileName) => {
    try {
      await axios.delete(`http://localhost:3001/uploadFile/deleteByName/${fileName}`);
      fetchFiles(); // Refresh the file list after delete
    } catch (err) {
      console.error('Failed to delete file', err);
    }
  };
const columns = [
  { field: 'fileName', headerName: 'File Name', flex: 1 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 180,
    renderCell: (params) => (
      <>
        <IconButton color="primary" onClick={() => window.open(params.row.fileUrl, '_blank')}>
          <PictureAsPdfIcon />
        </IconButton>
        <IconButton color="primary" onClick={() => window.open(params.row.fileUrl, '_blank')}>
          <FileDownloadIcon />
        </IconButton>
        <IconButton color="error" onClick={() => handleDeleteFile(params.row.fileName)}>
          <DeleteIcon />
        </IconButton>
      </>
    ),
  },
]
  if (!isClient) return null;

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1 }}>
        <Navbar />
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            Medical File Upload & QR Generator
          </Typography>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h6" color="#1976d2">
              📁 File Upload & Management
            </Typography>
          </Box>

          <Card elevation={3} sx={{ maxWidth: "auto", mx: 'auto', borderRadius: 3 }}>
            <CardContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box display="flex" gap={2} alignItems="center" mb={3}>
                <TextField
                  type="file"
                  accept="*/*"
                  onChange={handleFileChange}
                  inputRef={fileInputRef}
                  fullWidth
                  variant="outlined"
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <Button
                  onClick={handleUpload}
                  variant="contained"
                  startIcon={<CloudUploadIcon />}
                  disabled={loading}
                  sx={{ backgroundColor: '#1976d2', color: '#fff' }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : 'Upload'}
                </Button>
                <Button onClick={handleReset} variant="outlined" color="secondary" startIcon={<RestartAltIcon />}>
                  Reset
                </Button>
              </Box>

              <Divider sx={{ my: 3 }} />

              {qrCodeUrl && (
                <Box mb={3}>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    QR Code:
                  </Typography>
                  <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '100px' }} />
                </Box>
              )}

              <Box>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Files:
                </Typography>
                <div style={{ height:"50vh", maxHeight: "auto", width: '100%' }}>
                  <DataGrid
                    rows={files.map((file, index) => ({
                      id: index,
                      fileName: file.fileName,
                      fileUrl: file.fileUrl,
                    }))}
                    columns={columns}
                    pageSize={5}
                    rowsPerPageOptions={[5]}
                    getRowId={(row) => row.id}
                  />
                </div>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
