const resolveRefs = require('json-refs').resolveRefs
	, SwaggerParser = require('swagger-parser')
	, YAML = require('yaml-js')
	, toYaml = require('yamljs')
	, fs = require('fs')
	, path = require('path')
	, src = path.resolve(process.cwd(), './src/index.yaml')
	, destJSON = path.resolve(process.cwd(), './output/index.json')
	, destYAML = path.resolve(process.cwd(), './output/index.yaml');

let swaggerSpecSrc;

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

	const json = JSON.stringify(results.resolved, null, 2),
		yaml = toYaml.stringify(results.resolved, 8, 2);

	try{
		fs.writeFileSync(destJSON, json);
	} catch(e){
		console.log(`Error writing file to: ${destJSON}`);
		throw e;
	}

	try{
		fs.writeFileSync(destYAML, yaml);
	} catch(e){
		console.log(`Error writing file to: ${destYAML}`);
		throw e;
	}

	console.log('destJSON: ' + destJSON)
	return SwaggerParser.validate(destJSON);
})

.then(function(api){
	console.log('Completed without errors');
	console.log(api);
})

.catch(function(err){
	console.log(err);
});
