import {segmentInBrowser} from './browser-segment.js';
import {PRESETS,pathOf,catSVG,inside,validPolygon,poseLayout,randomOutline} from './cat.js';
const $=s=>document.querySelector(s),canvas=$('#canvas');
const newSeed=()=>crypto.getRandomValues(new Uint32Array(1))[0];
let importedPhoto=null,importVersion=0,importController=null;
let points=structuredClone(PRESETS[0].points),seed=newSeed(),anchor=null,drawing=false,draft=[],drag=null,matchLock=null,frame=0;
const currentLayout=()=>poseLayout(points,anchor,matchLock);
const hint=s=>$('#status').textContent=s;
function scheduleRender(){if(!frame)frame=requestAnimationFrame(()=>{frame=0;render();});}
function position(e){const r=canvas.getBoundingClientRect();return[Math.max(8,Math.min(492,(e.clientX-r.left)/r.width*500)),Math.max(8,Math.min(492,(e.clientY-r.top)/r.height*500))];}
function render(){
 const visible=Boolean(importedPhoto&&$('#show-photo').checked&&!drawing);
 $('#photo-underlay').hidden=!visible;$('#photo-toggle').hidden=!importedPhoto;$('#board').classList.toggle('photo-visible',visible);
 const fit=currentLayout();$('#pose-status').textContent=drawing?'':fit.pose.name+'状';
 $('#download').disabled=drawing;
 canvas.classList.toggle('drawing',drawing);$('#draw').classList.toggle('active',drawing);$('#draw').setAttribute('aria-pressed',String(drawing));
 let overlay='';
 if(drawing){overlay='<rect width="500" height="500" fill="#f0f0f0"/><polyline points="'+draft.map(p=>p.join(',')).join(' ')+'" fill="#00000008" stroke="#666" stroke-width="1"/>';draft.forEach((p,i)=>overlay+=`<circle cx="${p[0]}" cy="${p[1]}" r="${i?3:6}" fill="#333"/>`);}
 else{points.forEach((p,i)=>{const q=points[(i+1)%points.length];overlay+=`<line data-edge="${i}" class="edge" x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="transparent" stroke-width="24"/>`;});points.forEach((p,i)=>overlay+=`<circle data-index="${i}" class="handle-hit" cx="${p[0]}" cy="${p[1]}" r="15" fill="transparent"/><circle data-index="${i}" class="handle" cx="${p[0]}" cy="${p[1]}" r="3" fill="white" stroke="#666" stroke-width="1"/>`);}
 canvas.innerHTML=catSVG(points,seed,anchor,.6,.45,matchLock).replace('</svg>',`<g id="editor">${overlay}</g></svg>`);
}
function useShape(p,photo=null){importedPhoto=photo;points=structuredClone(p);anchor=null;matchLock=null;drawing=false;draft=[];render();}
function finish(){if(!validPolygon(draft)){hint('请绘制至少三个点，轮廓不能自交。');return;}useShape(draft);}
$('#draw').onclick=()=>{cancelImport();if(drawing)finish();else{drawing=true;draft=[];render();hint('逐点点击，点击起点或按 Enter 完成。');}};
$('#random').onclick=()=>{cancelImport();seed=newSeed();useShape(randomOutline(seed));};
$('#reroll').onclick=()=>{seed=newSeed();render();};
canvas.addEventListener('pointerdown',e=>{
  if(e.button!==0||drag)return;const p=position(e);
  if(drawing){if(draft.length>=3&&Math.hypot(p[0]-draft[0][0],p[1]-draft[0][1])<15)finish();else{draft.push(p);render();}return;}
  const target=e.target.closest('[data-index],[data-edge],[data-face]');if(!target)return;
  e.preventDefault();const fitted=currentLayout(),f=fitted.face;matchLock=fitted.pose.id;
  drag={id:e.pointerId,start:p,base:structuredClone(points),face:[f.x,f.y],type:target.hasAttribute('data-index')?'vertex':target.hasAttribute('data-edge')?'edge':'face',index:Number(target.dataset.index??target.dataset.edge)};
  canvas.setPointerCapture(e.pointerId);
});
function endDrag(e){if(drag?.id!==e.pointerId)return;drag=null;matchLock=null;canvas.classList.remove('dragging');scheduleRender();}
function move(e){
  if(!drag||e.pointerId!==drag.id)return;
  const p=position(e),dx=p[0]-drag.start[0],dy=p[1]-drag.start[1];
  if(!drag.moved&&Math.hypot(dx,dy)<3)return;
  drag.moved=true;canvas.classList.add('dragging');
  if(drag.type==='face'){
    const candidate=[drag.face[0]+dx,drag.face[1]+dy];
    if(inside(candidate,points)){anchor=candidate;scheduleRender();}return;
  }
  const indices=drag.type==='edge'?[drag.index,(drag.index+1)%points.length]:[drag.index];
  // Clamp the shared delta, preserving the direction and length of a dragged edge.
  const delta=[dx,dy].map((d,axis)=>Math.max(Math.max(...indices.map(i=>8-drag.base[i][axis])),Math.min(d,Math.min(...indices.map(i=>492-drag.base[i][axis])))));
  const next=drag.base.map((v,i)=>indices.includes(i)?[v[0]+delta[0],v[1]+delta[1]]:[...v]);
  if(validPolygon(next)){
    // During a gesture fit the same template; rematch the full library on release.
    points=next;anchor=null;scheduleRender();
    hint('实时调整中：毛色与表情保持，形态随边缘变化。');
  }
}
canvas.addEventListener('pointermove',move);
canvas.addEventListener('pointerup',e=>{if(drag?.id===e.pointerId){move(e);endDrag(e);}});
for(const name of['pointercancel','lostpointercapture'])canvas.addEventListener(name,endDrag);
canvas.addEventListener('dblclick',e=>{
  if(drawing)return;const p=position(e);
  // Pointer capture and SVG replacement can retarget dblclick to the canvas.
  // Resolve the edge geometrically so adding a vertex remains reliable.
  let edgeIndex=-1,bestDistance=12;
  points.forEach((a,i)=>{const b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],t=((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy);if(t<=.08||t>=.92)return;const distance=Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);if(distance<bestDistance){bestDistance=distance;edgeIndex=i;}});
  if(edgeIndex>=0){const i=edgeIndex,a=points[i],b=points[(i+1)%points.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(.1,Math.min(.9,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy)));const next=structuredClone(points);next.splice(i+1,0,[a[0]+dx*t,a[1]+dy*t]);if(validPolygon(next)){points=next;hint('已加一个顶点，可以把这里拉成耳朵、爪子或尾巴。');render();}}
  else if(inside(p,points)){anchor=p;render();}
});
document.addEventListener('keydown',e=>{if(!drawing||e.target.matches('input'))return;if(e.key==='Enter'){e.preventDefault();finish();}if(e.key==='Escape'){drawing=false;draft=[];hint('已取消绘制，保留原来的猫。');render();}if(e.key==='Backspace'){e.preventDefault();draft.pop();render();}});

