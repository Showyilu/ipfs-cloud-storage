const ENV = 'production'; // development or production

let IpfsHost = '', IpfsApiPort = '';
if(ENV === 'development') {
  IpfsHost = 'localhost';
  IpfsApiPort = '5001';
} else {
  IpfsHost = '128.199.228.113';
  IpfsApiPort = '80';
}


const ipfsApi = require('ipfs-api');
const ipfs = new ipfsApi(IpfsHost, IpfsApiPort, {protocol: 'http'});

export { ipfs };