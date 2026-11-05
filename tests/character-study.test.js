import test from 'node:test';
import assert from 'node:assert/strict';
import {STUDY_POSES,TEMPLATES,validPolygon,poseLayout,inside,catSVG} from '../cat.js';
test('new silhouettes are simple polygons with readable faces and finite paint',()=>{
 for(const t of STUDY_POSES){assert.ok(validPolygon(t.points),t.id);const f=poseLayout(t.points,null,t.id).face;assert.ok(inside([f.x,f.y],t.points));assert.ok(f.r>=30,t.id);assert.doesNotMatch(catSVG(t.points,17,null,.8,1,t.id),/NaN|Infinity/);}
});
test('asymmetric confused eyes remain distinct',()=>{
 const p=TEMPLATES[0].points;
 const sizes=i=>[...catSVG(p,77,null,.8,1,'head','ginger',i).matchAll(/data-eye-size="([\d.]+)"/g)].map(m=>+m[1]);
 const big=sizes(8),small=sizes(15),confused=sizes(9);
 assert.ok(Math.max(...confused)/Math.min(...confused)>1.5);
});

test('open eyes have varied contours, colored grounds and reproducible color control',()=>{
 const p=TEMPLATES[0].points,render=(e,c='ivory')=>catSVG(p,1200,null,.8,.65,'head','ginger',e,'auto',c);
 const kinds=new Set();
 for(let e=0;e<16;e++){const svg=render(e);for(const m of svg.matchAll(/data-eye-shape="([^"]+)"/g))kinds.add(m[1]);if(![12,13].includes(e))assert.match(svg,/data-eye-ground="true"/);assert.doesNotMatch(svg,/data-eye-shape="bean"/);}
 assert.ok(kinds.size>=7);assert.notEqual(render(3,'blue'),render(3,'amber'));assert.equal(render(3,'blue'),render(3,'blue'));
});
