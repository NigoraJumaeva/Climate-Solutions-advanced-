const express = require("express");
require("dotenv").config();
const projectData = require("./modules/projects");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));

let ready = false;

// Initialize DB
projectData.initialize()
    .then(() => {
        console.log("Database initialized.");
        ready = true;
    })
    .catch(err => console.error(err));

// Block until DB ready
app.use((req, res, next) => {
    if (!ready) {
        return res.status(503).render("404", {
            message: "Server warming up — please try again."
        });
    }
    next();
});

// ROUTES
app.get("/", (req, res) => res.render("home"));

app.get("/about", (req, res) => res.render("about"));

// List Projects
app.get("/solutions/projects", async (req, res) => {
    try {
        const sector = req.query.sector;
        const projects = sector
            ? await projectData.getProjectsBySector(sector)
            : await projectData.getAllProjects();
        res.render("projects", { projects });
    } catch (err) {
        res.status(404).render("404", { message: err });
    }
});

// Project Details
app.get("/solutions/projects/:id", async (req, res) => {
    try {
        const project = await projectData.getProjectById(req.params.id);
        res.render("project", { project });
    } catch (err) {
        res.status(404).render("404", { message: err });
    }
});

// Add Project Form
app.get("/projects/add", (req, res) => {
    res.render("addProject");
});

// Add Project POST
app.post("/projects/add", async (req, res) => {
    try {
        await projectData.addProject(req.body);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).send(err);
    }
});

// Delete Project
app.get("/projects/delete/:id", async (req, res) => {
    try {
        await projectData.deleteProject(req.params.id);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).send(err);
    }
});

app.use((req, res) => {
    res.status(404).render("404", { message: "Not found." });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
