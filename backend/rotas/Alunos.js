const express = require("express")
const router = express.Router()
const db = require("../Banco-Dados")

// listar alunos
router.get("/", (req,res)=>{
 db.query("SELECT * FROM alunos",(err,result)=>{
  if(err){
   res.send(err)
  }else{
   res.json(result)
  }
 })
})

// cadastrar aluno
router.post("/", (req,res)=>{
 const {nome, idade, turma} = req.body

 const sql = "INSERT INTO alunos (nome, idade, turma) VALUES (?,?,?)"

 db.query(sql,[nome,idade,turma],(err,result)=>{
  if(err){
   res.send(err)
  }else{
   res.send("Aluno cadastrado")
  }
 })
})

module.exports = router