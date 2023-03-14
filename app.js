
var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');
    audioconcat = require('audioconcat')
    download = require('download');
    argv = require('minimist')(process.argv.slice(2));
    path = require('node:path');
const axios = require('axios');

var log = function (entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};
const filePath = `${__dirname}/files`;
var files = [];
var files_names = [];
if (typeof argv["_"][0] !== 'undefined') {
    files = [argv["_"][0], argv["_"][1]];
    files_names = [argv["_"][0], argv["_"][1]];
    if (argv["_"].length == 2) {
        downloadMerge(files, filePath)
    } else {
        console.error("wrong arguments!: you must enter 2 numric values");
    }
}

async function downlodfiles(file, filePath) {
    await Promise.all(file.map((file) => download(file, filePath)))
    return "done";
};

async function downloadMerge(files, filePath) {
    var returend_value = "*****";
    let surah_ref = files_names[0].substring(0,files_names[0].indexOf(':'));
    let ayah_start =Number(files_names[0].substring(files_names[0].indexOf(':')+1));
    let ayah_end = Number(files_names[1].substring(files_names[1].indexOf(':')+1));
    // console.log(ayah_start);
    // console.log(ayah_end);
    let temp = [];
    if (ayah_end - ayah_start > 1) {
        for (let index = ayah_start; index <= ayah_end; index++) {
            temp.push(surah_ref+":"+index);
        }
    } else {
        temp = files;
    }
    
    let ayaht = await getAyahtURLs(temp)
    let downloaded = await downlodfiles(ayaht, filePath);
    let merged = '';
    merged = await merge(ayaht);
    return merged;
}


async function getAyahURL(ayah_reference) {
    try {
        const response = await axios.get(`https://api.alquran.cloud/v1/ayah/${ayah_reference}/ar.alafasy`);
        // console.log(response.data);
        return response.data.data.audio;
    } catch (error) {
        console.error(error);
        return error;
    }
}

async function getAyahtURLs(ayaht_references) {

    let res = await Promise.all(ayaht_references.map(async (ayah_reference) => await getAyahURL(ayah_reference)));
    console.log(res);
    return res;
}

 async function merge(files) {

    let surah_ref = files_names[0].substring(0,files_names[0].indexOf(':'));
    let output_name = files_names[0].substring(files_names[0].indexOf(':')+1) + "_" + files_names[1].substring(files_names[1].indexOf(':')+1) + ".mp3";
    let files_paths = files.map(file => "files/" + path.posix.basename(file));

    if (!fs.existsSync(`${surah_ref}/`)){
        fs.mkdirSync(`${surah_ref}/`);
    }

    let audio_link = "rffr";
    var f = await audioconcat(files_paths)
        .concat(`${surah_ref}/${output_name}`)
        .on('error', function (err, stdout, stderr) {
            console.error('Error:', err)
            console.error('ffmpeg stderr:', stderr)
        })
        .on('end', function (output) {
            audio_link = `${surah_ref}/${output_name}`;
            console.log('Audio created in:', output_name)
        });
    return `${surah_ref}/${output_name}`;
}

const express = require('express')
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();

const app = express()

app.use(express.static('.'))

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 

// app.get('/', (req, res) => {
//   res.send('Hello World!')
// })

app.post('/', (req, res) => {

    console.log(req.body);
    let surah_num = req.body.surah_num;
    let start_ayah = req.body.start_ayah;
    let end_ayah = req.body.end_ayah;

    let filePath = `${__dirname}/files`;
    let files = [`${surah_num}:${start_ayah}`, `${surah_num}:${end_ayah}`];

    files_names = files;

    downloadMerge(files, filePath).then((val) => {
        res.send(`<a href='http://localhost:${port}/${val}'>http://localhost:${port}/${val}</a>`);
    }).catch(e => console.log(e));
    
    // res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on http://localhost:${port}/`)
})

exports.getAyahURL = getAyahURL;
exports.getAyahtURLs = getAyahtURLs;
exports.downloadMerge = downloadMerge;