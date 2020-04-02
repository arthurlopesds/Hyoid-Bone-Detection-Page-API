import express from "express";
// import { exec } from "child_process";
import util from "util";
import fs from "fs";
import bodyParser from 'body-parser';



const app = express()
const porta = 8080
const file = "Image25.mp4"
var caminho = "/home/arthur/Documents/Videos_hioide/"
var cam_darknet = "/home/arthur/Documents/TCC/darknet_AlexeyAB/darknet/"
var cors = require('cors')

const exec = util.promisify(require('child_process').exec);
const fileUpload = require('express-fileupload')
app.use(cors())

app.use(bodyParser.json())

app.use(fileUpload());

app.post ('/uploadFile', (req,res) =>{
    if(req.files === null){
        return res.status(400).json({msg:'No file uploaded'});
    }
    
    const file = req.files.file;

    file.mv(`${caminho}${file.name}`, err =>{
        if(err){
            console.error(err);
            return res.status(500).send(err);
        }
        res.json({fileName: file.name, filePath: `/uploads/${file.name}`});
   
    });
});


app.get("/upload/:filename", async (req,res)=>{
    console.log('começou')

    const {filename} = req.params

    let file = fs.readdirSync(cam_darknet).filter( a => a.includes(filename) )

    file.forEach(async arquivo => {
        await exec(`rm -r ${cam_darknet}${arquivo}`)
     })
    
    await exec(`darknet detector demo ${cam_darknet}obj.data ${cam_darknet}cfg/hioide-yolov3-tiny.cfg ${cam_darknet}backup/hioide-yolov3-tiny_70000.weights ${caminho}${filename} -ext_output > ${cam_darknet}result.txt -out_filename ${cam_darknet}rotuled_${filename} -dont_show`)
    await exec(`ffmpeg -i ${cam_darknet}rotuled_${filename} -vcodec h264 ${cam_darknet}out${filename}`)
    console.log('ta no meio')
    // const {stdout,stderr} = await exec(`python3 ${cam_darknet}main.py`)
    // console.log(stdout)
    console.log('terminou')

    res.sendFile(`${cam_darknet}out${filename}`)


    // const stat = fs.statSync(`${cam_darknet}rotuled_${file}`)
    // const fileSize = stat.size
    // const head = {
    //     'Content-Length': fileSize,
    //     'Content-Type': 'video/mp4',
    //   }
    // res.writeHead(200, head)
    // fs.createReadStream(`${cam_darknet}rotuled_${file}`).pipe(res)
    //res.download(`${cam_darknet}rotuled_${file}`)
    //res.send('Fechou')
})

app.get("/result", async (req,res)=>{
    console.log('começou resultado')

  
    console.log('ta no meio resultado')
    const {stdout,stderr} = await exec(`python3 ${cam_darknet}main.py`)
    console.log(stdout)
    console.log('terminou resultado')

    res.send(stdout)


    
})






app.listen(porta,()=>{console.log('qualquer coisa')})

