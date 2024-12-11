// import React, { useState, useEffect } from "react";
// import { Box, Button, Card, CardContent, CardActions, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Typography, Grid, IconButton, List, ListItem, ListItemText, ListItemSecondaryAction } from "@mui/material";
// import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, AttachFile as AttachFileIcon } from "@mui/icons-material";
// import { toast } from "react-toastify";
// import moment from "moment";
// import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
// import DescriptionIcon from "@mui/icons-material/Description";
// import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

// const ManageCompanies = () => {
//   const [companies, setCompanies] = useState([]);
//   const [popup, setPopup] = useState(false);
//   const [editing, setEditing] = useState(false);
//   const [editingId, setEditingId] = useState(null);
//   const [company, setCompany] = useState({
//     company_name: "",
//     role: "",
//     ctc: "",
//     location: null,
//     description: null,
//     docs_attached: null,
//     deadline: "",
//     eligible_branch: null,
//     tenth_percentage: null,
//     twelfth_percentage: null,
//     diploma_cgpa: null,
//     ug_cgpa: null,
//   });

//   const [docs, setDocs] = useState([]);
//   const [viewMore, setViewMore] = useState({});
//   const [importFile, setImportFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [submitting, setSubmitting] = useState(false);

//   const backendUrl = process.env.REACT_APP_BACKEND_URL;

//   useEffect(() => {
//     fetchCompanies();
//   },[]);

//   const fetchCompanies = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(`${backendUrl}/company/all`, {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       const data = await response.json();
//       if (response.ok) {
//         setCompanies(data.companies);
//         toast.success(data.message);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Server Error");
//     }
//     setLoading(false);
//   };

//   const toggleViewMore = (index) => {
//     setViewMore((prev) => ({ ...prev, [index]: !prev[index] }));
//   };

//   const openPopup = () => {
//     setPopup(true);
//     setEditing(false);
//     setDocs([]);
//   };

//   const closePopup = () => {
//     setPopup(false);
//     setEditing(false);
//     setEditingId(null);
//     setDocs([]);
//     setImportFile(null);
//   };

//   const openEditor = (id) => {
//     setEditing(true);
//     setEditingId(id);
//     setCompany(companies[id]);
//     setDocs(companies[id].docs_attached);
//     setPopup(true);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     if (name === "location" || name === "eligible_branch") {
//       setCompany({
//         ...company,
//         [name]: value.split(",").map((item) => item.trim()),
//       });
//     } else {
//       setCompany({ ...company, [name]: value });
//     }
//   };

//   const getFileIcon = (extension) => {
//     switch (extension) {
//       case "pdf":
//         return <PictureAsPdfIcon />;
//       case "doc":
//       case "docx":
//         return <DescriptionIcon />;
//       default:
//         return <InsertDriveFileIcon />;
//     }
//   };

//   const handleFileUpload = (e) => {
//     const files = Array.from(e.target.files);
//     const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);
//     if (validFiles.length < files.length) {
//       alert("Some files exceed 10MB.");
//       return;
//     }
//     setDocs((prev) => [...prev, ...validFiles]);
//   };

//   const handleRemoveFile = (idx) => {
//     setDocs((prev) => prev.filter((_, i) => i !== idx));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);

//     try {
//       const formData = new FormData();

//       Object.keys(company).forEach((key) => {
//         if (key !== "docs_attached" && company[key]) {
//           if (key === "eligible_branch" || key === "location") {
//             const value = company[key].join('","');
//             formData.append(key, `{"${value}"}`);
//           } else {
//             formData.append(key, company[key]);
//           }
//         }
//       });

//       docs.forEach((file, i) => {
//         formData.append("docs_attached", file);
//       });

//       const response = await fetch(`${backendUrl}/company/add`, {
//         method: "POST",
//         headers: {
//           "auth-token": sessionStorage.getItem("token"),
//         },
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         toast.success(data.message);
//         setCompany({});
//         closePopup();
//         fetchCompanies();
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Server Error");
//     }
//     setSubmitting(false);
//   };

//   const handleImport = async (company) => {
//     if (!importFile) {
//       toast.error("Please upload a file");
//       return;
//     }

