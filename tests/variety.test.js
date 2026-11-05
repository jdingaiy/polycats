import test from 'node:test';
import assert from 'node:assert/strict';
import {TEMPLATES,COATS,coatFor,catSVG,softenPolygon,cornerOpenings,validPolygon,random,poseLayout,randomOutline,EXPRESSIONS,MARKINGS,naturalFaceFur} from '../cat.js';

test('distinct poses, coat families and expression designs are available',()=>{
 assert.equal(TEMPLATES.length,66);assert.equal(new Set(TEMPLATES.map(t=>t.id)).size,66);
 assert.equal(new Set(TEMPLATES.map(t=>JSON.stringify(t.points))).size,66);
 assert.equal(COATS.length,12);
});
test('coat changes affect face pigment without changing the matched silhouette',()=>{
 const p=TEMPLATES[0].points;
 const outputs=COATS.map(c=>catSVG(p,25,null,.75,1,null,c.id));
 assert.equal(new Set(outputs).size,COATS.length);
 for(let i=0;i<COATS.length;i++){
  const svg=outputs[i],profile=COATS[i];assert.ok(svg.includes(`data-coat="${profile.id}"`));
  assert.ok(svg.includes(`data-pattern="${profile.face}"`));
  assert.equal(svg.match(/<clipPath[^]*?<\/clipPath>/)[0],outputs[0].match(/<clipPath[^]*?<\/clipPath>/)[0]);
  const stripes=svg.match(/<g data-layer="tabby-markings">([^]*?)<\/g>/)[1];
  assert.equal(stripes,'');assert.match(svg,/data-fur-model="anatomical"/);
  assert.doesNotMatch(svg,/NaN|Infinity/);
 }
});
test('coat randomization is reproducible and covers all families',()=>{
 const ids=new Set();for(let seed=0;seed<1000;seed++){assert.equal(coatFor(seed),coatFor(seed));ids.add(coatFor(seed).id);}
 assert.equal(ids.size,COATS.length);
 assert.notEqual(catSVG(TEMPLATES[0].points,10,null,.75,1,null,'calico'),catSVG(TEMPLATES[0].points,11,null,.75,1,null,'calico'));
});
test('acute convex tips and concave notches become openings of at least 90 degrees',()=>{
 const p=[[40,300],[110,80],[170,280],[230,40],[290,280],[350,80],[420,300],[420,420],[40,420]];
 assert.ok(validPolygon(p));assert.ok(Math.min(...cornerOpenings(p))<45);
 const q=softenPolygon(p);assert.ok(q);assert.ok(validPolygon(q));assert.ok(Math.min(...cornerOpenings(q))>=90-1e-7);
 assert.deepEqual(softenPolygon(q),q);
});
test('all templates and seeded perturbations can produce safe generated outlines',()=>{
 let accepted=0;
 for(const t of TEMPLATES)for(let seed=1;seed<=8;seed++){
  const rng=random(seed),p=t.points.map(([x,y])=>[x+(rng()-.5)*40,y+(rng()-.5)*40]);if(!validPolygon(p))continue;
  const q=softenPolygon(p);if(!q)continue;accepted++;
  assert.ok(validPolygon(q));assert.ok(cornerOpenings(q).every(angle=>angle>=90-1e-7));
 }
 assert.ok(accepted>50,`Only ${accepted} accepted perturbations were accepted`);
});
test('locked matching still uses the correct face layout during drag',()=>{
 const t=TEMPLATES[0],p=t.points.map((v,i)=>i===0?[v[0]-10,v[1]+8]:v);
 const f=poseLayout(p,null,t.id);assert.equal(f.pose.id,t.id);assert.equal(f.analysis.candidates.length,1);assert.ok(f.face.r>20);
});

