const fs = require('fs');
const parseTorrent = require('parse-torrent');
const app = require('express')();
const ffmpeg = require('fluent-ffmpeg');
const torrentStream = require('torrent-stream');
const https = require('http');
const bs58 = require('bs58');

let MIN_SIZE = 100 * 1024 * 1024; // 100 Mo

try {
	fs.mkdirSync('torrents');
	fs.mkdirSync(process.env.HYPERTUBE_DOWNLOAD_PATH);
} catch (e) {}

const getFile = (url, callback) => {
	https.get(url, res => {
		// Initialise an array
		const bufs = [];

		// Add the data to the buffer collection
		res.on('data', (chunk) => {
			bufs.push(chunk)
		});

		// This signifies the end of a request
		res.on('end', () => {
			// We can join all of the 'chunks' of the image together
			const data = Buffer.concat(bufs);

			// Then we can call our callback.
			callback(null, data);
		});
	})
	// Inform the callback of the error.
	.on('error', callback);
}

const streamVideo = (req, res, n) => {
	return new Promise((resolve, reject)=>{
		try {
			console.log('start streaming');
			req.params.path = bs58.decode(req.params.path).toString('ascii');
			console.log('path:', req.params.path);
			const fileStream = fs.createReadStream(req.params.path);
			const converter = ffmpeg()
			.input(fileStream)
			.outputOptions('-movflags frag_keyframe+empty_moov')
			.outputFormat('mp4')
			.output(res)

			.on('codecData', (codecData) => {
				console.log('fluent-ffmpeg Notice: CodecData:', codecData);
			})
			.on('start', (cmd) => {})
			.on('progress', (progress) => {})
			.on('error', (err, stdout, stderr) => {
				console.log('ffmpeg error:', err);
				resolve(null);
			});

			// if (/\.mkv$/.test(req.params.path) === '.mkv') {
			// 	converter.addOption('-vcodec')
			// 	.audioCodec('aac')
			// 	.videoCodec('libx264')
			// 	// .addOption('copy')
			// 	// .addOption('-acodec')
			// 	// .addOption('copy')
			// 	.run();
			// 	// converter
			// 	// .addOption('-acodec')
			// 	// .addOption('copy')
			// 	// .videoCodec('libx264')
			// 	// .run();
			// } else {
				converter
				.audioCodec('aac')
				.videoCodec('libx264')
				.run();
			// }
			res.on('close', () => {
				console.log('stream closed');
				converter.kill();
			});
		} catch (e) {
			console.log('error, try again ...');
			resolve(null);
		}
	});
}

const sendHtml = (res, downloadPath, torrentParsed)=>{
	const url = downloadPath+'/'+(torrentParsed.files.sort((a, b)=>{return b.length - a.length}))[0].name;

	res.writeHead(200);
	res.write(`<html><body><video controls width="400px" autoplay onerror="console.log('error video');return 0;"><source src="http://${process.env.HYPERTUBE_STREAMING_URL}/video/${bs58.encode(Buffer.from(url))}" type="video/mp4" onerror="console.log('error source');return 0;"></video></body>
	</html>`);
	res.end();
	return 0;
}

/*
:url is the file path base58 encoded,
need to change that into an unguessable token linked to the movie and the user who asked it
*/
app.get('/url/:url', (req, res)=>{
	/* Check if url is a valid base58 ----------------------------------------*/
	if (!/^[a-km-zA-HJ-NP-Z1-9]{1,}$/.test(req.params.url)) {
		res.sendStatus(404);
		res.end();
		return 0;
	}
	const url = bs58.decode(req.params.url).toString('ascii');

	getFile(url, (err, file) => {
		if (err) { throw new Error(err); }
		const torrentRaw = file;
		const torrentParsed = parseTorrent(torrentRaw);
		const torrentFilename = torrentParsed.infoHash+'.torrent';
		const torrentPath = 'torrents/'+torrentFilename;
		const downloadPath = process.env.HYPERTUBE_DOWNLOAD_PATH+'/'+torrentParsed.infoHash
		try {
			fs.writeFileSync(torrentPath, file);
			const torrent = file;
			console.log('getfile done');
			console.log('error:',err);
			try {
				fs.mkdirSync(downloadPath);
			} catch (e) {}
			/* Handle if file has been already downloaded ------------------------*/
			if (fs.existsSync(downloadPath+'/'+torrentParsed.files.sort((a, b)=>{return b.length - a.length})[0].name)) {
				sendHtml(res, downloadPath, torrentParsed);
			} else {
				const engine = torrentStream(torrentRaw);
				let path = ""
				let i = 0;
				engine.on('ready', function() {
					engine.files.forEach(function(file) {
						console.log('filename:', file.name);
						var stream = file.createReadStream();
						stream.on('data', (d)=>{
							i++;
							console.log('data:', i, file.name);
							fs.appendFileSync(downloadPath+'/'+file.name, d);
						})
						.on('end', () => {
							console.log('download done:', file.name);
						});
					});
				});
				const t = torrentParsed.files.sort((a, b)=>{return b.length - a.length})[0];
				MIN_SIZE = t.length * 0.1;
				console.log("min size:", MIN_SIZE);
				const interval = setInterval(()=>{
					if (fs.existsSync(downloadPath+'/'+t.name)) {
						console.log('size:', fs.statSync(downloadPath+'/'+t.name).size);
						if (fs.statSync(downloadPath+'/'+t.name).size > MIN_SIZE) {
							clearInterval(interval);
							sendHtml(res, downloadPath, torrentParsed);
						}
					}
				}, 1000);
			}
		} catch (e) {
			/* TODO Handle writeFile error -----------------------------------*/
			console.log(e);
		}
	});
})
.get('/video/:path', (req, res) => {
	streamVideo(req, res, 0).then(r=>{});
});
app.listen(5555);
