import {readFile,mkdir,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');
const [html,css,cat,app]=await Promise.all(['index.html','style.css','cat.js','app.js'].map(read));
const script=cat.replace(/^export /gm,'')+'\n'+app.replace(/^import .*?;\n/,'');
const standalone=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',()=>`<script type="module">${script}</script>`);
const pages=process.argv.includes('--pages');
const output=pages?standalone.replace('<script type="module">','<script>window.POLYCATS_STATIC_HOST=true;</script><script type="module">'):standalone;
await mkdir(new URL('dist/',root),{recursive:true});
await writeFile(new URL('dist/polycats-demo.html',root),output);
console.log('Built dist/polycats-demo.html — self-contained, works offline.');

if(pages) await writeFile(new URL('dist/index.html',root),output);
