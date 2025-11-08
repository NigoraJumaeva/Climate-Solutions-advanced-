const projectData = require("../data/projectData.json");
const sectorData = require("../data/sectorData.json");

let projects = [];

function initialize() {
    return new Promise((resolve, reject) => {
        try {
            projects = [];
            projectData.forEach(p => {
                const sector = sectorData.find(s => s.id === p.sector_id)?.sector_name || "Unknown";
                projects.push({ ...p, sector });
            });
            resolve();
        } catch (err) {
            reject("Unable to initialize project data: " + err);
        }
    });
}

function getAllProjects() {
    return new Promise((resolve, reject) => {
        if (projects.length === 0) reject("No projects available");
        else resolve(projects);
    });
}

function getProjectById(projectId) {
    return new Promise((resolve, reject) => {
        const project = projects.find(p => p.id === projectId);
        project ? resolve(project) : reject("Project not found");
    });
}

function getProjectsBySector(sector) {
    return new Promise((resolve, reject) => {
        const search = sector.toLowerCase();
        const filtered = projects.filter(p => p.sector.toLowerCase().includes(search));
        filtered.length === 0 ? reject(`No projects found for sector: ${sector}`) : resolve(filtered);
    });
}

module.exports = { 
    initialize, 
    getAllProjects, 
    getProjectById, 
    getProjectsBySector 
};
