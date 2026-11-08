import {validPolygon} from './cat.js';

// Keep the largest four-connected foreground, then trace its pixel boundary.
export function outlineFromMask(mask,width,height){
 const seen=new Uint8Array(mask.length),queue=new Int32Array(mask.length);let largest=[];
 for(let i=0;i<mask.length;i++){
  if(seen[i]||mask[i]<128)continue;
  let head=0,tail=1;queue[0]=i;seen[i]=1;
  while(head<tail){const p=queue[head++],x=p%width,y=Math.floor(p/width);
   for(const q of [x? p-1:-1,x+1<width?p+1:-1,y?p-width:-1,y+1<height?p+width:-1])if(q>=0&&!seen[q]&&mask[q]>=128){seen[q]=1;queue[tail++]=q;}
  }
  if(tail>largest.length)largest=Array.from(queue.subarray(0,tail));
 }
 if(largest.length<100)throw new Error('没有找到清晰主体，请换一张背景更清楚的图片。');
 const selected=new Uint8Array(mask.length);for(const i of largest)selected[i]=1;
 const stride=width+1,edges=new Map();
 const add=(a,b)=>{if(!edges.has(a))edges.set(a,[]);edges.get(a).push(b);};
 for(const i of largest){const x=i%width,y=Math.floor(i/width),a=y*stride+x;
  if(!y||!selected[i-width])add(a,a+1);
  if(x===width-1||!selected[i+1])add(a+1,a+stride+1);
  if(y===height-1||!selected[i+width])add(a+stride+1,a+stride);
  if(!x||!selected[i-1])add(a+stride,a);
 }
 let boundary=[],best=0;
 while(edges.size){const start=edges.keys().next().value;let p=start,loop=[];
  do{loop.push([p%stride,Math.floor(p/stride)]);const next=edges.get(p);if(!next)break;const q=next.pop();if(!next.length)edges.delete(p);p=q;}while(p!==start);
  const area=Math.abs(loop.reduce((sum,a,i)=>{const b=loop[(i+1)%loop.length];return sum+a[0]*b[1]-b[0]*a[1];},0));
  if(area>best){best=area;boundary=loop;}
 }
 // Simplify two open arcs so the closed contour retains its extreme points.
 const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/(dx*dx+dy*dy||1)));return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
 const simplify=(line,tolerance)=>{let index=-1,best=tolerance;for(let i=1;i<line.length-1;i++){const d=distance(line[i],line[0],line.at(-1));if(d>best){best=d;index=i;}}if(index<0)return [line[0],line.at(-1)];return [...simplify(line.slice(0,index+1),tolerance).slice(0,-1),...simplify(line.slice(index),tolerance)];};
 let split=1;for(let i=2;i<boundary.length;i++)if(Math.hypot(...boundary[i].map((v,j)=>v-boundary[0][j]))>Math.hypot(...boundary[split].map((v,j)=>v-boundary[0][j])))split=i;
 const arcA=boundary.slice(0,split+1),arcB=[...boundary.slice(split),boundary[0]];let reduced;
 for(let tolerance=.5;tolerance<Math.max(width,height);tolerance*=1.15){const candidate=[...simplify(arcA,tolerance).slice(0,-1),...simplify(arcB,tolerance).slice(0,-1)];if(candidate.length<=15&&validPolygon(candidate.map(p=>p.map(v=>v*10)))){reduced=candidate;break;}}
 if(!reduced)throw new Error('无法提取有效轮廓，请换一张图片。');boundary=reduced;
 const cx=width/2,cy=height/2;
 const scale=500/Math.max(width,height);
 const points=boundary.map(([x,y])=>[(x-cx)*scale+250,(y-cy)*scale+250]);
 if(!validPolygon(points))throw new Error('无法提取有效轮廓，请换一张图片。');
 return {points,vertices:points.length,placement:{x:250-cx*scale,y:250-cy*scale,width:width*scale,height:height*scale}};
}
