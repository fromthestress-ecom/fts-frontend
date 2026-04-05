const http = require('http');

const urls = [
  'http://localhost:3000/vi',
  'http://localhost:3000/vi/san-pham',
  'http://localhost:3000/vi/blogs',
  'http://localhost:3000/vi/ve-chung-toi'
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        const match = data.match(/<meta property="og:image" content="([^"]+)"/);
        if (match) {
          console.log(`PASS: ${url} -> og:image = ${match[1]}`);
        } else {
          console.log(`FAIL: ${url} -> og:image NOT FOUND`);
        }
        resolve();
      });
    }).on('error', (err) => {
      console.log(`ERROR: ${url} -> ${err.message}`);
      resolve();
    });
  });
}

async function run() {
  for (const url of urls) {
    await checkUrl(url);
  }
}

run();
