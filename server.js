/********************************************************************************
* WEB322 – Assignment 02
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecapolytechnic.ca/about/policies/academic-integrity-policy.html
*
* Name: Nigora Jumaeva  Student ID: 101498244 Date: November 7, 2025
*
* Published URL: 
*
********************************************************************************/
const express = require("express");
const projectData = require("./modules/projectData"); 
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

let dataInitialized = false;
projectData.initialize()
  .then(() => {
    console.log("Project data initialized.");
    dataInitialized = true;
  })
  .catch(err => console.error("Failed to initialize project data:", err));


app.use((req, res, next) => {
    if (!dataInitialized) {
        return res.status(503).render("404", { message: "Server is starting, please try again shortly." });
    }
    next();
});


app.get('/', (req, res) => {
    res.render("home");
});


app.get('/about', (req, res) => {
    res.render("about");
});


app.get("/solutions/projects/:id", async (req, res) => {
    try {
        const project = await projectData.getProjectById(parseInt(req.params.id));
        res.render("project", { project });
    } catch (err) {
        res.status(404).render("404", { message: String(err) });
    }
});


app.get("/solutions/projects", async (req, res) => {
    const sector = req.query.sector;
    try {
        const projects = sector 
            ? await projectData.getProjectsBySector(sector)
            : await projectData.getAllProjects();
        res.render("projects", { projects });
    } catch (err) {
        res.status(404).render("404", { message: String(err) });
    }
});


app.use((req, res) => {
    res.status(404).render("404", { message: "I am sorry, we are unable to find what you are looking for" });
});

module.exports = app;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});