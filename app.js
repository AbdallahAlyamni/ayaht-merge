
var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');
    audioconcat = require('audioconcat')
    download = require('download');
    argv = require('minimist')(process.argv.slice(2));
    path = require('node:path');
const axios = require('axios');


// console.log(argv["_"][0]);

var log = function (entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

let base_url = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/';
const filePath = `${__dirname}/files`;
let files = [argv["_"][0], argv["_"][1]];
if (argv["_"].length == 2) {
    downloadMerge(files, filePath)
} else {
    console.error("wrong arguments!: you must enter 2 numric values");
}




async function downlodfiles(file, filePath) {
    await Promise.all(file.map((file) => download(file, filePath)))
};

async function downloadMerge(files, filePath) {
    let ayaht = await getAyahtURLs(files)
    downlodfiles(ayaht, filePath).then(() => {
        merge(ayaht);
    });
    return 'success';
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
    
    // return ayaht;
}

 function merge(files) {

    let output_name = path.posix.basename(files[0], '.mp3') + "_" + path.posix.basename(files[files.length - 1], '.mp3') + ".mp3";

    let files_paths = files.map(file => "files/" + path.posix.basename(file));

    audioconcat(files_paths)
        .concat(output_name)
        .on('error', function (err, stdout, stderr) {
            console.error('Error:', err)
            console.error('ffmpeg stderr:', stderr)
        })
        .on('end', function (output) {
            console.log('Audio created in:', output)
        });
    
    // let res = await Promise.all(ayaht_references.map(async (ayah_reference) => await getAyahURL(ayah_reference)));

}

exports.getAyahURL = getAyahURL;
exports.getAyahtURLs = getAyahtURLs;
exports.downloadMerge = downloadMerge;