function importMessage(text,error=false){const el=$('#import-status');el.textContent=text;el.hidden=!text;el.classList.toggle('error',error);}
function setImportBusy(busy){$('#import-photo').textContent=busy?'正在导入…':'导入图片';$('#import-photo').setAttribute('aria-busy',String(busy));}
function cancelImport(){importVersion++;if(importController)importController.abort();importController=null;setImportBusy(false);importMessage('');}
$('#show-photo').onchange=render;
$('#import-photo').onclick=()=>$('#photo-input').click();
$('#photo-input').onchange=async e=>{
 const file=e.target.files[0];e.target.value='';if(!file)return;
 cancelImport();const version=importVersion;
 if(file.size>32*1024*1024){importMessage('请选择不超过 32 MB 的图片。',true);return;}
 if(location.protocol==='file:'){importMessage('请通过网站或本地 HTTP 服务打开后导入图片。',true);return;}
 importController=new AbortController();setImportBusy(true);importMessage('正在提取图片轮廓…');
 try{
  const result=await segmentInBrowser(file,{signal:importController.signal,onStatus:text=>{if(version===importVersion)importMessage(text);}});if(version!==importVersion)return;
  if(!Array.isArray(result.points)||result.points.length>15||!validPolygon(result.points))throw new Error('未提取到有效轮廓，请换一张图片。');
  const p=result.placement;
  if(!p||!['x','y','width','height'].every(k=>Number.isFinite(p[k]))||p.width<=0||p.height<=0||!/^data:image\/png;base64,/.test(result.image))throw new Error('图片处理结果不完整，请重试。');
  const underlay=$('#photo-underlay');underlay.src=result.image;underlay.style.left=p.x/5+'%';underlay.style.top=p.y/5+'%';underlay.style.width=p.width/5+'%';underlay.style.height=p.height/5+'%';
  $('#show-photo').checked=true;seed=newSeed();useShape(result.points,{placement:p});importMessage('');
 }catch(error){if(error.name!=='AbortError'&&version===importVersion)importMessage(error.message||'浏览器抠图失败，请重试。',true);}
 finally{if(version===importVersion){setImportBusy(false);importController=null;}}
};
// Rasterize only artwork layers: the DOM editor and toolbar never enter the export.
function loadExportImage(source){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('无法生成图片，请重试。'));image.src=source;});}
$('#download').onclick=async()=>{
 const button=$('#download');button.disabled=true;button.setAttribute('aria-busy','true');
 try{
  if(frame){cancelAnimationFrame(frame);frame=0;render();button.disabled=true;}
  const artwork=canvas.querySelector('svg').cloneNode(true);artwork.querySelector('#editor')?.remove();
  artwork.setAttribute('width','1000');artwork.setAttribute('height','1000');
  const visible=!$('#photo-underlay').hidden;
  const photoSource=$('#photo-underlay').src,placement=importedPhoto?{...importedPhoto.placement}:null;
  const surface=document.createElement('canvas');surface.width=surface.height=1000;
  const context=surface.getContext('2d');context.scale(2,2);context.fillStyle='#f0f0f0';context.fillRect(0,0,500,500);
  if(visible&&placement){const photo=await loadExportImage(photoSource);context.globalAlpha=.85;context.drawImage(photo,placement.x,placement.y,placement.width,placement.height);context.globalAlpha=1;}
  const source=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(artwork)],{type:'image/svg+xml;charset=utf-8'}));
  try{const image=await loadExportImage(source);context.globalAlpha=visible ? .76 : 1;context.drawImage(image,0,0,500,500);}finally{URL.revokeObjectURL(source);}
  const blob=await new Promise((resolve,reject)=>surface.toBlob(value=>value?resolve(value):reject(new Error('无法生成 PNG，请重试。')),'image/png'));
  const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='polycats.png';document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);
  hint('已导出 PNG。');
 }catch(error){hint(error.message||'导出失败，请重试。');}
 finally{button.disabled=drawing;button.removeAttribute('aria-busy');}
};

render();

// Touch feedback never depends on sticky mobile :hover or focus state.
const clearButtonPress=()=>document.querySelectorAll('button.is-pressed').forEach(b=>b.classList.remove('is-pressed'));
document.querySelectorAll('button').forEach(button=>{
 button.addEventListener('pointerdown',e=>{if(!button.disabled&&e.button===0)button.classList.add('is-pressed');});
 button.addEventListener('pointerleave',()=>button.classList.remove('is-pressed'));
 button.addEventListener('lostpointercapture',()=>button.classList.remove('is-pressed'));
});
for(const event of ['pointerup','pointercancel'])document.addEventListener(event,clearButtonPress,true);
window.addEventListener('blur',()=>{clearButtonPress();if(drag){drag=null;matchLock=null;canvas.classList.remove('dragging');scheduleRender();}});
document.addEventListener('visibilitychange',()=>{if(document.hidden)clearButtonPress();});
