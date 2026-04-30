const express = require("express")
const router = express.Router()
const db = require("../../../database/Banco-Dados")

router.post("/", (req,res)=>{
 const {usuario, senha} = req.body

 const sql = "SELECT * FROM usuarios WHERE usuario = ? AND senha = ?"

 db.query(sql,[usuario,senha],(err,result)=>{
  if(err){
   res.send(err)
  }else if(result.length > 0){
   res.json({login:true})
  }else{
   res.json({login:false})
  }
 })
})

module.exports = router