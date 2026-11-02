let segmentationWorker=null;
export async function segmentInBrowser(file,{signal,onStatus=()=>{}}={}){
 const aborted=()=>new DOMException('已取消','AbortError');
 if(signal?.aborted)throw aborted();
 if(!globalThis.Worker||!globalThis.createImageBitmap)throw new Error('当前浏览器不支持本地抠图，请使用新版 Chrome、Safari 或 Edge。');
 let bitmap;
 try{bitmap=await createImageBitmap(file);}catch{throw new Error('无法读取图片，请使用 JPG、PNG 或 WebP；HEIC 请先转换为 JPG。');}
 if(bitmap.width*bitmap.height>40000000){bitmap.close();throw new Error('图片分辨率过大，请缩小后重试。');}
 const scale=Math.min(1,1024/Math.max(bitmap.width,bitmap.height)),surface=document.createElement('canvas');surface.width=Math.max(1,Math.round(bitmap.width*scale));surface.height=Math.max(1,Math.round(bitmap.height*scale));
 const context=surface.getContext('2d');context.drawImage(bitmap,0,0,surface.width,surface.height);bitmap.close();
 const image=surface.toDataURL('image/png');
 // A smaller mask bounds contour work and memory on phones; placement remains proportional.
 const maskScale=Math.min(1,320/Math.max(surface.width,surface.height)),sample=document.createElement('canvas');sample.width=Math.max(1,Math.round(surface.width*maskScale));sample.height=Math.max(1,Math.round(surface.height*maskScale));
 const sampleContext=sample.getContext('2d');sampleContext.drawImage(surface,0,0,sample.width,sample.height);const rgba=sampleContext.getImageData(0,0,sample.width,sample.height).data;
 if(signal?.aborted)throw aborted();
 return new Promise((resolve,reject)=>{
  const worker=segmentationWorker??=new Worker(new URL('assets/segment-worker.js',document.baseURI),{type:'module'});
  const cleanup=()=>{signal?.removeEventListener('abort',cancel);worker.onmessage=null;worker.onerror=null;};
  const cancel=()=>{cleanup();worker.terminate();segmentationWorker=null;reject(aborted());};
  signal?.addEventListener('abort',cancel,{once:true});
  worker.onmessage=({data})=>{if(data.status){onStatus(data.status);return;}cleanup();if(data.error)reject(new Error(data.error));else resolve({...data.result,image});};
  worker.onerror=()=>{cleanup();worker.terminate();segmentationWorker=null;reject(new Error('无法加载本地抠图组件，请刷新页面后重试。'));};
  onStatus('正在读取图片…');worker.postMessage({rgba,width:sample.width,height:sample.height},[rgba.buffer]);
 });
}
