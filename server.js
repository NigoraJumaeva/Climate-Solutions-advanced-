/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Nigora Jumaeva Student ID:101498244 Date: November 7, 2025
*
* Published URL: 
*
********************************************************************************/
const express = require("express");
const path = require("path");
const projectData = require("./modules/projectData"); 
const app = express();
require('pg'); // explicitly require the "pg" module
const Sequelize = require('sequelize');
const PORT = process.env.PORT || 3000;

projectData.initialize();

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/about', (req, res) => {
    res.render("about");
});

app.get("/solutions/projects/:id", (req, res) => {
  try {
    const project = projectData.getProjectById(parseInt(req.params.id));
    if (!project) throw "Project Not Found";
    res.render("project", { project });
  } catch (err) {
    res.status(404).render("404", { message: err });
  }
});

app.get("/solutions/projects", (req, res) => {
  let sector = req.query.sector;

  if (sector) {
    const projects = projectData.getProjectsBySector(sector);
    if (!projects || projects.length === 0) {
      return res.status(404).render("404", { message: `No projects found for sector: ${sector}` });
    }
    return res.render("projects", { projects });
  }

  const allProjects = projectData.getAllProjects();
  res.render("projects", { projects: allProjects });
});

app.use((req, res) => {
  res.status(404).render("404", { message: "Page Not Found" });
});


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
