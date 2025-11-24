var express = require('express');
var app = express();
/*
const options = {
	setHeaders (res, path, stat) {
		res.set('x-timestamp', Date.now()),
		//res.set('Access-Control-Allow-Origin', '*');
		//res.set('Access-Control-Request-Method', '*');
		//res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
		//res.set('Access-Control-Allow-Headers', '*');
		res.set('Cross-Origin-Opener-Policy', 'same-origin'); 
		res.set('Cross-Origin-Embedder-Policy', 'require-corp');  		
	}
}
app.use(express.static('client',[options]));
//server.use(express.static('client',[]));
*/
// Setting up the public directory
app.use(express.static('.', {
	setHeaders: (res) => {
		res.set('x-timestamp', Date.now()),
		res.set('Cross-Origin-Opener-Policy', 'same-origin');
		res.set('Cross-Origin-Embedder-Policy', 'require-corp');
	}
}));


app.listen(8080,() => console.log('Server running on port 8080'));


/*
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');

const host = 'localhost';
const port = 8000;

http.createServer(function(req,res){
	// Set CORS headers
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

	res.setHeader('Access-Control-Allow-Headers', '*');

    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin'); 
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');   

	if ( req.method === 'OPTIONS' ) {
		res.writeHead(200);
		res.end();
		return;
	}

	console.log(`${req.method} ${req.url}`);

	// parse URL
	const parsedUrl = url.parse(req.url);
	// extract URL path
	let pathname = `.${parsedUrl.pathname}`;
	// based on the URL path, extract the file extension. e.g. .js, .doc, ...
	const ext = path.parse(pathname).ext;
	// maps file extension to MIME typere
	const map = {
	  '.ico': 'image/x-icon',
	  '.html': 'text/html',
	  '.js': 'text/javascript',
	  '.json': 'application/json',
	  '.css': 'text/css',
	  '.png': 'image/png',
	  '.jpg': 'image/jpeg',
	  '.wav': 'audio/wav',
	  '.mp3': 'audio/mpeg',
	  '.svg': 'image/svg+xml',
	  '.pdf': 'application/pdf',
	  '.doc': 'application/msword'
	};

	fs.exists(pathname, callback: (exists: boolean) => {
		if(!exist) {
		  // if the file is not found, return 404
		  res.statusCode = 404;
		  res.end(`File ${pathname} not found!`);
		  return;
		}
	
		// if is a directory search for index file matching the extension
		if (fs.statSync(pathname).isDirectory()) pathname += '/index' + ext;
	
		// read file from file system
		fs.readFile(pathname, function(err, data){
		  if(err){
			res.statusCode = 500;
			res.end(`Error getting the file: ${err}.`);
		  } else {
			// if the file is found, set Content-type and send data
			res.setHeader('Content-type', map[ext] || 'text/plain' );
			res.end(data);
		  }
		});
	});
}).listen(port, function() {
	console.log(
		'Server running at http://localhost:' + port + '/'
	);
	//logger.info(`Server start listening port: ${port}`);
});
*/