//     if (
//       importFile.type !==
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     ) {
//       toast.error("Please upload an Excel");
//       return;
//     }

//     if (importFile.size > 10 * 1024 * 1024) {
//       toast.error("File size exceeds 10MB size limit");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", importFile);
//     formData.append("company_name", company.company_name);

//     try {
//       const response = await fetch(`${backendUrl}/company/import-data`, {
//         method: "POST",
//         headers: {
//           "auth-token": `${sessionStorage.getItem("token")}`,
//         },
//         body: formData,
//       });

//       const data = await response.json();
//       if (response.ok) {
//         toast.success(data.message);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Server Error");
//     }
//   };

//   const handleExport = async (company) => {
//     try {
//       const response = await fetch(`${backendUrl}/company/export-data`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           "auth-token": sessionStorage.getItem("token"),
//         },
//         body: JSON.stringify({ company_name: company.company_name }),
//       });

//       const data = await response.json();
//       if (response.ok) {
//         window.open(data.fileUrl, "_blank");
//         toast.success(data.message);
//       } else {
//         toast.error(data.message);
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Server error");
//     }
//   };

//   return loading ? (
//     <>Fetching Companies...</>
//   ) : (
//     <Box sx={{ p: 3 }}>
//       <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
//         <Button variant="contained" startIcon={<AddIcon />} onClick={openPopup}>
//           Add New Company
//         </Button>
//       </Box>

//       <Grid container spacing={3}>
//         {companies?.map((company, index) => (

//           <Grid item xs={12} sm={6} md={4} key={index}>
//             <Card>
//               <CardContent>
//                 <Typography variant="h5" gutterBottom>
//                   {company.company_name}
//                 </Typography>

//                 <Typography variant="body2" color="text.secondary">
//                   Role: {company.role}
//                 </Typography>

//                 <Typography sx={{ mb: 1.5 }} color="text.secondary">
//                   Eligible Branches: {company.eligible_branch.join(" / ")}
//                 </Typography>

//                 <Typography variant="body2" color="text.secondary">
//                   CTC: ₹{Number(company.ctc).toLocaleString("en-IN")}
//                 </Typography>

//                 <Typography sx={{ mb: 1.5 }} color="text.secondary">
//                   Location: {company.location.join(" / ")}
//                 </Typography>

//                 <Typography variant="body2" color="text.secondary">
//                   Deadline:{" "}
//                   {moment(company.deadline).format("hh:mm A DD-MM-YYYY")}
//                 </Typography>

//                 <Typography variant="body2" color="text.secondary">
//                   Academic Eligiblity:
//                 </Typography>

//                 <Typography variant="body2" color="text.secondary">
//                   • 10th: {company.tenth_percentage}%
//                 </Typography>

//                 <Typography variant="body2" color="text.secondary">
//                   • 12th: {company.twelfth_percentage}% or Diploma CGPA:{" "}
//                   {company.diploma_cgpa}
//                 </Typography>

//                 <Typography variant="body2" color="text.secondary">
//                   • UG CGPA: {company.ug_cgpa}
//                 </Typography>

//                 {company.description && (
//                   <Typography variant="body2" color="text.secondary">
//                     Description:{" "}
//                     {viewMore[index] ? company.description : `${company.description.slice(0, 50)}... `}
//                     <Button size="small" onClick={() => toggleViewMore(index)}>
//                       {viewMore[index] ? "View Less" : "View More"}
//                     </Button>
//                   </Typography>
//                 )}

//                 {company.docs_attached && company.docs_attached.length > 0 && (
//                   <div style={{ marginTop: "1rem" }}>
//                     <Typography variant="subtitle1">
//                       Documents Attached:
//                     </Typography>

//                     <ul style={{ paddingLeft: "1rem" }}>
//                       {company.docs_attached.map((fileUrl, i) => {
//                         const fileName = fileUrl.split("/").pop();
//                         const fileExtension = fileName.split(".").pop().toLowerCase();

//                         return (
//                           <li key={i} style={{display: "flex", alignItems: "center"}}>
//                             {getFileIcon(fileExtension)}
//                             <Typography
//                               component="a"
//                               href={fileUrl}
//                               target="_blank"
//                               rel="noopener noreferrer"
//                               style={{
//                                 marginLeft: "0.5rem",
//                                 color: "#1976d2",
//                                 textDecoration: "none",
//                               }}
//                             >
//                               {fileName}
//                             </Typography>
//                           </li>
//                         );
//                       })}
//                     </ul>
//                   </div>
//                 )}
//               </CardContent>

//               <CardActions>
//                 <Button onClick={() => openEditor(index)} startIcon={<EditIcon />}>
//                   Edit
//                 </Button>

//                 <Button variant="contained" component="label" startIcon={<AttachFileIcon />}>
//                   Import Data
//                   <input type="file" hidden multiple onChange={handleFileUpload} />
//                 </Button>

//                 <Button onClick={() => handleExport(company)}>
//                   Export Data
//                 </Button>

//                 <IconButton onClick={() => setCompanies(companies.filter((_, i) => i !== index))}>
//                   <DeleteIcon />
//                 </IconButton>
//               </CardActions>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>

//       <Dialog open={popup} onClose={closePopup}>

//         <DialogTitle>
//           {editing ? "Edit Company" : "Add New Company"}
//         </DialogTitle>

//         <DialogContent>
//           <TextField
//             autoFocus
//             margin="dense"
//             name="company_name"
//             label="Company Name"
//             type="text"
//             fullWidth
//             variant="outlined"
//             value={company.company_name}
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="role"
//             label="Role"
//             type="text"
//             fullWidth
//             variant="outlined"
//             value={company.role}
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="ctc"
//             label="CTC (₹)"
//             type="number"
//             fullWidth
//             variant="outlined"
//             value={company.ctc}
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="location"
//             label="Location (comma-separated)"
//             type="text"
//             fullWidth
//             variant="outlined"
//             value={company.location && company.location.join(", ")}
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="description"
//             label="Description"
//             type="text"
//             fullWidth
//             variant="outlined"
//             multiline
//             rows={4}
//             value={company.description}
//             onChange={handleChange}
//           />

//           <Box sx={{ mt: 2 }}>
//             <Button variant="contained" component="label" startIcon={<AttachFileIcon />} >
//               Upload Documents
//               <input type="file" hidden multiple onChange={handleFileUpload} />
//             </Button>

//             <List dense>
//               {docs.map((file, i) => (
//                 <ListItem key={i}>
//                   <ListItemText primary={file.name} />
//                   <ListItemSecondaryAction>
//                     <IconButton edge="end" onClick={() => handleRemoveFile(i)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </ListItemSecondaryAction>
//                 </ListItem>
//               ))}
//             </List>
//           </Box>

//           <TextField
//             margin="dense"
//             name="deadline"
//             label="Deadline"
//             type="datetime-local"
//             fullWidth
//             variant="outlined"
//             value={company.deadline}
//             onChange={handleChange}
//             InputLabelProps={{
//               shrink: true,
//             }}
//           />

//           <TextField
//             margin="dense"
//             name="eligible_branch"
//             label="Eligible Branches (comma-separated)"
//             type="text"
//             fullWidth
//             variant="outlined"
//             value={
//               company.eligible_branch && company.eligible_branch.join(", ")
//             }
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="tenth_percentage"
//             label="10th Percentage Requirement"
//             type="number"
//             fullWidth
//             variant="outlined"
//             value={company.tenth_percentage}
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="twelfth_percentage"
//             label="12th Percentage Requirement"
//             type="number"
//             fullWidth
//             variant="outlined"
//             value={company.twelfth_percentage}
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="diploma_cgpa"
//             label="Diploma CGPA Requirement"
//             type="number"
//             fullWidth
//             variant="outlined"
//             value={company.diploma_cgpa}
//             onChange={handleChange}
//           />

//           <TextField
//             margin="dense"
//             name="ug_cgpa"
//             label="UG CGPA Requirement"
//             type="number"
//             fullWidth
//             variant="outlined"
//             value={company.ug_cgpa}
//             onChange={handleChange}
//           />
//         </DialogContent>

//         <DialogActions>
//           <Button onClick={closePopup}>Cancel</Button>
//           <Button onClick={handleSubmit} variant="contained">
//             {submitting? 'Loading...' : editing ? "Update" : "Add"}
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default ManageCompanies;


import React, { useState, useEffect } from "react";
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
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction,
  Paper
} from "@mui/material";
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  AttachFile as AttachFileIcon 
} from "@mui/icons-material";
import { toast } from "react-toastify";
import moment from "moment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";

