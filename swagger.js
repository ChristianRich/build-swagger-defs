const resolveRefs = require('json-refs').resolveRefs
	, SwaggerParser = require('swagger-parser')
	, YAML = require('yaml-js')
	, toYaml = require('yamljs')
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
	throw('Error: Expecting json or yaml for param type');
}

dest = path.resolve(process.cwd(), './output/index.' + output);

console.log(`Building Swagger spec using output format ${output}`);
console.log(`src: ${src}`);
console.log(`dest: ${dest}`);

try{
	swaggerSpecSrc = YAML.load(
		fs.readFileSync(src)
	);
} catch(e){
	throw (`Unable to read Swagger src ${src}: ${e}`);
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

	try{
		fs.writeFileSync(dest, data);
	} catch(e){
		throw e;
	}

	return SwaggerParser.validate(dest);
})

.then(function(api){
	console.log('Completed without errors');
	console.log(api);
})

.catch(function(err){
	console.log(err);
});
