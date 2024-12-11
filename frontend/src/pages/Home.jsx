import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, CardActions, Button, Grid, Box, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Chip, Divider} from "@mui/material";
import { styled } from '@mui/material/styles';
import { toast } from "react-toastify";
import { PictureAsPdf as PictureAsPdfIcon, Description as DescriptionIcon, InsertDriveFile as InsertDriveFileIcon, Close as CloseIcon, Work as WorkIcon, LocationOn as LocationOnIcon, School as SchoolIcon} from "@mui/icons-material";
import moment from "moment";

// Custom Styled Components
const CompanyCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow: theme.shadows[10]
  }
}));

const CompanyHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(1)
}));

const EligibilityChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
  fontWeight: 'bold'
}));

function Home() {
  const [companies, setCompanies] = useState();
  const [expanded, setExpanded] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [popup, setPopup] = useState(false);
  const [file, setFile] = useState(null);
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
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }
    setLoading(false);
  };

  const handleExpand = (idx) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
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

  const openPopup = () => {
    setPopup(true);
    setFile(null);
  };

  const closePopup = () => {
    setPopup(false);
    setFile(null);
  };

  const handleApply = (company) => {
    setSelectedCompany(company);
    openPopup();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) {
      toast.error("Upload a file");
      return;
    }

    if (!file.type.match("application/pdf")) {
      toast.error("Please upload a PDF file only");
      e.target.value = null;
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Please select a PDF file of less than 2MB");
      e.target.value = null;
      return;
    }

    setFile(file);
  };

  const applyToCompany = async () => {
    if (!file) {
      toast.error("Please upload your resume.");
      return;
    }

    const formData = new FormData();
    formData.append("company_name", selectedCompany.company_name);
    formData.append("role", selectedCompany.role);
    formData.append("resume", file);

    setSubmitting(true);

    try {
      const response = await fetch(`${backendUrl}/company/apply`, {
        method: "POST",
        headers: {
          "auth-token": `${sessionStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        closePopup();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Server Error");
    }

    setSubmitting(false);
  };

  return loading ? (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Typography variant="h4" color="primary">Fetching Companies...</Typography>
    </Box>
  ) : (
    <Box sx={{ 
      flexGrow: 1, 
      overflow: "auto", 
      height: "calc(100vh - 64px)", 
      backgroundColor: '#f4f4f4',
      padding: 2 
    }}>
      <Grid container spacing={3}>
        {companies?.map((company, index) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            {/* <Card sx={{ minWidth: 275, height: "100%" }}> */}
            <CompanyCard elevation={4}>
              <CardContent>
              <CompanyHeader variant="h5" gutterBottom>
                  <WorkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  {company.company_name}
                </CompanyHeader>

                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2, fontStyle: 'italic' }}>
                  {company.role}
                </Typography>

                <Divider sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                  <EligibilityChip 
                    icon={<SchoolIcon />} 
                    label={`Branches: ${company.eligible_branch.join(" / ")}`} 
                    color="primary" 
                    variant="outlined" 
                  />
                  <EligibilityChip 
                    icon={<LocationOnIcon />} 
                    label={`Location: ${company.location.join(" / ")}`} 
                    color="secondary" 
                    variant="outlined" 
                  />
                </Box>
                

                <Typography sx={{ mb: 1 }} color="text.primary">
                  <strong>CTC:</strong> ₹{Number(company.ctc).toLocaleString("en-IN")}
                </Typography>

                <Typography sx={{ mb: 1 }} color="text.primary">
                  <strong>Application Deadline:</strong>{" "}
                  {moment(company.deadline).format("hh:mm A DD-MM-YYYY")}
                </Typography>

                <Divider sx={{ my: 2 }} />


                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Academic Eligibility:
                </Typography>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  <EligibilityChip 
                    label={`10th: ${company.tenth_percentage}%`} 
                    // color="info" 
                    color="primary" 
                    variant="outlined"
                    size="small" 
                  />
                  <EligibilityChip 
                    label={`12th: ${company.twelfth_percentage}%`} 
                    color="info" 
                    variant="outlined"
                    size="small" 
                  />
                  <EligibilityChip 
                    label={`Diploma CGPA: ${company.diploma_cgpa}`} 
                    color="info" 
                    variant="outlined"
                    size="small" 
                  />
                  <EligibilityChip 
                    label={`UG CGPA: ${company.ug_cgpa}`} 
                    color="info" 
                    // variant="outlined"
                    size="small" 
                  />
                </Box>

                <Collapse in={expanded[index] || false}>
                  {company.description && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Description:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {company.description}
                      </Typography>
                    </Box>
                  )}

                  {company.docs_attached && company.docs_attached.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Attached Documents:
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {company.docs_attached.map((fileUrl, i) => {
                          const fileName = fileUrl.split("/").pop();
                          const fileExtension = fileName.split(".").pop().toLowerCase();
                          return (
                            <Box key={i} sx={{ display: "flex", alignItems: "center" }}>
                              {getFileIcon(fileExtension)}
                              <Typography
                                component="a"
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  ml: 1,
                                  color: "primary.main",
                                  textDecoration: "none",
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                {fileName}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}
                </Collapse>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
              <Button 
                  size="small" 
                  variant="outlined" 
                  color="primary" 
                  onClick={() => handleExpand(index)}
                >
                  {expanded[index] ? "View Less" : "View More"}
                </Button>

                <Button 
                  size="small" 
                  variant="contained" 
                  color="primary" 
                  onClick={() => handleApply(company)}
                  disabled={submitting}
                >
                  Apply
                </Button>
              </CardActions>
            </CompanyCard>
          </Grid>
        ))}
      </Grid>

      <Dialog open={popup} onClose={closePopup} maxWidth="xs" fullWidth>
        <DialogTitle>
          Upload Resume
          <IconButton
            onClick={closePopup}
            style={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
            Select a <strong>PDF file</strong> (max 2MB) to upload:
          </Typography>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ 
              marginTop: "10px", 
              padding: "10px", 
              border: "1px dashed #1976d2", 
              borderRadius: "4px" 
            }}
          />
        </DialogContent>

        <DialogActions>
          <Button 
            onClick={applyToCompany} 
            variant="contained" 
            color="primary"
            startIcon={<PictureAsPdfIcon />}
          >
            {submitting ? 'Applying...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;