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
    docs_attached: [],
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
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [viewMore, setViewMore] = useState({});

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
      setCompanies([formattedData, ...companies]);
    }
    handleClose();
  };

  const handleEdit = (index) => {
    setIsEdit(true);
    setEditIndex(index);
    setFormData(companies[index]);
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

  const toggleViewMore = (index) => {
    setViewMore(prev => ({ ...prev, [index]: !prev[index] }));
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
                    Description: {viewMore[index] ? company.description : `${company.description.slice(0, 50)}... `}
                    <Button size="small" onClick={() => toggleViewMore(index)}>
                      {viewMore[index] ? 'View Less' : 'View More'}
                    </Button>
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
                <Button onClick={() => handleEdit(index)} startIcon={<EditIcon />}>Edit</Button>
                <Button onClick={() => handleExport(company)}>Export</Button>
                <label htmlFor={`import-input-${index}`}>
                  <input
                    id={`import-input-${index}`}
                    type="file"
                    hidden
                    onChange={(e) => handleImport(e, index)}
                  />
                  <Button component="span">Import</Button>
                </label>
                <IconButton onClick={() => setCompanies(companies.filter((_, i) => i !== index))}>
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{isEdit ? 'Edit Company' : 'Add New Company'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="company_name"
            label="Company Name"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.company_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="role"
            label="Role"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.role}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="ctc"
            label="CTC (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.ctc}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="Location (comma-separated)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.location.join(', ')}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={4}
            value={formData.description}
            onChange={handleChange}
          />
          <Box sx={{ mt: 2 }}>
            <Button variant="contained" component="label" startIcon={<AttachFileIcon />}>
              Upload Documents
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileUpload}
              />
            </Button>
            <List dense>
              {uploadedFiles.map((file, i) => (
                <ListItem key={i}>
                  <ListItemText primary={file.name} secondary={formatFileSize(file.size)} />
                  <ListItemSecondaryAction>
                    <IconButton edge="end" onClick={() => handleRemoveFile(i)}>
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </Box>
          <TextField
            margin="dense"
            name="deadline"
            label="Deadline"
            type="datetime-local"
            fullWidth
            variant="outlined"
            value={formData.deadline}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="eligible_branch"
            label="Eligible Branches (comma-separated)"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.eligible_branch.join(', ')}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="tenth_percentage"
            label="10th Percentage Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.tenth_percentage}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="twelfth_percentage"
            label="12th Percentage Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.twelfth_percentage}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="diploma_cgpa"
            label="Diploma CGPA Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.diploma_cgpa}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="ug_cgpa"
            label="UG CGPA Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={formData.ug_cgpa}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompanyManagement;
