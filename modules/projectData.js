const projectData = require("../data/projectData.json");
const sectorData = require("../data/sectorData.json");

let projects = [];

function initialize() {
    projects = []; 
    projectData.forEach(p => {
        const sector = sectorData.find(s => s.id === p.sector_id)?.sector_name || "Unknown";
        projects.push({ ...p, sector });
    });
}

function getAllProjects() {
    return projects;
}

function getProjectById(projectId) {
    return projects.find(p => p.id === projectId);
}

function getProjectsBySector(sector) {
    const search = sector.toLowerCase();
    return projects.filter(p => p.sector.toLowerCase().includes(search));
}

module.exports = { 
  initialize, 
  getAllProjects, 
  getProjectById, 
  getProjectsBySector 
};


