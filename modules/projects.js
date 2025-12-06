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
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: DataTypes.STRING,
    feature_img_url: DataTypes.STRING,
    summary_short: DataTypes.TEXT,
    intro_short: DataTypes.TEXT,
    impact: DataTypes.TEXT,
    original_source_url: DataTypes.STRING
}, { timestamps: false, freezeTableName: true });

// Relationship
Project.belongsTo(Sector, { foreignKey: "sector_id" });


// INIT FUNCTION
async function initialize() {
    try {
        await sequelize.sync();
        console.log("Database synced successfully");
        return Promise.resolve();
      } catch (err) {
        console.error("Unable to initialize database:", err);
        return Promise.reject(err);
    }
}

// GET ALL PROJECTS
function getAllProjects() {
    return Project.findAll({ include: [Sector] })
        .then(data => {
            if (!data || data.length === 0) throw "No projects found";
            return data;
        });
}

// GET PROJECT BY ID
function getProjectById(projectId) {
    return Project.findAll({
        where: { id: projectId },
        include: [Sector]
    }).then(results => {
        if (!results || results.length === 0) throw "Unable to find requested project";
        return results[0]; // return a single project object
    });
}

// FILTER PROJECTS BY SECTOR NAME
function getProjectsBySector(sector) {
    return Project.findAll({
        include: [Sector],
        where: {
            '$Sector.sector_name$': {
                [Sequelize.Op.iLike]: `%${sector}%`
            }
        }
    }).then(list => {
        if (!list || list.length === 0) throw "Unable to find requested projects";
        return list;
    });
}
// GET ALL SECTORS
function getAllSectors() {
    return Sector.findAll()
        .then(sectors => sectors)
        .catch(err => { throw err; });
}

// ADD PROJECT
function addProject(projectData) {
    return Project.create(projectData);
}

// UPDATE PROJECT
function updateProject(id, projectData) {
    return Project.update(projectData, { where: { id } });
}
// EDIT PROJECT
function editProject(id, projectData) {
    return Project.update(projectData, { where: { id } })
        .then(result => {
            // result[0] is the number of rows updated
            if (result[0] === 0) {
                return Promise.reject("Project not found or no changes made");
            }
        })
        .catch(err => {
            // Provide human-readable error message
            if (err.errors && err.errors.length > 0) {
                return Promise.reject(err.errors[0].message);
            } else {
                return Promise.reject(err.message || err);
            }
        });
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
    getAllSectors,
    addProject,
    updateProject,
    editProject,  
    deleteProject
};
// if (require.main === module) {
//   // run as script
//   (async () => {
//     try {
//       const projectData = require('../data/projectData.json');
//       const sectorData = require('../data/sectorData.json');

//       await sequelize.sync();

//       try {
//         await Sector.bulkCreate(sectorData);
//       } catch (e) {
//         console.log("Warning inserting sectors:", e.message || e);
//       }

//       try {
//         await Project.bulkCreate(projectData);
//       } catch (e) {
//         console.log("Warning inserting projects:", e.message || e);
//       }

//       // Fix sequences so SERIAL values continue correctly
//       try {
//         await sequelize.query(`SELECT setval(pg_get_serial_sequence('"Sectors"', 'id'), (SELECT MAX(id) FROM "Sectors"))`);
//         await sequelize.query(`SELECT setval(pg_get_serial_sequence('"Projects"', 'id'), (SELECT MAX(id) FROM "Projects"))`);
//       } catch (e) {
//         console.log("Warning fixing sequences:", e.message || e);
//       }

//       console.log("data inserted successfully");
//       process.exit(0);
//     } catch (err) {
//       console.error("Unable to connect / insert data:", err);
//       process.exit(1);
//     }
//   })();
// }