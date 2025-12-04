require('dotenv').config();
const { Sequelize, DataTypes, Op } = require('sequelize');

// Create Sequelize instance
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: 'postgres',
    logging: false,
});

// Define models
const Sector = sequelize.define('Sector', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    sector_name: DataTypes.STRING
}, { timestamps: false });

const Project = sequelize.define('Project', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    feature_img_url: DataTypes.STRING,
    summary_short: DataTypes.TEXT,
    intro_short: DataTypes.TEXT,
    impact: DataTypes.TEXT,
    original_source_url: DataTypes.STRING,
    sector_id: DataTypes.INTEGER
}, { timestamps: false });

// Association
Project.belongsTo(Sector, { foreignKey: 'sector_id' });

// Initialize DB
function initialize() {
    return sequelize.sync();
}

// CRUD functions
function getAllProjects() {
    return Project.findAll({ include: [Sector] });
}

function getProjectById(projectId) {
    return Project.findAll({ where: { id: projectId }, include: [Sector] })
        .then(results => results[0] || Promise.reject("Project not found"));
}

function getProjectsBySector(sector) {
    return Project.findAll({ 
        include: [Sector],
        where: { '$Sector.sector_name$': { [Op.iLike]: `%${sector}%` } } 
    }).then(results => results.length ? results : Promise.reject(`No projects found for sector: ${sector}`));
}

function addProject(projectData) {
    return Project.create(projectData);
}

function editProject(id, projectData) {
    return Project.update(projectData, { where: { id } })
        .then(([rowsUpdated]) => rowsUpdated ? Promise.resolve() : Promise.reject("Update failed"));
}

function deleteProject(id) {
    return Project.destroy({ where: { id } })
        .then(deleted => deleted ? Promise.resolve() : Promise.reject("Delete failed"));
}

function getAllSectors() {
    return Sector.findAll();
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector, addProject, editProject, deleteProject, getAllSectors };
