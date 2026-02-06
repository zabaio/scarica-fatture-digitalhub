var validate = require('jsonschema').validate;
var fs = require('fs');
const path = require('path');
const configPath = path.join('config', 'config.json'); 
const schemaPath = path.join("config","config.schema.json");
var json = JSON.parse(fs.readFileSync(configPath, "utf-8"));
var schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));
var res = validate(json, schema, {required: true});
console.log(res.valid);