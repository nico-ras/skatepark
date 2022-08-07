const { Pool } = require("pg")
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    password: "caracoles",
    database: "skatepark",
    port: 5432,
})

async function nuevoUsuario(email, nombre, password, experiencia, especialidad, foto) {

    try {
        const result = await pool.query(
            `INSERT INTO skaters (email, nombre, password_, anos_experiencia, especialidad, foto, estado) VALUES ('${email}', '${nombre}', '${password}', ${experiencia}, '${especialidad}', '${foto}', false) RETURNING *;`
        )
    
        const usuario = result.rows[0]
        return usuario
    } catch (e) {
        console.log(e)
    }
    
}

async function getUsuarios() {
    try {
        const result = await pool.query(
            "SELECT * FROM skaters;"
        )
        console.log(result.rows)
        const usuarios = result.rows
        return usuarios
    } catch (e) {
        console.log(e)
    }
}

async function setSkaterStatus(id, auth){
    try{
        const result = await pool.query(
            `UPDATE skaters SET estado=${auth} WHERE id=${id} RETURNING *`)
            const skater = result.rows[0]
            return skater
    } catch(e) {
        console.log(e)
    }
}

async function getUsuario(email, password) {
    try {
        const result = await pool.query(
            `SELECT * FROM skaters WHERE email='${email}' AND password_='${password}'`
        )
        const usuario = result.rows[0]
        return usuario
    } catch (e) {
        console.log(e)
    }
    
}

async function editUser(email, nombre, password_, anos_experiencia, especialidad) {
    try {
        const result = await pool.query(
            `UPDATE skaters SET email='${email}', nombre='${nombre}', password_='${password_}', anos_experiencia=${anos_experiencia}, especialidad='${especialidad}'  WHERE email='${email}' RETURNING *`
        )
        const usuario = result.rows[0]
        return usuario
    } catch (e) {
        console.log(e)
    }
    
}

async function deleteSkater(email) {
    try {
        const result = await pool.query(
            `DELETE FROM skaters WHERE email='${email}' RETURNING *`
        )
        const deletedSkater = result.rows[0]
        
        return deletedSkater
    } catch (e) {
        console.log(e)
    }
    
}

module.exports = { nuevoUsuario, getUsuarios, setSkaterStatus, getUsuario, editUser, deleteSkater }