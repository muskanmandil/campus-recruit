import React, { useEffect, useState } from "react";
import { Typography, Card, CardContent, CardActions, Button, Grid, Box, Collapse, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { toast } from "react-toastify";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";

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
    <>Fetching Companies...</>
  ) : (
    <Box sx={{ flexGrow: 1, overflow: "auto", height: "calc(100vh - 64px)" }}>
      <Grid container spacing={3}>
        {companies?.map((company, index) => (
          <Grid item xs={12} key={index}>
            <Card sx={{ minWidth: 275, height: "100%" }}>
              <CardContent>
                <Typography variant="h5" component="div">
                  {company.company_name}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  {company.role}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Eligible Branches: {company.eligible_branch.join(" / ")}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  CTC: ₹{Number(company.ctc).toLocaleString("en-IN")}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Location: {company.location.join(" / ")}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  Deadline:{" "}
                  {moment(company.deadline).format("hh:mm A DD-MM-YYYY")}
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Academic Eligiblity:
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  • 10th: {company.tenth_percentage}%
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  • 12th: {company.twelfth_percentage}% or Diploma CGPA:{" "}
                  {company.diploma_cgpa}
                </Typography>

                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  • UG CGPA: {company.ug_cgpa}
                </Typography>

                <Collapse in={expanded[index] || false}>
                  {company.description && (
                    <div style={{ marginTop: "1rem" }}>
                      <Typography variant="subtitle1">Description:</Typography>
                      <Typography variant="body2">
                        {company.description}
                      </Typography>
                    </div>
                  )}

                  {company.docs_attached &&
                    company.docs_attached.length > 0 && (
                      <div style={{ marginTop: "1rem" }}>
                        <Typography variant="subtitle1">
                          Attached Documents:
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
                </Collapse>
              </CardContent>

              <CardActions>
                <Button size="small" onClick={() => handleExpand(index)}>
                  {expanded[index] ? "View Less" : "View More"}
                </Button>

                <Button size="small" onClick={() => handleApply(company)}>
                  Apply
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={popup} onClose={closePopup}>
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
          <Typography>Select a PDF file (max 2MB) to upload:</Typography>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            style={{ marginTop: "10px" }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={applyToCompany} variant="contained" color="primary">
            {submitting ? 'Applying...' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Home;