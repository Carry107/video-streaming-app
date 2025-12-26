import express from "express"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"
import multer from "multer"
import path from "path"
const app = express()
const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, "./uploads")
    },
    filename: function(req, file, cb){
        cb(null, file.fieldname + "-" + uuidv4() + path.extname(file.originalname))
    }
})
// multer configuration
const upload =  multer({storage: storage})
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use("./uploads", express.static("uploads"))
const PORT = 4000
app.use(cors({
    origin: ["http://localhost:3000"]
}))
app.use((req, res, next)=>{
    res.header("Access Control allow origin")
    next()
})
app.get("/",(req, res) =>{
    res.status(200).json({
        message: "server is on working mode"
    })
})
 
app.post("/upload", upload.single("file"), (req, res)=>{
    console.log("file uploaded");
    
})


app.listen(PORT,()=>{
    console.log("server is listening on port", `${PORT}`);
    
})