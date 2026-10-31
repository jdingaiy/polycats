import test from 'node:test';
import assert from 'node:assert/strict';
import {TEMPLATES,matchTemplates,poseLayout,inside,clearance,catSVG,validPolygon} from '../cat.js';

import {REGRESSIONS} from './fixtures.js';

test('annotated templates are simple polygons and recover their own identities',()=>{
 for(const t of TEMPLATES){assert.ok(validPolygon(t.points),t.id);const match=matchTemplates(t.points).candidates[0];assert.equal(match.id,t.id);assert.ok(match.error<1e-8);}
});
test('matching survives arbitrary rotation, scale, reflection and vertex start index',()=>{
 for(const t of TEMPLATES)for(const flip of [1,-1])for(const angle of [.57,Math.PI/2,Math.PI]){
  const c=Math.cos(angle),s=Math.sin(angle);
  let p=t.points.map(([x,y])=>[40+.7*(flip*x*c-y*s),80+.7*(flip*x*s+y*c)]);
  p=[...p.slice(3),...p.slice(0,3)].reverse();
  assert.equal(matchTemplates(p).candidates[0].id,t.id);
 }
});
test('small edits retain template identity and face landmark region',()=>{
 for(const t of TEMPLATES){const p=t.points.map(([x,y],i)=>[x+Math.sin(i*2)*5,y+Math.cos(i*3)*5]);const fit=poseLayout(p);assert.equal(fit.pose.id,t.id);assert.ok(Math.hypot(fit.face.x-t.face[0],fit.face.y-t.face[1])<t.radius*.6,t.id);}
});
test('reconstructed problem contours have visible faces with a safety margin',()=>{
 for(const t of [...TEMPLATES,...REGRESSIONS]){
  const fit=poseLayout(t.points),f=fit.face;
  assert.ok(f.r>15,`${t.name}: radius ${f.r}`);assert.ok(inside([f.x,f.y],t.points));
  assert.ok(clearance([f.x,f.y],t.points)>=f.r*1.3);
  if(t.pose)assert.equal(fit.pose.id,t.pose);
  if(t.right){assert.ok(f.x>300,`${t.name}: face ${f.x}`);assert.ok(Math.abs(f.angle)<40,`${t.name}: face tilt ${f.angle}`);}
 }
});
test('face corrections cannot move the face onto the tail or a distant corner',()=>{
 const t=TEMPLATES.find(t=>t.id==='stretch'),fit=poseLayout(t.points,[45,345]);
 assert.ok(fit.face.x>300);assert.ok(fit.face.r>15);
});
test('soft body paint is filtered and original input boundary is retained',()=>{
 for(const t of TEMPLATES){const svg=catSVG(t.points,25);assert.match(svg,/<g data-layer="body-paint" filter="url\(#cat25-soft\)">/);assert.doesNotMatch(svg,/NaN|Infinity|<image/);assert.equal(svg,catSVG(t.points,25));}
});
