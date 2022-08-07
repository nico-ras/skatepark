const express = require("express");
const app = express();
const exphbs = require("express-handlebars");
const expressFileUpload = require("express-fileupload");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const fs = require('fs')
const secretKey = "callao";
const {
  nuevoUsuario,
  getUsuarios,
  setSkaterStatus,
  getUsuario, editUser, deleteSkater
} = require("./consultas.js");
const res = require("express/lib/response");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(
  expressFileUpload({
    limits: 5000000,
    abortOnLimit: true,
    responseOnLimit: "El archivo es mas grande de lo permitido",
  })
);

app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));
app.engine(
  "handlebars",
  exphbs.engine({
    defaultLayout: "main",
    layoutsDir: `${__dirname}/views/mainLayout`,
  })
);
app.set("view engine", "handlebars");

app.listen(3000, () => {
  console.log("Server on");
});

app.get("/", async (req, res) => {
    try {
        const skaters = await getUsuarios()  
        res.render("index", { skaters });
    } catch (e) {
        res.status(500).send({
            error: `Algo salio mal: ${e}`,
            code: 500,
        })    
    }
  
});

app.get("/admin", async (req, res) => {
  try {
    const skaters = await getUsuarios();
    res.render("Admin", { skaters });
  } catch (e) {
    res.status(500).send({
      error: `Algo salio mal: ${e}`,
      code: 500,
    });
  }
});

app.get("/datos", (req, res) => {
  const { token } = req.query;
  
  jwt.verify(token, secretKey, (err, decoded) => {
    const { data } = decoded;
    const { email, nombre, password_, anos_experiencia, especialidad } = data;
    
    err
      ? res.status(401).send(
          res.send({
            error: "401 no registrado",
            message: "Usuario no registrado",
            token_error: err.message,
          })
        )
      : res.render("Datos", {
          email,
          nombre,
          password_,
          anos_experiencia,
          especialidad,
        });
  });
});

app.get("/login", (req, res) => {
  res.render("Login");
});

app.get("/registro", (req, res) => {
  res.render("Registro");
});

app.post("/registro", async (req, res) => {
  const { foto } = req.files;
  const { email, nombre, password, experiencia, especialidad } = req.body;

  try {
    const nombreFoto = `imagen-${nombre}-${email}.jpg`;
    const respuesta = await nuevoUsuario(
      email,
      nombre,
      password,
      experiencia,
      especialidad,
      nombreFoto
    );
    res.redirect("/");

    if (respuesta) {
      foto.mv(`${__dirname}/public/imgs/${nombreFoto}`, (err) => {
        console.log(err);
      });
    }
  } catch (e) {
    res.status(500).send({
      error: `Algo salio mal: ${e}`,
      code: 500,
    });
  }
});

app.put("/registro", async (req, res) => {
  const { id, auth } = req.body;
  try {
    const skater = await setSkaterStatus(id, auth);
    res.status(200).send(skater);
  } catch (e) {
    res.status(500).send({
      error: `Algo salio mal: ${e}`,
      code: 500,
    });
  }
});

app.post("/verify", async (req, res) => {
  const { email, password } = req.body;
  const user = await getUsuario(email, password);
  
  if (user) {
    const token = jwt.sign(
      {
        exp: Math.floor(Date.now() / 1000) + 100,
        data: user,
      },
      secretKey
    );
    res.send(token);
  } else {
    res.status(404).send({
      error: "Este usuario no existe",
      code: 404,
    });
  }
});

app.put("/editUser", async (req, res) => {
    const {
          email, 
          nombre, 
          password, 
          experiencia, 
          especialidad, 
      } = req.body;
      

         try {
            const user = await editUser(
              email,
              nombre, 
              password, 
              experiencia, 
              especialidad
            );
            res.send(user)
            
          } catch (err) {
            res.status(500).send({
              error: `Algo salio mal: ${err}`,
              code: 500,
            });
          }
})

app.delete("/deleteUser", async (req, res) => {
    const { email } = req.body
    
    try {
        
        const result = await deleteSkater(email)
        const imgName = result.foto
        console.log(imgName)
        res.send(result)
        if (result){
          fs.unlink(`${__dirname}/public/imgs/${imgName}`, (err) => {
            console.log(err)
      })
      
        }
        
        
    } catch (err) {
        res.sendStatus(500).send({
            error: `Algo salio mal: ${err}`,
            code: 500,
    })
   }
})
