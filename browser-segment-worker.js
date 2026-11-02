import * as ort from 'onnxruntime-web/wasm';
import {outlineFromMask} from './browser-outline.js';
ort.env.wasm.numThreads=1;
ort.env.wasm.wasmPaths=new URL('./',self.location.href).href;
let session;
async function model(){
 if(!session)session=(async()=>{
  self.postMessage({status:'首次使用正在加载抠图模型…'});
  const url=new URL('u2netp.onnx',self.location.href).href;
  let cache;try{cache=await caches.open('polycats-u2netp-v1');}catch{}
  let response=await cache?.match(url);
  if(!response){response=await fetch(url);if(!response.ok)throw new Error('模型下载失败，请检查网络后重试。');try{await cache?.put(url,response.clone());}catch{}}
  return ort.InferenceSession.create(await response.arrayBuffer(),{executionProviders:['wasm'],graphOptimizationLevel:'all'});
 })().catch(error=>{session=null;throw error;});
 return session;
}
self.onmessage=async({data})=>{
 try{
  const {rgba,width,height}=data;let transparent=false;
  for(let i=3;i<rgba.length;i+=4)if(rgba[i]<128){transparent=true;break;}
  let mask;
  if(transparent){mask=new Uint8Array(width*height);for(let i=0;i<mask.length;i++)mask[i]=rgba[i*4+3];}
  else{
   const engine=await model();self.postMessage({status:'正在浏览器中抠图…'});
   const source=new OffscreenCanvas(width,height);source.getContext('2d').putImageData(new ImageData(rgba,width,height),0,0);
   const input=new OffscreenCanvas(320,320),ctx=input.getContext('2d');ctx.drawImage(source,0,0,320,320);
   const pixels=ctx.getImageData(0,0,320,320).data,values=new Float32Array(3*320*320),mean=[.485,.456,.406],std=[.229,.224,.225];let max=1;
   for(let i=0;i<pixels.length;i++)if(i%4!==3)max=Math.max(max,pixels[i]);
   for(let i=0;i<320*320;i++)for(let c=0;c<3;c++)values[c*320*320+i]=(pixels[i*4+c]/max-mean[c])/std[c];
   const output=await engine.run({[engine.inputNames[0]]:new ort.Tensor('float32',values,[1,3,320,320])}),pred=output[engine.outputNames[0]].data;
   let lo=Infinity,hi=-Infinity;for(const v of pred){lo=Math.min(lo,v);hi=Math.max(hi,v);}
   mask=new Uint8Array(width*height);
   for(let y=0;y<height;y++)for(let x=0;x<width;x++)mask[y*width+x]=255*(pred[Math.min(319,Math.floor(y/height*320))*320+Math.min(319,Math.floor(x/width*320))]-lo)/(hi-lo||1);
  }
  self.postMessage({result:outlineFromMask(mask,width,height)});
 }catch(error){self.postMessage({error:error.message||'浏览器抠图失败，请换一张图片重试。'});}
};
