import React, { useEffect, useState } from "react";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Grid,
  Box,
  Collapse,
  Modal,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import CloseIcon from "@mui/icons-material/Close";

function HomePage() {
  const [expanded, setExpanded] = useState({});
  const [companyData, setCompanyData] = useState();
  const [openModal, setOpenModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [file, setFile] = useState(null);
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${backendUrl}/company/all`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();
        if (response.ok) {
          setCompanyData(data.companies);
          console.log(data.companies);
        } else {
          alert(data.message);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchCompanies();
  }, [backendUrl]);

  const handleExpandClick = (index) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const dateFormat = (date) => {
    const deadlineDate = new Date(date);

    const day = String(deadlineDate.getDate()).padStart(2, "0");
    const month = String(deadlineDate.getMonth() + 1).padStart(2, "0");
    const year = deadlineDate.getFullYear();

    let hours = deadlineDate.getHours();
    const minutes = String(deadlineDate.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;

    const formattedDeadline = `${hours}:${minutes} ${ampm} (${day}-${month}-${year})`;
    return formattedDeadline;
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

  const handleApplyClick = (company) => {
    setSelectedCompany(company);
    setOpenModal(true);
  };

  const handleFileChange = (event) => {
    const uploadedFile = event.target.files[0];
    if (
      uploadedFile &&
      uploadedFile.type === "application/pdf" &&
      uploadedFile.size <= 2 * 1024 * 1024
    ) {
      setFile(uploadedFile);
    } else {
      alert("Please upload a PDF file of up to 2MB.");
      event.target.value = null;
    }
  };

  const applyToCompany = async () => {
    if (!file) {
      alert("Please upload your resume.");
      return;
    }

    const formData = new FormData();
    formData.append("company_name", selectedCompany.company_name);
    formData.append("role", selectedCompany.role);
    formData.append("resume", file);

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
        alert(data.message);
        console.log(data);
        setOpenModal(false);
        setFile(null);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Box sx={{ flexGrow: 1, overflow: "auto", height: "calc(100vh - 64px)" }}>
      <Grid container spacing={3}>
        {companyData?.map((company, index) => (
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
                  Deadline: {dateFormat(company.deadline)}
                </Typography>
                Academic Eligiblity:
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  10th: {company.tenth_percentage}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  12th: {company.twelfth_percentage} or Diploma CGPA:{" "}
                  {company.diploma_cgpa}
                </Typography>
                <Typography sx={{ mb: 1.5 }} color="text.secondary">
                  UG CGPA: {company.ug_cgpa}
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
                          Docs Attached:
                        </Typography>
                        <ul style={{ paddingLeft: "1rem" }}>
                          {company.docs_attached.map((fileUrl, i) => {
                            const fileName = fileUrl.split("/").pop();
                            const fileExtension = fileName
                              .split(".")
                              .pop()
                              .toLowerCase();

                            return (
                              <li
                                key={i}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
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
                <Button size="small" onClick={() => handleExpandClick(index)}>
                  {expanded[index] ? "View Less" : "View More"}
                </Button>
                <Button size="small" onClick={() => handleApplyClick(company)}>
                  Apply
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle>
          Upload Resume
          <IconButton
            onClick={() => setOpenModal(false)}
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
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default HomePage;