test('random outlines vary direction and allow acute angles',()=>{
 let diagonals=0,total=0,concave=0,acute=0;const unique=new Set();
 for(let seed=0;seed<150;seed++){
  const p=randomOutline(seed);assert.ok(validPolygon(p));if(cornerOpenings(p).some(a=>a<90))acute++;unique.add(JSON.stringify(p));
  const turns=[];p.forEach((a,i)=>{const b=p[(i+1)%p.length],c=p[(i+2)%p.length],dx=b[0]-a[0],dy=b[1]-a[1];if(Math.abs(dx)>5&&Math.abs(dy)>5)diagonals++;total++;turns.push(dx*(c[1]-b[1])-dy*(c[0]-b[0]));});
  if(turns.some(t=>t<0)&&turns.some(t=>t>0))concave++;
 }
 assert.ok(acute>80);assert.equal(unique.size,150);assert.ok(diagonals/total>.7);assert.ok(concave>30,`Only ${concave} concave shapes`);
});
test('eyes can wink and close lightly; nine forehead patterns are selectable',()=>{
 const p=TEMPLATES[0].points;assert.equal(EXPRESSIONS.length,12);assert.equal(MARKINGS.length,9);
 const faces=EXPRESSIONS.map((_,i)=>{const svg=catSVG(p,31,null,.2,1,null,'british_blue',i,0);assert.equal((svg.match(/data-open-eye=/g)||[]).length,i===2?1:[0,11].includes(i)?0:2);return svg.replace(/data-expression(?:-art)?="\d+"/g,'');});assert.equal(new Set(faces).size,12);

 const profile=COATS.find(c=>c.id==='ginger'),marks=MARKINGS.map((_,i)=>naturalFaceFur(profile,31,i));assert.equal(new Set(marks).size,9);

});

test('named expressions keep their corresponding mouth and decorations',()=>{
 const seen=new Set();
 for(let seed=0;seed<80;seed++){const svg=catSVG(TEMPLATES[0].points,seed);const e=+svg.match(/data-expression="(.*?)"/)[1];seen.add(e);assert.equal(svg.includes('data-tears="true"'),e===6);assert.equal(svg.includes('data-sweat="true"'),e===7);assert.ok(!svg.includes('data-tongue="true"'));}
 assert.equal(seen.size,12);
});

test('natural fur uses filled tapered pigment, with a feathered face mask and clipped edge shade',()=>{
 for(const profile of COATS){const fur=naturalFaceFur(profile,25);assert.ok(fur.includes('fill='));assert.doesNotMatch(fur,/stroke=|<text/);const svg=catSVG(TEMPLATES[0].points,25,null,.6,.45,null,profile.id);assert.match(svg,/data-layer="inner-edge-shade"/);assert.match(svg,/mask="url\(#cat25-body-mask\)"/);assert.match(svg,/data-fur-model="anatomical"/);}
});

test('body pigment follows mapped torso landmarks and is deterministic',async()=>{
 const {naturalBodyFur}=await import('../cat.js');const profile=COATS.find(c=>c.id==='ginger'),t=TEMPLATES.find(t=>t.id==='stand');
 const p=naturalBodyFur(profile,25,t);assert.equal(p,naturalBodyFur(profile,25,t));assert.notEqual(p,naturalBodyFur(profile,26,t));assert.match(p,/data-body-fur="torso-aligned"/);assert.doesNotMatch(p,/stroke=|NaN|Infinity/);
 let mapped=0;const transformed=naturalBodyFur(profile,25,t,([x,y])=>{mapped++;return[500-y,x];});assert.ok(mapped>100);assert.notEqual(transformed,p);
 const calico=naturalBodyFur(COATS.find(c=>c.id==='calico'),25,t);assert.ok(calico.includes('#c77d38')&&calico.includes('#2c2a2a'));
});

test('face transition has an analytic falloff and no object-bounding-box filter crop',()=>{
 const svg=catSVG(TEMPLATES[0].points,31,null,.6,.45,null,'point');
 const filters=[...svg.matchAll(/<filter[^>]*>/g)].map(m=>m[0]);assert.ok(filters.length>=3);for(const f of filters)assert.match(f,/filterUnits="userSpaceOnUse"/);
 assert.doesNotMatch(svg,/head-feather/);assert.match(svg,/id="cat31-head-fade"/);assert.match(svg,/id="point-pigment-31"/);assert.match(svg,/id="cat31-muzzle"/);
});
