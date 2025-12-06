/********************************************************************************
* WEB322 – Assignment 03
*
* I declare that this assignment is my own work in accordance with Seneca's
* Academic Integrity Policy:
*
* https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
*
* Name: Nigora Jumaeva Student ID: 101498244 Date: December5, 2025
*
* Published URL: I will send it via email when it is ready, thank you Professor.
*
********************************************************************************/
const express = require("express"); 
require("dotenv").config();
const projectData = require("./modules/projects");
const path = require("path");
const clientSessions = require('client-sessions');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(clientSessions({
  cookieName: 'session',
  secret: process.env.SESSIONSECRET,  // add SESSIONSECRET in .env
  duration: 30 * 60 * 1000,           // 30 minutes
  activeDuration: 5 * 60 * 1000       // extend by 5 minutes on activity
}));

// Make session available in all views
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Helper middleware to protect routes
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
}

// Initialize DB
let ready = false;
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

// ----------------- ROUTES -----------------

// Home & About
app.get("/", (req, res) => res.render("home"));
app.get("/about", (req, res) => res.render("about"));

// Projects
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

app.get("/solutions/projects/:id", async (req, res) => {
    try {
        const project = await projectData.getProjectById(req.params.id);
        res.render("project", { project });
    } catch (err) {
        res.status(404).render("404", { message: err });
    }
});

// ----------------- ADD PROJECT -----------------
app.get("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
        const sectors = await projectData.getAllSectors();
        res.render("addProject", { sectors });
    } catch (err) {
        res.status(500).render("500", { message: err });
    }
});

app.post("/solutions/addProject", ensureLogin, async (req, res) => {
    try {
        await projectData.addProject(req.body);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).render("500", { message: err.errors ? err.errors[0].message : err });
    }
});

// ----------------- EDIT PROJECT -----------------
app.get("/solutions/editProject/:id", ensureLogin, async (req, res) => {
    try {
        const project = await projectData.getProjectById(req.params.id);
        const sectors = await projectData.getAllSectors();
        res.render("editProject", { project, sectors });
    } catch (err) {
        res.status(404).render("404", { message: err });
    }
});

app.post("/solutions/editProject", ensureLogin, async (req, res) => {
    try {
        await projectData.editProject(req.body.id, req.body);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).render("500", { message: err.errors ? err.errors[0].message : err });
    }
});

// ----------------- DELETE PROJECT -----------------
app.get("/solutions/deleteProject/:id", ensureLogin, async (req, res) => {
    try {
        await projectData.deleteProject(req.params.id);
        res.redirect("/solutions/projects");
    } catch (err) {
        res.status(500).render("500", { message: err.errors ? err.errors[0].message : err });
    }
});

// ----------------- LOGIN/LOGOUT -----------------
app.get("/login", (req, res) => {
    res.render("login", { errorMessage: "", userName: "" });
});

app.post("/login", (req, res) => {
    const { userName, password } = req.body;
    if (userName === process.env.ADMINUSER && password === process.env.ADMINPASSWORD) {
        req.session.user = { userName };
        res.redirect("/solutions/projects");
    } else {
        res.render("login", { errorMessage: "Invalid User Name or Password", userName });
    }
});

app.get("/logout", (req, res) => {
    req.session.reset();
    res.redirect("/");
});

// ----------------- 404 -----------------
app.use((req, res) => {
    res.status(404).render("404", { message: "Page not found" });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
module.exports = app;
