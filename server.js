/********************************************************************************
* WEB322 – Assignment 02
* Name: Nigora Jumaeva   Student ID: 101498244   Date: November 7, 2025
********************************************************************************/
const express = require("express");
const projectData = require("./modules/projects")(process.cwd());
const path = require("path");
const app = express();
require('dotenv').config();
const clientSessions = require('client-sessions');
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const Sequelize = require('sequelize');

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
app.use(clientSessions({
    cookieName: 'session',
    secret: process.env.SESSIONSECRET,
    duration: 30 * 60 * 1000, // 30 mins
    activeDuration: 5 * 60 * 1000
}));


app.use((req, res, next) => {
    res.locals.session = req.session;
    next();
});


function ensureLogin(req, res, next) {
    if (!req.session.user) return res.redirect('/login');
    next();
}


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

// Add Project
app.get('/solutions/addProject', ensureLogin, async (req, res) => {
    const sectors = await projectData.getAllSectors();
    res.render('addProject', { sectors });
});

app.post('/solutions/addProject', ensureLogin, async (req, res) => {
    try {
        await projectData.addProject(req.body);
        res.redirect('/solutions/projects');
    } catch (err) {
        res.render('500', { message: `Error: ${err}` });
    }
});

// Edit Project
app.get('/solutions/editProject/:id', ensureLogin, async (req, res) => {
    try {
        const project = await projectData.getProjectById(req.params.id);
        const sectors = await projectData.getAllSectors();
        res.render('editProject', { project, sectors });
    } catch (err) {
        res.status(404).render('404', { message: err });
    }
});

app.post('/solutions/editProject', ensureLogin, async (req, res) => {
    try {
        await projectData.editProject(req.body.id, req.body);
        res.redirect('/solutions/projects');
    } catch (err) {
        res.render('500', { message: `Error: ${err}` });
    }
});

// Delete Project
app.get('/solutions/deleteProject/:id', ensureLogin, async (req, res) => {
    try {
        await projectData.deleteProject(req.params.id);
        res.redirect('/solutions/projects');
    } catch (err) {
        res.render('500', { message: `Error: ${err}` });
    }
});

app.get('/login', (req, res) => res.render('login', { errorMessage: '', userName: '' }));

app.post('/login', (req, res) => {
    const { userName, password } = req.body;
    if (userName === process.env.ADMINUSER && password === process.env.ADMINPASSWORD) {
        req.session.user = { userName };
        res.redirect('/solutions/projects');
    } else {
        res.render('login', { errorMessage: 'Invalid User Name or Password', userName });
    }
});

app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect('/');
});

module.exports = app;
