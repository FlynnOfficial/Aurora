const express = require("express")
const router = express.Router()
const db = require("../Banco-Dados")

router.get("/", (req,res)=>{
 db.query("SELECT * FROM professores",(err,result)=>{
  if(err){
   res.send(err)
  }else{
   res.json(result)
  }
 })
})

router.post("/", (req,res)=>{
 const {nome, materia} = req.body

 const sql = "INSERT INTO professores (nome, materia) VALUES (?,?)"

 db.query(sql,[nome,materia],(err,result)=>{
  if(err){
   res.send(err)
  }else{
   res.send("Professor cadastrado")
  }
 })
})

module.exports = router