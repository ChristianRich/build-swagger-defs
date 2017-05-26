# Example of how to build Swagger definitions from multiple files
Generates a single Swagger definition files from multple files by following JSON $ref tags.
Outputs the result to /output in both JSON and YAML.

# Prerequisites
Node v.6.4 or later

# Usage
Generate the Swagger file outputting in either JSON or YAML.
If output is not specified it defaults to JSON.

`node swagger`


Will validate the file after generation and output any Swagger errors to console.
The Swagger definitions are read from /src/index.yaml and the generated files are saved to /output
