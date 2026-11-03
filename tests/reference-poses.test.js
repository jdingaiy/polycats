import test from 'node:test';
import assert from 'node:assert/strict';
import {poseLayout,matchTemplates,REFERENCE_POSES,inside} from '../cat.js';

// Independently reconstructed from the user's failed upright silhouette.
const importedUpright=[
 [[148,40],[200,60],[287,61],[337,34],[347,62],[310,207],[329,279],[306,385],[259,447],[227,432],[197,436],[162,368],[158,262],[175,203]],
 [[165,45],[212,83],[278,81],[322,41],[330,102],[298,208],[314,310],[289,422],[251,449],[231,437],[208,447],[176,373],[173,265],[187,206]]
];
test('imported upright silhouettes keep the face upright and in the head',()=>{
 for(const points of importedUpright){
  const f=poseLayout(points);assert.equal(f.pose.id,'upright_front');assert.ok(Math.abs(f.face.angle)<12);assert.ok(f.face.y<180);assert.ok(f.face.x>210&&f.face.x<280);assert.ok(f.face.r>35);assert.ok(inside([f.face.x,f.face.y],points));assert.ok(f.analysis.headCue);
  const shifted=[...points.slice(5),...points.slice(0,5)].reverse();assert.equal(poseLayout(shifted).pose.id,'upright_front');
 }
});
test('face-up landmarks follow rotated and mirrored reference poses',()=>{
 for(const t of REFERENCE_POSES)for(const mirror of [1,-1]){
  const angle=.73,c=Math.cos(angle),s=Math.sin(angle),map=([x,y])=>[70+.7*(mirror*x*c-y*s),40+.7*(mirror*x*s+y*c)];
  const f=poseLayout(t.points.map(map)),face=map(t.face),up=map(t.faceUp),expected=Math.atan2(up[0]-face[0],face[1]-up[1])*180/Math.PI;
  assert.equal(f.pose.id,t.id);assert.ok(Math.abs(Math.sin((f.face.angle-expected)*Math.PI/180))<1e-6,t.id);
 }
});
test('a plain tall polygon does not invent evidence for a pair of ears',()=>{
 assert.equal(matchTemplates([[180,40],[320,40],[320,450],[180,450]]).headCue,null);
});
