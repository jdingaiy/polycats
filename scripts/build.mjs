import {readFile,mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');
const [html,css,cat,app]=await Promise.all(['index.html','style.css','cat.js','app.js'].map(read));
const script=cat.replace(/^export /gm,'')+'\n'+app.replace(/^import .*?;\n/,'');
const standalone=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',()=>`<script type="module">${script}</script>`);
const pages=process.argv.includes('--pages');
const apiBase=(process.env.POLYCATS_API_BASE||'').replace(/\/$/,'');
if(apiBase){const url=new URL(apiBase);if(url.protocol!=='https:'||url.username||url.password||url.search||url.hash)throw Error('POLYCATS_API_BASE must be a public HTTPS base URL without credentials, query or fragment');}
const config=JSON.stringify({staticHost:pages,apiBase}).replace(/</g,'\\u003c');
const output=standalone.replace('<script type="module">',()=>`<script>const polycatsConfig=${config};window.POLYCATS_STATIC_HOST=polycatsConfig.staticHost;window.POLYCATS_API_BASE=polycatsConfig.apiBase;</script><script type="module">`);
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/polycats-demo.html',root),output);
console.log('Built dist/polycats-demo.html — self-contained, works offline.');

if(pages) await writeFile(new URL('dist/index.html',root),output);
