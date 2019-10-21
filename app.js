const express = require('express');
const app = express();

const PORT = 8080;

const { spawn } = require('child_process');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use('/js', express.static(__dirname + '/node_modules/litegraph.js/build/'));
app.use('/css', express.static(__dirname + '/node_modules/litegraph.js/css/'));

app.get('/', function(req, res) {
	res.render('demo');
});

app.get('/runkratos', function(req, res) {
	// Keep the connection open to retrieve the stream
	res.writeHead(200, {
		'connection':	'keep-alive',
		'cache-Control':'no-cache'
	});

	process.env['LD_LIBRARY_PATH'] = process.env.HOME+'/KratosInstall/libs';
	process.env['PYTHONPATH'] = process.env.HOME+'/KratosInstall';

	const child = spawn('python2', [process.env.HOME+'/KratosInstall/kratos/python_scripts/run_cpp_tests.py'] );

	child.stdout.setEncoding('utf8');
	child.stdout.on('data', (chunk) => {
		// Print in server for debug
		console.log(chunk);

		// Send to client
		chunk.split('\n').forEach(function(line) {
			res.write(line+'\n');
		});
	});

	child.stderr.setEncoding('utf8');
	child.stderr.on('data', (chunk) => {
 		// Print in server for debug
		console.log(chunk);

		// Send to client
		chunk.split('\n').forEach(function(line) {
			res.write(line+'\n');
		});
	});

	child.on('close', (code) => {
		console.log(`Process ended with code ${code}`);

		// Close the connection!
		res.end();
	});
});

app.listen(PORT, function() {
	console.log('Server is running');
});
