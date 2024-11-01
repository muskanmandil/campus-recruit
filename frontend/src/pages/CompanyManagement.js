import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Grid,
  IconButton,
  Chip,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';

const CompanyManagement = () => {
  const initialFormData = {
    company_name: '',
    role: '',
    ctc: '',
    location: [],
    description: '',
    docs_attached: [], // Will store file objects
    deadline: '',
    eligible_branch: [],
    tenth_percentage: '',
    twelfth_percentage: '',
    diploma_cgpa: '',
    ug_cgpa: ''
  };

  const [companies, setCompanies] = useState([]);
  const [open, setOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState(initialFormData);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Store file objects

  const handleOpen = () => {
    setOpen(true);
    setIsEdit(false);
    setFormData(initialFormData);
    setUploadedFiles([]);
  };

  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
    setEditIndex(null);
    setUploadedFiles([]);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === 'location' || name === 'eligible_branch') {
      setFormData({
        ...formData,
        [name]: value.split(',').map(item => item.trim())
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    
    // In a real application, you would upload these files to your server/S3
    // For now, we'll just store the file objects
    setFormData(prev => ({
      ...prev,
      docs_attached: [...prev.docs_attached, ...files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))]
    }));
  };

  const handleRemoveFile = (index) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    setFormData(prev => ({
      ...prev,
      docs_attached: newFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
      }))
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = () => {
    const formattedData = {
      ...formData,
      ctc: Number(formData.ctc).toFixed(2),
      tenth_percentage: Number(formData.tenth_percentage).toFixed(2),
      twelfth_percentage: Number(formData.twelfth_percentage).toFixed(2),
      diploma_cgpa: Number(formData.diploma_cgpa).toFixed(2),
      ug_cgpa: Number(formData.ug_cgpa).toFixed(2)
    };

    // In a real application, you would handle file uploads here
    // For now, we'll just store the file metadata
    formattedData.docs_attached = uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type
    }));

    if (isEdit) {
      const updatedCompanies = [...companies];
      updatedCompanies[editIndex] = formattedData;
      setCompanies(updatedCompanies);
    } else {
      setCompanies([...companies, formattedData]);
    }
    handleClose();
  };

  // Rest of the handlers remain the same...
  const handleEdit = (index) => {
    setIsEdit(true);
    setEditIndex(index);
    setFormData(companies[index]);
    // For edit, we'd typically need to fetch the actual files from the server
    setUploadedFiles(companies[index].docs_attached);
    setOpen(true);
  };

  const handleExport = (company) => {
    const dataStr = JSON.stringify(company, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${company.company_name}_details.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImport = (event, index) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        const updatedCompanies = [...companies];
        updatedCompanies[index] = importedData;
        setCompanies(updatedCompanies);
      } catch (error) {
        alert('Error importing file. Please ensure it is a valid JSON file.');
      }
    };

    reader.readAsText(file);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Add New Company
        </Button>
      </Box>

      <Grid container spacing={3}>
        {companies.map((company, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardContent>
                <Typography variant="h5" gutterBottom>
                  {company.company_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Role: {company.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  CTC: ₹{company.ctc}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    Location:
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {company.location.map((loc, i) => (
                        <Chip key={i} label={loc} size="small" />
                      ))}
                    </Stack>
                  </Typography>
                </Box>
                {company.description && (
                  <Typography variant="body2" color="text.secondary">
                    Description: {company.description}
                  </Typography>
                )}
                {company.docs_attached.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Attached Documents:
                    </Typography>
                    <List dense>
                      {company.docs_attached.map((doc, i) => (
                        <ListItem key={i}>
                          <ListItemText 
                            primary={doc.name}
                            secondary={formatFileSize(doc.size)}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
                <Typography variant="body2" color="text.secondary">
                  Deadline: {new Date(company.deadline).toLocaleString()}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" component="div">
                    Eligible Branches:
                    <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                      {company.eligible_branch.map((branch, i) => (
                        <Chip key={i} label={branch} size="small" />
                      ))}
                    </Stack>
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Minimum Requirements:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 10th: {company.tenth_percentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • 12th: {company.twelfth_percentage}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Diploma: {company.diploma_cgpa} CGPA
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • UG: {company.ug_cgpa} CGPA
                </Typography>
              </CardContent>
              <CardActions>
                <IconButton onClick={() => handleEdit(index)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => handleExport(company)}>
                  <ExportIcon />
                </IconButton>
                <IconButton component="label">
                  <input
                    type="file"
                    hidden
                    accept=".json"
                    onChange={(e) => handleImport(e, index)}
                  />
                  <ImportIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {isEdit ? 'Edit Company Details' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              name="company_name"
              label="Company Name"
              fullWidth
              value={formData.company_name}
              onChange={handleChange}
            />
            <TextField
              name="role"
              label="Role"
              fullWidth
              value={formData.role}
              onChange={handleChange}
            />
            <TextField
              name="ctc"
              label="CTC"
              type="number"
              fullWidth
              value={formData.ctc}
              onChange={handleChange}
            />
            <TextField
              name="location"
              label="Location (comma-separated)"
              fullWidth
              value={formData.location.join(', ')}
              onChange={handleChange}
              helperText="Enter locations separated by commas"
            />
            <TextField
              name="description"
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={formData.description || ''}
              onChange={handleChange}
            />
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<AttachFileIcon />}
              >
                Upload Documents
                <input
                  type="file"
                  hidden
                  multiple
                  onChange={handleFileUpload}
                />
              </Button>
              {uploadedFiles.length > 0 && (
                <List dense>
                  {uploadedFiles.map((file, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={file.name}
                        secondary={formatFileSize(file.size)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          onClick={() => handleRemoveFile(index)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            <TextField
              name="deadline"
              label="Deadline"
              type="datetime-local"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={formData.deadline}
              onChange={handleChange}
            />
            <TextField
              name="eligible_branch"
              label="Eligible Branches (comma-separated)"
              fullWidth
              value={formData.eligible_branch.join(', ')}
              onChange={handleChange}
              helperText="Enter branches separated by commas"
            />
            <TextField
              name="tenth_percentage"
              label="10th Percentage"
              type="number"
              fullWidth
              value={formData.tenth_percentage}
              onChange={handleChange}
            />
            <TextField
              name="twelfth_percentage"
              label="12th Percentage"
              type="number"
              fullWidth
              value={formData.twelfth_percentage}
              onChange={handleChange}
            />
            <TextField
              name="diploma_cgpa"
              label="Diploma CGPA"
              type="number"
              fullWidth
              value={formData.diploma_cgpa}
              onChange={handleChange}
            />
            <TextField
              name="ug_cgpa"
              label="UG CGPA"
              type="number"
              fullWidth
              value={formData.ug_cgpa}
              onChange={handleChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyManagement;