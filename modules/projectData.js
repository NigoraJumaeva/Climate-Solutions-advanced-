// modules/projectData.js

const fs = require("fs").promises;
const path = require("path");

let projects = [];

async function initialize() {
    try {
        const dataPath = path.join(__dirname, "../data/projects.json"); // or projectData.json
        const jsonData = await fs.readFile(dataPath, "utf8");
        projects = JSON.parse(jsonData);
    } catch (err) {
        return Promise.reject("Unable to read projects data: " + err);
    }
}

function getAllProjects() {
    return projects;
}

function getProjectById(id) {
    const project = projects.find(p => p.id === id);
    if (!project) throw new Error(`Project ${id} not found`);
    return project;
}

function getProjectsBySector(sector) {
    return projects.filter(p => p.sector === sector);
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector
};
