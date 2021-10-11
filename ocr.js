let express = require('express')
let cors = require('cors')
let ef = require('express-fileupload')
const fs = require('fs');
const Tesseract = require('tesseract.js');

var filename = 'ocr_image'
var app = express()
app.use(cors())
app.use(ef())
app.use(express.json())
app.use(express.urlencoded({extended: false}))
app.use('/img', express.static('storage/images'))
app.use('/dtxt', express.static('storage/text_files'))
app.get('/', (req,res)=>{
    res.send('<h1>Simple OCR</h1>')
})


const capturedImage = async (req, res, next) => {
    try {
        const path = './storage/images/ocr_image.jpeg'     // destination image path
        let imgdata = req.body.img;                 // get img as base64
        const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, '');     // convert base64
        fs.writeFileSync(path, base64Data,  {encoding: 'base64'});                  // write img file

        Tesseract.recognize(
            'http://localhost:5000/img/ocr_image.jpeg',
            'eng',
            { logger: m => console.log(m) }
        )
        .then(({ data: { text } }) => {
            console.log(text)
            return res.send({
                image: imgdata,
                path: path,
                text: text
            });
        })

    } catch (e) {
        next(e);
    }
}
app.post('/capture', capturedImage)


app.post('/upload',(req, res)=>{
    if(req.files){
        console.log(req.files)
        var efFile = req.files.file
         filename = efFile.name
        efFile.mv('./storage/images/'+filename, (err)=>{
            if(err){
                console.log(err)
                res.send(err)
            } else {
                 console.log(filename)
                // res.send(filename)
                Tesseract.recognize(
                    `./storage/images/${filename}`,
                    'eng',
                    { 
                        logger: m => console.log(m)
                     }
                )

                .then(({ data: { text } }) => {
                    console.log(text)
                    return res.send({
                        image: `http://localhost:5000/img/${filename}`,
                        path: `http://localhost:5000/img/${filename}`,
                        text: text

                    });
                })
                .catch((err)=>{
                    console.log(err)
                })
            }
        })
    }
})

app.post('/txt',  (req, res)=>{
    console.log('txt', req.body)
    fs.writeFile(`storage/text_files/${filename}.txt`,req.body.txt, (err) => {  
        if (err) throw err;
      })
        return res.send({path: `http://localhost:5000/dtxt/${filename}.txt` 
          })
   
      
  
})

app.listen(5000, ()=>{
    console.log('Server live @port 5000!')
})