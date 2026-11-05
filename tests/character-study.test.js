import test from 'node:test';
import assert from 'node:assert/strict';
import {STUDY_POSES,TEMPLATES,validPolygon,poseLayout,inside,catSVG} from '../cat.js';
test('new silhouettes are simple polygons with readable faces and finite paint',()=>{
 for(const t of STUDY_POSES){assert.ok(validPolygon(t.points),t.id);const f=poseLayout(t.points,null,t.id).face;assert.ok(inside([f.x,f.y],t.points));assert.ok(f.r>=30,t.id);assert.doesNotMatch(catSVG(t.points,17,null,.8,1,t.id),/NaN|Infinity/);}
});
test('wide eye scale and asymmetric confused eyes are actually rendered',()=>{
 const p=TEMPLATES[0].points;
 const sizes=i=>[...catSVG(p,77,null,.8,1,'head','ginger',i).matchAll(/data-eye-size="([\d.]+)"/g)].map(m=>+m[1]);
 const big=sizes(8),small=sizes(15),confused=sizes(9);
 assert.ok(Math.min(...big)>Math.max(...small)*2);assert.ok(Math.max(...confused)/Math.min(...confused)>1.5);
});
