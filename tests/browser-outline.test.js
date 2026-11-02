import {test} from 'node:test';
import assert from 'node:assert/strict';
import {outlineFromMask} from '../browser-outline.js';
import {validPolygon} from '../cat.js';
test('browser outline selects the largest subject, ignores holes and aligns its image',()=>{
 const width=180,height=120,mask=new Uint8Array(width*height);
 for(let y=20;y<100;y++)for(let x=35;x<155;x++)mask[y*width+x]=255;
 for(let y=45;y<65;y++)for(let x=70;x<90;x++)mask[y*width+x]=0;
 for(let y=2;y<8;y++)for(let x=2;x<8;x++)mask[y*width+x]=255;
 const result=outlineFromMask(mask,width,height),p=result.placement,scale=p.width/width;
 assert.ok(validPolygon(result.points));assert.ok(result.vertices<=15);
 assert.equal(p.height/height,scale);
 const xs=result.points.map(v=>(v[0]-p.x)/scale),ys=result.points.map(v=>(v[1]-p.y)/scale);
 for(const [actual,expected] of [[Math.min(...xs),35],[Math.max(...xs),155],[Math.min(...ys),20],[Math.max(...ys),100]])assert.ok(Math.abs(actual-expected)<1e-8);
});
test('browser outline retains concave silhouettes and rejects an empty mask',()=>{
 const width=160,height=160,mask=new Uint8Array(width*height);
 for(let y=20;y<140;y++)for(let x=20;x<140;x++)if(x<60||y>100)mask[y*width+x]=255;
 const result=outlineFromMask(mask,width,height);assert.ok(validPolygon(result.points));assert.ok(result.vertices>=6&&result.vertices<=15);
 assert.throws(()=>outlineFromMask(new Uint8Array(width*height),width,height),/清晰主体/);
});
