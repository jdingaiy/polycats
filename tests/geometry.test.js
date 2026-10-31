import test from 'node:test';
import assert from 'node:assert/strict';
import {PRESETS,validPolygon,inside,clearance,poseLayout as layout,catSVG} from '../cat.js';
test('rejects crossings, touching non-adjacent edges, and degenerate shapes',()=>{
 assert.equal(validPolygon([[0,0],[100,100],[0,100],[100,0]]),false);
 assert.equal(validPolygon([[0,0],[100,0],[100,100],[50,0],[0,100]]),false);
 assert.equal(validPolygon([[0,0],[10,10],[20,20]]),false);
});
test('places a face with clearance inside every preset and a concave polygon',()=>{
 for(const p of [...PRESETS.map(p=>p.points),[[20,20],[120,20],[120,90],[60,90],[60,190],[20,190]]]){
  assert.ok(validPolygon(p));const{face:f}=layout(p);assert.ok(inside([f.x,f.y],p));assert.ok(f.r<=clearance([f.x,f.y],p));assert.ok(f.r>5);
 }
});
test('SVG is reproducible, uses the original boundary and contains no raster assets',()=>{
 const p=PRESETS[1].points,svg=catSVG(p,42);assert.equal(svg,catSVG(p,42));assert.notEqual(svg,catSVG(p,43));
 assert.match(svg,/<clipPath/);assert.match(svg,/<feGaussianBlur/);assert.doesNotMatch(svg,/<image|NaN|Infinity|https?:\/\/(?!www.w3.org)/);
});
test('face anchors retain clearance while the boundary changes',()=>{
 const p=PRESETS[0].points,anchor=[240,240],before=layout(p,anchor).face;
 const moved=p.map((v,i)=>i===0?[v[0]-20,v[1]+10]:v);
 const after=layout(moved,anchor).face;
 assert.ok(inside([before.x,before.y],p));assert.ok(inside([after.x,after.y],moved));
 assert.ok(after.r<=clearance(anchor,moved));
});
test('asymmetry changes facial rendering without changing the clipping boundary or seed',()=>{
 const p=PRESETS[0].points,straight=catSVG(p,25,null,0),wonky=catSVG(p,25,null,1);
 assert.notEqual(straight,wonky);assert.equal(wonky,catSVG(p,25,null,1));
 assert.equal(straight.match(/<clipPath[^]*?<\/clipPath>/)[0],wonky.match(/<clipPath[^]*?<\/clipPath>/)[0]);
 assert.doesNotMatch(wonky,/NaN|Infinity/);
});
