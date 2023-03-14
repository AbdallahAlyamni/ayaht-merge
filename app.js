
var port = process.env.PORT || 3000,
    http = require('http'),
    fs = require('fs'),
    html = fs.readFileSync('index.html');
    audioconcat = require('audioconcat')
    download = require('download');
    argv = require('minimist')(process.argv.slice(2));


console.log(argv["_"][0]);

// var log = function (entry) {
//     fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
// };

let base_url = 'https://cdn.islamic.network/quran/audio/128/ar.alafasy/';
const filePath = `${__dirname}/files`;
let files = [argv["_"][0], argv["_"][1]];
if (argv["_"].length == 2) {
    downloadMerge(files, filePath)
} else {

    console.log("wrong arguments!: you must enter 2 numric values");
    
}
// downloadMerge(files, filePath)

async function downlodfiles(file, filePath) {
    await Promise.all(file.map((file) => download(base_url + file + '.mp3', filePath)))
};

function downloadMerge(files, filePath) {
    downlodfiles(files, filePath).then(() => {
        merge(files);
    });
}

function merge(files) {

    let output_name = files[0] + "_" + files[files.length - 1] + ".mp3";

    let files_paths = files.map(file => "files/" + file + ".mp3");

    audioconcat(files_paths)
        .concat(output_name)
        .on('start', function (command) {
            console.log('ffmpeg process started:', command)
        })
        .on('error', function (err, stdout, stderr) {
            console.error('Error:', err)
            console.error('ffmpeg stderr:', stderr)
        })
        .on('end', function (output) {
            console.error('Audio created in:', output)
        })

}

// var server = http.createServer(function (req, res) {
//     if (req.method === 'POST') {
//         var body = '';

//         req.on('data', function(chunk) {
//             body += chunk;
//         });

//         req.on('end', function() {
//             if (req.url === '/') {
//                 log('Received message: ' + body);
//             } else if (req.url = '/scheduled') {
//                 log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
//             }

//             res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
//             res.end();
//         });
//     } else {
//         res.writeHead(200);
//         res.write(html);
//         res.end();
//     }
// });

// Listen on port 3000, IP defaults to 127.0.0.1
// server.listen(port);

// Put a friendly message on the terminal
// console.log('Server running at http://127.0.0.1:' + port + '/');
