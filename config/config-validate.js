var validate = require('jsonschema').validate;
var fs = require('fs');
var json = JSON.parse(fs.readFileSync("config\\config.json", "utf-8"));
var schema = JSON.parse(fs.readFileSync("config\\config.schema.json", "utf-8"));
var res = validate(json, schema, {required: true});
console.log(res.valid);