const ManageCompanies = () => {
  // ... (previous state and function definitions remain the same)
  const [companies, setCompanies] = useState([]);
  const [popup, setPopup] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [company, setCompany] = useState({
    company_name: "",
    role: "",
    ctc: "",
    location: null,
    description: null,
    docs_attached: null,
    deadline: "",
    eligible_branch: null,
    tenth_percentage: null,
    twelfth_percentage: null,
    diploma_cgpa: null,
    ug_cgpa: null,
  });

  const [docs, setDocs] = useState([]);
  const [viewMore, setViewMore] = useState({});
  const [importFile, setImportFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchCompanies();
  },[]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/company/all`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setCompanies(data.companies);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
    setLoading(false);
  };

  const toggleViewMore = (index) => {
    setViewMore((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const openPopup = () => {
    setPopup(true);
    setEditing(false);
    setDocs([]);
  };

  const closePopup = () => {
    setPopup(false);
    setEditing(false);
    setEditingId(null);
    setDocs([]);
    setImportFile(null);
  };

  const openEditor = (id) => {
    setEditing(true);
    setEditingId(id);
    setCompany(companies[id]);
    setDocs(companies[id].docs_attached);
    setPopup(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "location" || name === "eligible_branch") {
      setCompany({
        ...company,
        [name]: value.split(",").map((item) => item.trim()),
      });
    } else {
      setCompany({ ...company, [name]: value });
    }
  };

  const getFileIcon = (extension) => {
    switch (extension) {
      case "pdf":
        return <PictureAsPdfIcon />;
      case "doc":
      case "docx":
        return <DescriptionIcon />;
      default:
        return <InsertDriveFileIcon />;
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024);
    if (validFiles.length < files.length) {
      alert("Some files exceed 10MB.");
      return;
    }
    setDocs((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (idx) => {
    setDocs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();

      Object.keys(company).forEach((key) => {
        if (key !== "docs_attached" && company[key]) {
          if (key === "eligible_branch" || key === "location") {
            const value = company[key].join('","');
            formData.append(key, `{"${value}"}`);
          } else {
            formData.append(key, company[key]);
          }
        }
      });

      docs.forEach((file, i) => {
        formData.append("docs_attached", file);
      });

      const response = await fetch(`${backendUrl}/company/add`, {
        method: "POST",
        headers: {
          "auth-token": sessionStorage.getItem("token"),
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setCompany({});
        closePopup();
        fetchCompanies();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
    setSubmitting(false);
  };

  const handleImport = async (company) => {
    if (!importFile) {
      toast.error("Please upload a file");
      return;
    }

    if (
      importFile.type !==
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      toast.error("Please upload an Excel");
      return;
    }

    if (importFile.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB size limit");
      return;
    }

    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("company_name", company.company_name);

    try {
      const response = await fetch(`${backendUrl}/company/import-data`, {
        method: "POST",
        headers: {
          "auth-token": `${sessionStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
  };

  const handleExport = async (company) => {
    try {
      const response = await fetch(`${backendUrl}/company/export-data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "auth-token": sessionStorage.getItem("token"),
        },
        body: JSON.stringify({ company_name: company.company_name }),
      });

      const data = await response.json();
      if (response.ok) {
        window.open(data.fileUrl, "_blank");
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error");
    }
  };

  return loading ? (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#f0f2f5'
    }}>
      <Typography variant="h5" color="primary">
        Fetching Companies...
      </Typography>
    </Box>
  ) : (
    <Paper 
      elevation={3} 
      sx={{ 
        p: 4, 
        m: 2, 
        backgroundColor: '#f9fafb', 
        borderRadius: 3 
      }}
    >
      <Box sx={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        mb: 4,
        borderBottom: '2px solid #e0e0e0',
        pb: 2
      }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#1a1a2e' }}>
          Company Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<AddIcon />} 
          onClick={openPopup}
          sx={{
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            '&:hover': {
              backgroundColor: '#1976d2',
              boxShadow: '0 6px 8px rgba(0,0,0,0.15)'
            }
          }}
        >
          Add New Company
        </Button>
      </Box>

      <Grid container spacing={4}>
        {companies?.map((company, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }
              }}
              elevation={4}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h5" 
                  gutterBottom 
                  sx={{ 
                    fontWeight: 'bold', 
                    color: '#2c3e50',
                    borderBottom: '2px solid #3498db',
                    pb: 1
                  }}
                >
                  {company.company_name}
                </Typography>

                {/* Rest of the card content with enhanced styling */}
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ mb: 0.5, fontStyle: 'italic' }}
                >
                  <strong>Role:</strong> {company.role}
                </Typography>

                <Typography 
                  sx={{ mb: 1.5 }} 
                  color="text.secondary"
                >
                  <strong>Eligible Branches:</strong> {company.eligible_branch.join(" / ")}
                </Typography>

                {/* Similar styling for other Typography components */}
                {/* ... rest of the original rendering logic ... */}
                <Typography variant="body2" color="text.secondary">
                  <strong>CTC:</strong> ₹{Number(company.ctc).toLocaleString("en-IN")}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  <strong>Location:</strong> {company.location.join(" / ")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Deadline:{" "}</strong>
                  {moment(company.deadline).format("hh:mm A DD-MM-YYYY")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>Academic Eligiblity:</strong>
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>• 10th:</strong> {company.tenth_percentage}%
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>• 12th:</strong> {company.twelfth_percentage}% or Diploma CGPA:{" "}
                  {company.diploma_cgpa}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  <strong>• UG CGPA:</strong> {company.ug_cgpa}
                </Typography>

                {company.description && (
                  <Typography variant="body2" color="text.secondary">
                    Description:{" "}
                    {viewMore[index] ? company.description : `${company.description.slice(0, 50)}... `}
                    <Button size="small" onClick={() => toggleViewMore(index)}>
                      {viewMore[index] ? "View Less" : "View More"}
                    </Button>
                  </Typography>
                )}

                {company.docs_attached && company.docs_attached.length > 0 && (
                  <div style={{ marginTop: "1rem" }}>
                    <Typography variant="subtitle1">
                      Documents Attached:
                    </Typography>

                    <ul style={{ paddingLeft: "1rem" }}>
                      {company.docs_attached.map((fileUrl, i) => {
                        const fileName = fileUrl.split("/").pop();
                        const fileExtension = fileName.split(".").pop().toLowerCase();

                        return (
                          <li key={i} style={{display: "flex", alignItems: "center"}}>
                            {getFileIcon(fileExtension)}
                            <Typography
                              component="a"
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                marginLeft: "0.5rem",
                                color: "#1976d2",
                                textDecoration: "none",
                              }}
                            >
                              {fileName}
                            </Typography>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </CardContent>

              <CardActions sx={{ 
                justifyContent: 'space-between', 
                borderTop: '1px solid #e0e0e0',
                p: 2 
              }}>
                {/* Action buttons with enhanced styling */}
                <Button 
                  onClick={() => openEditor(index)} 
                  startIcon={<EditIcon />}
                  color="primary"
                  variant="outlined"
                >
                  Edit
                </Button>

                <Button 
                  variant="contained" 
                  component="label" 
                  color="secondary"
                  startIcon={<AttachFileIcon />}
                >
                  Import Data
                  <input type="file" hidden multiple onChange={handleFileUpload} />
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Dialog remains mostly the same, with some style enhancements */}
      <Dialog 
        open={popup} 
        onClose={closePopup}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1
          }
        }}
      >
        {/* Previous dialog content with minor style adjustments */}
        <DialogTitle>
          {editing ? "Edit Company" : "Add New Company"}
        </DialogTitle>

        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="company_name"
            label="Company Name"
            type="text"
            fullWidth
            variant="outlined"
            value={company.company_name}
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="role"
            label="Role"
            type="text"
            fullWidth
            variant="outlined"
            value={company.role}
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="ctc"
            label="CTC (₹)"
            type="number"
            fullWidth
            variant="outlined"
            value={company.ctc}
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="location"
            label="Location (comma-separated)"
            type="text"
            fullWidth
            variant="outlined"
            value={company.location && company.location.join(", ")}
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
            value={company.description}
            onChange={handleChange}
          />

          <Box sx={{ mt: 2 }}>
            <Button variant="contained" component="label" startIcon={<AttachFileIcon />} >
              Upload Documents
              <input type="file" hidden multiple onChange={handleFileUpload} />
            </Button>

            <List dense>
              {docs.map((file, i) => (
                <ListItem key={i}>
                  <ListItemText primary={file.name} />
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
            value={company.deadline}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            margin="dense"
            name="eligible_branch"
            label="Eligible Branches (comma-separated)"
            type="text"
            fullWidth
            variant="outlined"
            value={
              company.eligible_branch && company.eligible_branch.join(", ")
            }
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="tenth_percentage"
            label="10th Percentage Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={company.tenth_percentage}
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="twelfth_percentage"
            label="12th Percentage Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={company.twelfth_percentage}
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="diploma_cgpa"
            label="Diploma CGPA Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={company.diploma_cgpa}
            onChange={handleChange}
          />

          <TextField
            margin="dense"
            name="ug_cgpa"
            label="UG CGPA Requirement"
            type="number"
            fullWidth
            variant="outlined"
            value={company.ug_cgpa}
            onChange={handleChange}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={closePopup}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {submitting? 'Loading...' : editing ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ManageCompanies;