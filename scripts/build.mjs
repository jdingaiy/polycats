import {readFile,mkdir,writeFile,copyFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {build} from 'esbuild';
import {fileURLToPath} from 'node:url';
const root=new URL('../',import.meta.url);
const read=name=>readFile(new URL(name,root),'utf8');
const [html,css,cat,segment,app]=await Promise.all(['index.html','style.css','cat.js','browser-segment.js','app.js'].map(read));
const script=cat.replace(/^export /gm,'')+'\n'+segment.replace(/^export /gm,'')+'\n'+app.replace(/^import .*?;\n/gm,'');
const output=html.replace('<link rel="stylesheet" href="style.css">',()=>`<style>${css}</style>`).replace('<script type="module" src="app.js"></script>',()=>`<script type="module">${script}</script>`);
await mkdir(new URL('dist/assets/',root),{recursive:true});
await mkdir(new URL('.cache/browser-model/',root),{recursive:true});
const model=new URL('.cache/browser-model/u2netp.onnx',root),expected='8e83ca70e441ab06c318d82300c84806';
async function verified(){try{return createHash('md5').update(await readFile(model)).digest('hex')===expected;}catch{return false;}}
if(!await verified()){
 // Official rembg release and its published checksum; never disable verification.
 execFileSync('curl',['--fail','--location','--retry','2','https://github.com/danielgatis/rembg/releases/download/v0.0.0/u2netp.onnx','--output',fileURLToPath(model)],{stdio:'inherit'});
 if(!await verified())throw Error('U2netp model checksum verification failed');
}
await copyFile(model,new URL('dist/assets/u2netp.onnx',root));
for(const name of ['ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs'])await copyFile(new URL('node_modules/onnxruntime-web/dist/'+name,root),new URL('dist/assets/'+name,root));
for(const name of ['ONNXRUNTIME','U2NET'])await copyFile(new URL('licenses/'+name+'.txt',root),new URL('dist/assets/'+name+'-LICENSE.txt',root));
await build({entryPoints:[fileURLToPath(new URL('browser-segment-worker.js',root))],outfile:fileURLToPath(new URL('dist/assets/segment-worker.js',root)),bundle:true,format:'esm',platform:'browser',target:'es2022',minify:true});
await writeFile(new URL('dist/polycats-demo.html',root),output);
await writeFile(new URL('dist/index.html',root),output);
console.log('Built dist/: drawing and PNG export, plus browser-only image import (assets/ required).');

await import('./build-pose-review.mjs');

await import('./build-character-review.mjs');
await mkdir(new URL('dist/review/',root),{recursive:true});
for(const file of ['index.html','poses.svg','expressions.svg'])await copyFile(new URL('review/'+file,root),new URL('dist/review/'+file,root));

await import('./build-soft-face-review.mjs');
await copyFile(new URL('review/expression-study-v3.svg',root),new URL('dist/review/expression-study-v3.svg',root));

await import('./build-full-catalog.mjs');
for(const file of ['catalog-v4.html','expressions-v4.svg','combinations-v4.svg','poses-v4-1.svg','poses-v4-2.svg','poses-v4-3.svg'])await copyFile(new URL('review/'+file,root),new URL('dist/review/'+file,root));
