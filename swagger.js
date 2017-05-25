const resolveRefs = require('json-refs').resolveRefs
	, YAML = require('yaml-js')
	, toYaml = require('yamljs') // Not a duplicate of 'yaml-js'. These packages cater for different functionality but happen to have similar names
	, fs = require('fs')
	, path = require('path')
	, src = path.resolve(process.cwd(), './src/index.yaml')
	, argv = require('minimist')(process.argv.slice(2));

let swaggerSpecSrc,
	output = 'json',
	dest;

if(argv.output && argv.output.length){
	output = argv.output;
}

output = output.toLowerCase();

if(output !== 'json' && output !== 'yaml'){
	console.error('Error: Expecting json or yaml for param type');
	process.exit(1);
}

dest = path.resolve(process.cwd(), './output/index.' + output)

console.log(`Building Swagger spec using output format ${output}`);
console.log(`src: ${src}`)
console.log(`dest: ${dest}`)

try{
	swaggerSpecSrc = YAML.load(
		fs.readFileSync(src)
	);
} catch(e){
	console.log(`Unable to read Swagger src ${src}: ${e}`);
	return process.exit(1);
}

const options = {
	filter: ['relative', 'remote'],
	loaderOptions: {
		processContent: function(res, callback){
			callback(null, YAML.load(res.text));
		}
	}
};

resolveRefs(
	swaggerSpecSrc,
	options
)

.then(function(results){

	const yaml = toYaml.stringify(results.resolved, 8, 2),
		json = JSON.stringify(results.resolved, null, 2);

	let data;

	if(output === 'json'){
		data = json;
	}

	if(output === 'yaml'){
		data = yaml;
	}

	fs.writeFile(dest, data, function(err){

		if(err){
			console.log(err);
			return process.exit(1);
		}

		console.log('Completed');
		process.exit(0);
	});
})

.catch(function(err){
	console.error(err);
	process.exit(1);
});
