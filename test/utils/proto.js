const path = require('path');
const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');

const protoPath = path.resolve(__dirname, './route_guide.proto');
const packageDefinition = protoLoader.loadSync(protoPath, {});

module.exports = grpc.loadPackageDefinition(packageDefinition);
