import express from "express"
import cors from "cors"
import { v4 as uuidv4 } from "uuid"
import multer from "multer"
import path from "path"
import fs from "fs"
import { exec } from "child_process"

const app = express()
const PORT = 4000

// Ensure base directories
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}
if (!fs.existsSync("uploads/courses")) {
    fs.mkdirSync("uploads/courses")
}

// Multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads"),
    filename: (req, file, cb) =>
        cb(null, `${file.fieldname}-${uuidv4()}${path.extname(file.originalname)}`)
})

const upload = multer({ storage })

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use("/uploads", express.static("uploads"))
app.use(express.static("public"))

app.use(cors({
    origin: ["http://localhost:3000"]
}))

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file received" })
    }
const ffmpegPath = `"C:/ffmpeg/bin/ffmpeg.exe"`

    const lessonId = uuidv4()
    const videoPath = req.file.path
    const outputPath = `uploads/courses/${lessonId}`
    const hlsPath = `${outputPath}/index.m3u8`

    fs.mkdirSync(outputPath, { recursive: true })

 const ffmpegCommand =
  `${ffmpegPath} -i "${videoPath}" ` +
  `-codec:v libx264 -codec:a aac ` +
  `-hls_time 10 -hls_playlist_type vod ` +
  `-hls_segment_filename "${outputPath}/segment%03d.ts" ` +
  `-start_number 0 "${hlsPath}"`



    exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
            console.error("FFmpeg error:", error)
            console.error(stderr)
            return res.status(500).json({
                message: "Video processing failed"
            })
        }

        const videoUrl =
            `http://localhost:4000/uploads/courses/${lessonId}/index.m3u8`

        res.status(201).json({
            message: "Video is now available for streaming",
            videoUrl
        })
    })
})

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
