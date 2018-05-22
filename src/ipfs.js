let IpfsHost = 'localhost';
let IpfsPort = '8080';

const ipfsApi = require('ipfs-api');
const ipfs = new ipfsApi(IpfsHost, 5001, {protocol: 'http'});

export { ipfs, IpfsHost, IpfsPort };