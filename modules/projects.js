require("dotenv").config();
const { Sequelize, DataTypes } = require("sequelize");

// Initialize connection (Neon requires SSL)
const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
    host: process.env.PGHOST,
    dialect: "postgres",
    port: process.env.PGPORT,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
});

// Models
const Sector = sequelize.define("Sector", {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    sector_name: DataTypes.STRING
}, { timestamps: false });

const Project = sequelize.define("Project", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    name: DataTypes.STRING,
    description: DataTypes.TEXT,
    sector_id: DataTypes.INTEGER,
    budget: DataTypes.FLOAT
}, { timestamps: false });

// Relationship
Project.belongsTo(Sector, { foreignKey: "sector_id" });


// INIT FUNCTION
async function initialize() {
    try {
        await sequelize.authenticate();
        console.log("Connected to Neon PostgreSQL 👍");

        await sequelize.sync();

        // Insert sectors if not present
        const sectorCount = await Sector.count();
        if (sectorCount === 0) {
            await Sector.bulkCreate([
                { id: 1, sector_name: "Technology" },
                { id: 2, sector_name: "Finance" },
                { id: 3, sector_name: "Healthcare" },
                { id: 4, sector_name: "Education" }
            ]);
            console.log("Inserted default sector data.");
        }

    } catch (err) {
        console.error("Unable to initialize database:", err);
        throw err;
    }
}

// GET ALL PROJECTS
function getAllProjects() {
    return Project.findAll({ include: Sector })
        .then(data => data)
}

// GET PROJECT BY ID
function getProjectById(id) {
    return Project.findOne({
        where: { id },
        include: Sector
    }).then(proj => {
        if (!proj) throw "Project not found";
        return proj;
    });
}

// FILTER PROJECTS BY SECTOR NAME
function getProjectsBySector(sectorName) {
    return Project.findAll({
        include: { model: Sector, where: { sector_name: { [Sequelize.Op.iLike]: `%${sectorName}%` } } }
    }).then(list => {
        if (list.length === 0) throw "No projects found";
        return list;
    });
}

// ADD PROJECT
function addProject(projectData) {
    return Project.create(projectData);
}

// UPDATE PROJECT
function updateProject(id, projectData) {
    return Project.update(projectData, { where: { id } });
}

// DELETE PROJECT
function deleteProject(id) {
    return Project.destroy({ where: { id } });
}

module.exports = {
    initialize,
    getAllProjects,
    getProjectById,
    getProjectsBySector,
    addProject,
    updateProject,
    deleteProject
};
