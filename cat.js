export function random(seed){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const pathOf=p=>'M'+p.map(v=>v.map(x=>Number(x.toFixed(2))).join(',')).join('L')+'Z';
export function inside([x,y],p){let result=false;for(let i=0,j=p.length-1;i<p.length;j=i++){const[a,b]=p[i],[c,d]=p[j];if((b>y)!=(d>y)&&x<(c-a)*(y-b)/(d-b)+a)result=!result;}return result;}
export function clearance(q,p){let best=Infinity;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length],dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((q[0]-a[0])*dx+(q[1]-a[1])*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(q[0]-a[0]-t*dx,q[1]-a[1]-t*dy));}return best;}
export function validPolygon(p){if(p.length<3)return false;let area=0;for(let i=0;i<p.length;i++){const a=p[i],b=p[(i+1)%p.length];if(Math.hypot(a[0]-b[0],a[1]-b[1])<2)return false;area+=a[0]*b[1]-b[0]*a[1];}if(Math.abs(area)<350)return false;
  const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
  for(let i=0;i<p.length;i++)for(let j=i+1;j<p.length;j++){if(j===i+1||(i===0&&j===p.length-1))continue;const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];if(Math.max(a[0],b[0])<Math.min(c[0],d[0])||Math.max(c[0],d[0])<Math.min(a[0],b[0])||Math.max(a[1],b[1])<Math.min(c[1],d[1])||Math.max(c[1],d[1])<Math.min(a[1],b[1]))continue;if(cross(a,b,c)*cross(a,b,d)<=0&&cross(c,d,a)*cross(c,d,b)<=0)return false;}return true;}

// The smaller opening is min(interior angle, 360° - interior angle).
// Requiring >= 90° limits convex interiors to >= 90° and reflex interiors to <= 270°.
export function cornerOpenings(p){
 return p.map((v,i)=>{const a=p[(i+p.length-1)%p.length],b=p[(i+1)%p.length],u=[a[0]-v[0],a[1]-v[1]],w=[b[0]-v[0],b[1]-v[1]],denom=Math.hypot(...u)*Math.hypot(...w);return denom?Math.acos(Math.max(-1,Math.min(1,(u[0]*w[0]+u[1]*w[1])/denom)))*180/Math.PI:0;});
}
export function softenPolygon(points){
 if(!validPolygon(points))return null;
 let p=points.map(v=>v.map(n=>Number(n.toFixed(2))));
 while(p.length>=3){const angles=cornerOpenings(p);if(angles.every(a=>a>=90-1e-7)&&validPolygon(p))return p;
 let best=null;
 for(let i=0;i<p.length;i++)if(angles[i]<90-1e-7){const q=p.filter((_,j)=>i!==j);if(!validPolygon(q))continue;const violations=cornerOpenings(q).filter(a=>a<90-1e-7).length;if(!best||violations<best.violations)best={q,violations};}
 if(!best)return null;p=best.q;
 }return null;
}
export function randomOutline(seed){
 const rng=random(seed);
 for(let attempt=0;attempt<120;attempt++){
  let p;
  if(rng()<.7){const base=TEMPLATES[Math.floor(rng()*TEMPLATES.length)].points,angle=(rng()-.5)*1.2,c=Math.cos(angle),sn=Math.sin(angle),sx=.7+rng()*.3,sy=.7+rng()*.3;p=base.map(([x,y])=>{x=(x-250+(rng()-.5)*65)*sx;y=(y-250+(rng()-.5)*65)*sy;return[250+x*c-y*sn,250+x*sn+y*c];});}
  else{const n=5+Math.floor(rng()*12),phase=rng()*Math.PI*2;p=Array.from({length:n},(_,i)=>{const a=phase+i*Math.PI*2/n,r=55+rng()*150;return[250+Math.cos(a)*r,250+Math.sin(a)*r];});}
  p=p.map(v=>v.map(n=>Math.round(Math.max(10,Math.min(490,n))*100)/100));if(validPolygon(p))return p;
 }
 return [[70,300],[145,90],[230,260],[370,80],[430,370],[240,420]];
}

// Every pose has an actual silhouette and landmarks in the same 500 × 500 plane.
// Body paint and facial placement travel with this geometry, never a pose label alone.
export const TEMPLATES = [
 {id:'head',name:'尖耳大头',points:[[100,83],[189,163],[299,146],[377,113],[386,249],[339,321],[257,373],[144,330],[111,260]],face:[247,247],radius:92,ears:[[[108,101],[133,170],[171,164]],[[369,129],[318,162],[374,195]]],paint:[],shadows:[]},
 {id:'sit',name:'端坐垂爪',points:[[235,60],[285,100],[340,65],[335,160],[380,220],[405,365],[350,390],[300,380],[280,425],[225,415],[210,370],[175,395],[105,380],[75,320],[105,270],[115,325],[155,345],[185,265],[205,190],[230,150]],face:[284,146],radius:44,ears:[[[239,76],[245,111],[270,108]],[[332,80],[305,109],[332,121]]],paint:[[282,266,55,95,.46],[242,383,18,26,.75],[276,389,17,25,.72]],shadows:[[[233,229],[224,310],[238,383]],[[299,226],[292,318],[277,388]]]},
 {id:'stretch',name:'伸长趴卧',points:[[65,285],[125,260],[185,265],[250,245],[310,205],[325,125],[365,165],[420,135],[410,225],[455,260],[430,290],[370,275],[305,325],[210,315],[155,335],[90,325],[45,345]],face:[370,218],radius:39,ears:[[[330,140],[336,179],[353,176]],[[410,147],[383,176],[408,185]]],paint:[[232,291,91,21,.4],[422,269,19,12,.65]],shadows:[[[135,286],[225,310],[309,287]]]},
 {id:'curl',name:'蜷身抱尾',points:[[60,300],[80,220],[140,150],[235,140],[300,180],[345,160],[355,100],[395,145],[440,120],[430,210],[450,270],[415,340],[335,355],[290,400],[245,360],[165,375],[90,365]],face:[387,233],radius:48,ears:[[[359,114],[367,157],[387,161]],[[430,133],[405,162],[429,177]]],paint:[[222,273,73,66,.3],[320,326,31,21,.6]],shadows:[[[306,329],[117,367],[117,253],[172,181],[275,210]]]},
 {id:'loaf',name:'揣手面包',points:[[63,315],[83,246],[139,206],[246,193],[314,214],[329,130],[367,171],[416,144],[410,230],[438,278],[418,333],[362,351],[337,331],[299,355],[134,350],[86,360]],face:[372,260],radius:43,ears:[[[333,144],[340,186],[359,183]],[[407,156],[381,185],[408,194]]],paint:[[224,301,83,30,.4],[345,324,23,14,.65],[391,321,20,15,.65]],shadows:[[[320,292],[328,320],[351,324]],[[403,292],[407,316],[388,325]]]},
 {id:'stand',name:'迈步站立',points:[[50,195],[77,181],[109,230],[151,208],[275,203],[323,187],[332,100],[370,142],[419,111],[410,216],[439,240],[416,275],[388,285],[403,384],[370,393],[348,284],[290,286],[266,379],[233,375],[249,282],[185,278],[146,369],[113,363],[145,265],[104,261],[75,234]],face:[368,210],radius:39,ears:[[[336,115],[344,160],[360,157]],[[409,124],[386,154],[409,170]]],paint:[[237,255,81,20,.35],[380,375,16,15,.8],[249,362,15,15,.75],[132,351,15,15,.7]],shadows:[[[358,263],[369,317],[380,373]],[[268,268],[265,319],[249,361]],[[175,253],[152,307],[131,347]]]},
 {id:'leap',name:'斜身飞扑',points:[[42,351],[104,302],[168,270],[246,213],[303,192],[314,97],[354,138],[405,102],[402,197],[450,217],[470,255],[454,270],[403,243],[380,253],[440,307],[417,324],[348,274],[282,316],[203,338],[152,379],[121,365],[161,325],[96,353],[58,376]],face:[356,197],radius:39,ears:[[[319,112],[325,155],[346,152]],[[395,115],[372,151],[396,162]]],paint:[[246,283,66,27,.3],[450,254,18,12,.75],[420,306,17,12,.7]],shadows:[[[172,316],[245,283],[302,239]],[[367,234],[390,266],[419,306]]]},
 {id:'belly',name:'仰躺露肚',points:[[171,84],[202,75],[229,148],[275,143],[302,66],[331,80],[316,188],[346,231],[411,199],[425,223],[355,274],[335,337],[353,418],[302,384],[253,410],[202,386],[157,430],[173,340],[146,287],[83,246],[97,221],[161,249],[185,191]],face:[253,353],radius:50,angle:180,ears:[[[165,415],[182,372],[198,383]],[[344,403],[326,366],[307,381]]],paint:[[249,233,60,81,.55],[204,144,16,25,.7],[301,136,15,27,.7]],shadows:[[[195,185],[183,234],[199,281]],[[302,180],[320,236],[303,284]]]}
];
// Additional individually drawn silhouettes; not rotations or mirrors of the first eight.
TEMPLATES.push(
 {"id":"wave","name":"坐着招手","points":[[173,397],[147,334],[172,242],[190,199],[182,93],[229,134],[275,97],[284,190],[320,220],[348,133],[377,111],[402,132],[391,169],[365,166],[353,273],[305,293],[322,395],[274,414],[242,384],[214,417]],"face":[233,186],"radius":47,"ears":[],"paint":[[236,309,44,73,0.38],[373,143,19,16,0.7]],"shadows":[[[209,262],[201,330],[214,389]]]},
 {"id":"wash","name":"抬爪洗脸","points":[[140,397],[115,340],[140,255],[178,207],[168,105],[211,138],[259,106],[281,193],[318,202],[339,163],[371,176],[367,218],[322,247],[291,230],[308,321],[344,389],[300,413],[236,390],[209,421]],"face":[222,194],"radius":45,"ears":[],"paint":[[223,303,49,75,0.4],[343,197,19,19,0.75]],"shadows":[[[281,249],[265,287],[257,359]]]},
 {"id":"beg","name":"双爪拜拜","points":[[159,429],[137,369],[171,282],[193,234],[172,114],[219,144],[268,109],[290,214],[307,276],[346,366],[330,426],[276,435],[249,410],[218,435]],"face":[231,205],"radius":55,"ears":[],"paint":[[228,313,44,72,0.4],[211,272,17,26,0.75],[260,269,17,25,0.7]],"shadows":[[[211,282],[218,321],[221,347]],[[261,281],[255,318],[253,348]]]},
 {"id":"lookback","name":"回头望尾","points":[[91,381],[67,320],[84,244],[137,191],[216,175],[230,104],[276,140],[319,108],[330,202],[308,253],[341,307],[372,340],[419,296],[446,304],[442,341],[399,382],[341,394],[298,374],[247,410],[165,397]],"face":[279,211],"radius":47,"ears":[],"paint":[[177,305,61,66,0.36],[293,363,24,20,0.7]],"shadows":[[[126,317],[183,365],[246,355]]]},
 {"id":"hunt","name":"压低伏击","points":[[38,291],[89,260],[136,227],[223,220],[295,243],[331,182],[365,216],[406,187],[408,275],[450,298],[466,327],[446,340],[384,318],[346,347],[285,326],[202,336],[130,316],[87,338],[48,331]],"face":[371,277],"radius":39,"ears":[],"paint":[[235,289,80,21,0.3],[432,321,23,12,0.7]],"shadows":[[[134,272],[216,307],[304,290]]]},
 {"id":"bow","name":"翘臀伸展","points":[[72,189],[115,135],[162,145],[206,205],[255,274],[316,286],[340,229],[372,260],[407,237],[418,310],[462,343],[447,366],[361,345],[313,358],[244,338],[194,284],[151,232],[139,354],[108,368],[103,232],[75,251]],"face":[375,310],"radius":33,"ears":[],"paint":[[263,308,56,19,0.32],[433,349,23,12,0.7]],"shadows":[[[151,197],[202,268],[266,307]]]},
 {"id":"reach","name":"站起够高","points":[[177,439],[163,371],[189,269],[202,177],[181,114],[212,68],[235,112],[271,91],[290,140],[286,201],[322,142],[328,56],[355,43],[372,61],[364,161],[317,236],[288,266],[311,375],[296,443],[260,449],[246,384],[219,448]],"face":[245,165],"radius":37,"ears":[],"paint":[[242,308,36,91,0.38],[350,69,13,18,0.7]],"shadows":[[[224,265],[218,348],[209,416]]]},
 {"id":"tailup","name":"翘尾散步","points":[[52,254],[70,201],[66,106],[91,82],[111,101],[102,191],[124,223],[235,207],[313,221],[333,132],[370,165],[410,135],[414,233],[437,265],[408,295],[381,296],[378,401],[347,400],[341,297],[271,287],[255,390],[224,386],[237,282],[168,288],[147,390],[118,383],[135,288],[93,298]],"face":[372,232],"radius":40,"ears":[],"paint":[[230,260,68,22,0.34],[360,385,14,16,0.65]],"shadows":[[[155,273],[143,335],[134,375]]]},
 {"id":"trot","name":"小步轻跑","points":[[43,228],[76,207],[106,239],[154,212],[272,205],[321,183],[336,109],[371,144],[414,119],[412,216],[437,248],[399,277],[367,276],[404,328],[382,354],[327,292],[282,284],[281,360],[246,371],[244,291],[191,278],[155,333],[119,343],[109,316],[142,277],[96,274],[66,251]],"face":[372,211],"radius":39,"ears":[],"paint":[[225,252,68,22,0.3],[383,333,16,13,0.65],[257,352,17,13,0.7]],"shadows":[[[331,269],[355,308],[382,332]]]},
 {"id":"sprint","name":"奔跑腾空","points":[[38,317],[95,265],[158,225],[239,204],[296,213],[327,146],[365,178],[405,151],[407,239],[438,257],[469,308],[449,326],[394,281],[359,282],[389,344],[365,360],[320,292],[252,289],[195,310],[161,355],[123,371],[111,350],[155,298],[93,315],[52,343]],"face":[363,235],"radius":39,"ears":[],"paint":[[228,260,68,24,0.3],[446,308,16,12,0.65],[371,342,14,12,0.7]],"shadows":[[[149,275],[223,246],[301,263]]]},
 {"id":"dive","name":"低头下扑","points":[[61,133],[91,118],[162,170],[237,197],[305,229],[342,220],[367,175],[385,238],[432,228],[419,295],[451,340],[431,367],[395,337],[362,325],[341,390],[310,385],[324,318],[269,294],[223,269],[172,233],[134,276],[105,267],[127,217],[88,192]],"face":[377,281],"radius":36,"ears":[],"paint":[[236,239,61,24,0.35],[326,370,14,19,0.7],[433,346,13,15,0.7]],"shadows":[[[177,214],[234,247],[294,267]]]},
 {"id":"land","name":"前爪落地","points":[[58,197],[109,173],[174,157],[255,169],[316,220],[337,161],[371,196],[408,173],[415,258],[433,291],[396,314],[390,414],[358,421],[351,315],[319,316],[308,401],[278,398],[280,284],[219,250],[173,229],[135,299],[99,310],[89,286],[121,221],[74,226]],"face":[370,263],"radius":37,"ears":[],"paint":[[220,213,62,25,0.32],[372,401,15,16,0.7],[293,386,14,15,0.7]],"shadows":[[[326,288],[309,345],[294,381]]]},
 {"id":"climb","name":"抱柱攀爬","points":[[157,426],[132,373],[155,298],[192,235],[192,145],[177,86],[219,121],[259,88],[285,158],[303,194],[363,164],[388,179],[380,206],[315,229],[296,275],[361,269],[380,291],[367,314],[299,313],[273,370],[237,429],[198,411]],"face":[236,175],"radius":42,"ears":[],"paint":[[231,296,35,60,0.4],[367,189,17,14,0.75],[358,293,18,13,0.7]],"shadows":[[[207,263],[181,329],[182,380]]]},
 {"id":"hang","name":"双爪悬挂","points":[[164,48],[190,46],[206,124],[225,164],[210,121],[245,151],[280,119],[300,173],[322,122],[328,47],[354,53],[351,154],[321,221],[326,312],[299,383],[302,450],[275,458],[255,391],[232,455],[202,448],[214,379],[184,318],[182,219],[157,145]],"face":[255,211],"radius":42,"ears":[],"paint":[[254,303,41,60,0.42],[180,71,12,20,0.7],[340,71,11,20,0.7]],"shadows":[[[229,279],[226,335],[229,384]]]},
 {"id":"sleep","name":"侧卧枕爪","points":[[52,293],[87,231],[162,199],[241,211],[292,239],[317,201],[357,222],[391,210],[405,270],[438,295],[458,326],[435,349],[381,334],[337,360],[278,346],[214,355],[158,338],[99,353],[59,331]],"face":[355,285],"radius":45,"ears":[],"paint":[[205,288,75,36,0.35],[402,328,33,14,0.8]],"shadows":[[[111,286],[184,325],[270,308]]]},
 {"id":"pancake","name":"趴成猫饼","points":[[172,81],[218,117],[273,87],[298,161],[329,201],[400,165],[420,189],[357,248],[349,290],[412,345],[391,370],[321,329],[285,372],[270,430],[242,443],[229,379],[187,337],[113,379],[88,354],[155,289],[158,246],[84,192],[101,168],[175,206],[181,159]],"face":[233,177],"radius":43,"ears":[],"paint":[[248,286,60,61,0.45],[114,187,18,14,0.65],[391,187,18,14,0.65]],"shadows":[[[199,233],[195,288],[210,326]]]},
 {"id":"peek","name":"探头搭爪","points":[[105,367],[109,290],[127,222],[115,116],[190,165],[283,149],[359,106],[373,221],[396,281],[397,364],[360,385],[322,369],[314,330],[281,345],[218,347],[192,328],[184,373],[143,389]],"face":[246,256],"radius":84,"ears":[],"paint":[[151,352,23,23,0.8],[359,351,23,24,0.8]],"shadows":[[[136,323],[151,345],[173,325]],[[339,322],[360,345],[381,323]]]},
 {"id":"arch","name":"弓背炸毛","points":[[55,264],[72,185],[106,134],[141,124],[175,84],[210,105],[248,78],[284,112],[322,147],[338,201],[358,169],[388,202],[418,175],[427,268],[410,301],[387,304],[381,403],[350,405],[345,308],[285,251],[219,224],[175,244],[154,391],[122,394],[126,287],[96,280],[81,300]],"face":[389,260],"radius":34,"ears":[],"paint":[[229,168,53,31,0.3],[365,390,14,15,0.7],[136,377,13,16,0.65]],"shadows":[[[160,214],[216,170],[287,205]]]}
);
// Additional articulated studies: move a named extremity or torso region, and
// transfer all paint and face landmarks through the same continuous deformation.
const studies=[['wave','侧身挥爪'],['wash','低头舔爪'],['beg','缩肩拜拜'],['lookback','侧腰回望'],['hunt','探身伏击'],['bow','后腿蹬伸'],['reach','侧身够高'],['tailup','高尾驻足'],['trot','跨步小跑'],['sprint','长身疾跑'],['dive','收腿下扑'],['land','弯腿缓冲'],['climb','曲身攀爬'],['hang','斜身悬垂'],['sleep','缩身侧睡'],['pancake','侧伸猫饼'],['peek','单爪探头'],['arch','侧弓炸毛'],['sit','歪身坐姿'],['stretch','长身舒展'],['curl','紧团抱尾'],['loaf','低身揣手'],['stand','前倾站立'],['belly','扭腰仰躺']];
for(const [index,[source,name]] of studies.entries()){
 const base=TEMPLATES.find(t=>t.id===source),center=base.face;
 const deform=([x,y])=>{const weight=Math.min(1,Math.hypot(x-center[0],y-center[1])/170),side=index%2?1:-1;return [x+side*weight*(22+(y-center[1])*.12),y+weight*Math.sin((x-center[0])/130)*22];};
 const points=base.points.map(deform);
 TEMPLATES.push({...base,id:source+'_study',name,points,face:deform(base.face),ears:base.ears.map(p=>p.map(deform)),paint:base.paint.map(([x,y,...rest])=>[...deform([x,y]),...rest]),shadows:base.shadows.map(p=>p.map(deform))});
}
// Hand-annotated studies from the user's reference batch, not trained image recognition.
// Landmarks remain independent of coat selection; faceUp defines facial orientation.
export const REFERENCE_POSES=[
 {id:'upright_front',name:'正面直立',family:'upright',references:[1],points:[[152,45],[202,80],[280,79],[331,40],[340,103],[307,203],[321,280],[300,390],[263,446],[234,432],[204,442],[174,374],[169,271],[183,203]],face:[246,139],faceUp:[246,80],radius:52,ears:[],paint:[[243,298,43,92,.48],[205,234,15,37,.62],[282,233,15,37,.62]],shadows:[[[205,210],[207,253],[213,274]],[[283,210],[282,254],[277,275]]]},
 {id:'seated_front',name:'正面端坐',family:'sit',references:[9,10,11],points:[[166,51],[208,82],[278,81],[321,48],[329,142],[302,196],[337,283],[345,383],[316,437],[272,443],[248,430],[222,444],[177,437],[151,384],[158,284],[184,197],[157,146]],face:[243,142],faceUp:[243,82],radius:52,ears:[],paint:[[244,278,39,72,.38],[218,394,17,25,.7],[275,395,17,24,.7]],shadows:[[[213,257],[212,330],[214,417]],[[275,257],[276,333],[277,416]]]},
 {id:'splayed_sit',name:'后仰摊坐',family:'splay',references:[5],points:[[198,42],[236,68],[287,65],[325,37],[332,143],[343,230],[383,318],[462,397],[445,431],[354,397],[293,327],[218,330],[149,400],[54,435],[34,413],[104,350],[147,256],[181,181],[185,131]],face:[260,128],faceUp:[260,72],radius:48,ears:[],paint:[[255,268,67,60,.55],[325,229,17,45,.35]],shadows:[[[206,202],[187,248],[179,284]],[[309,201],[322,247],[327,280]]]},
 {id:'raised_hindleg',name:'坐姿举后腿',family:'raised-leg',references:[12,23],points:[[176,67],[215,91],[269,89],[306,60],[316,154],[297,207],[321,262],[352,175],[382,70],[413,66],[431,96],[405,214],[360,303],[324,352],[329,414],[285,433],[228,425],[168,447],[105,429],[122,400],[168,365],[171,286],[153,228],[175,185]],face:[244,152],faceUp:[244,95],radius:45,ears:[],paint:[[245,300,46,65,.48],[388,117,17,30,.6],[208,388,23,15,.7]],shadows:[[[214,242],[201,303],[198,361]],[[284,244],[293,308],[288,374]]]},
 {id:'loaf_front',name:'正面揣手',family:'loaf',references:[3,27],points:[[159,108],[200,141],[280,139],[322,101],[333,192],[353,244],[366,325],[337,387],[260,408],[181,401],[134,377],[121,319],[135,235],[151,194]],face:[242,214],faceUp:[242,147],radius:56,ears:[],paint:[[245,324,66,37,.4]],shadows:[[[158,326],[207,356],[285,355],[335,330]]]},
 {id:'loaf_low',name:'贴地趴卧',family:'low-loaf',references:[28],points:[[54,288],[81,263],[120,273],[154,245],[177,282],[237,228],[326,207],[393,232],[438,283],[450,335],[421,371],[338,382],[254,373],[174,388],[100,379],[62,345]],face:[126,327],faceUp:[126,278],radius:39,ears:[],paint:[[304,300,88,43,.34]],shadows:[[[192,343],[270,353],[379,348]]]},
 {id:'curled_sleep',name:'团身蜷睡',family:'curl-sleep',references:[7,19],points:[[64,259],[87,184],[145,135],[235,122],[333,146],[403,205],[437,280],[423,344],[371,388],[289,410],[197,402],[112,371],[68,321]],face:[359,306],faceUp:[376,260],radius:42,angle:20,ears:[],paint:[[227,263,83,60,.3]],shadows:[[[119,315],[190,354],[275,358],[330,332]]]},
 {id:'pounce_front',name:'正面扑跃',family:'pounce',references:[25],points:[[72,136],[115,120],[153,174],[178,199],[173,89],[217,124],[277,125],[320,88],[315,193],[352,163],[389,112],[432,130],[444,174],[411,220],[350,261],[327,330],[285,386],[239,405],[188,382],[150,327],[131,264],[86,228],[56,181]],face:[245,204],faceUp:[245,131],radius:52,ears:[],paint:[[244,316,54,49,.42],[97,166,20,21,.6],[407,161,20,21,.6]],shadows:[[[176,261],[194,298],[206,338]],[[308,259],[290,299],[281,339]]]}
];
TEMPLATES.push(...REFERENCE_POSES);
export const STUDY_POSES=[{"id": "study_arch", "name": "高拱背炸毛", "points": [[60, 330], [85, 230], [155, 125], [235, 105], [305, 145], [332, 225], [352, 190], [388, 232], [437, 200], [428, 295], [453, 325], [425, 355], [409, 425], [389, 425], [380, 342], [342, 345], [327, 424], [307, 422], [311, 300], [272, 225], [210, 190], [160, 240], [129, 335], [117, 423], [95, 421], [100, 335]], "face": [387, 290], "faceUp": [387, 251], "radius": 39, "ears": [], "paint": [[223, 190, 65, 40, 0.28]], "shadows": [[[130, 274], [167, 185], [236, 161]]]}, {"id": "study_long", "name": "超长条探头", "points": [[36, 223], [100, 204], [225, 207], [324, 198], [341, 118], [378, 160], [433, 130], [426, 228], [458, 253], [438, 288], [414, 292], [410, 365], [387, 365], [382, 290], [150, 297], [135, 365], [110, 365], [108, 295], [62, 292], [39, 271]], "face": [385, 235], "faceUp": [385, 195], "radius": 40, "ears": [], "paint": [[239, 265, 105, 20, 0.38]], "shadows": [[[136, 279], [246, 284], [350, 270]]]}, {"id": "study_roll", "name": "侧躺伸懒腰", "points": [[40, 318], [89, 289], [145, 283], [183, 267], [192, 200], [230, 232], [282, 207], [292, 275], [328, 297], [375, 282], [430, 254], [455, 272], [428, 301], [360, 331], [308, 337], [278, 376], [195, 390], [123, 370], [72, 358]], "face": [240, 295], "faceUp": [240, 256], "radius": 39, "ears": [], "paint": [[199, 347, 70, 27, 0.42]], "shadows": [[[129, 333], [183, 362], [260, 350]]]}, {"id": "study_slink", "name": "低头潜行", "points": [[50, 152], [73, 139], [103, 206], [168, 205], [252, 225], [319, 265], [344, 227], [365, 277], [418, 260], [435, 321], [465, 341], [436, 369], [390, 374], [378, 419], [355, 418], [356, 360], [274, 322], [205, 295], [191, 407], [166, 408], [163, 291], [109, 268], [79, 228]], "face": [390, 325], "faceUp": [390, 291], "radius": 34, "ears": [], "paint": [[222, 273, 80, 20, 0.34]], "shadows": [[[104, 240], [201, 258], [297, 292]]]}, {"id": "study_ball", "name": "滚圆缩爪", "points": [[91, 300], [101, 219], [140, 159], [192, 125], [204, 77], [243, 111], [286, 103], [324, 65], [343, 139], [388, 176], [422, 245], [423, 315], [391, 371], [330, 404], [247, 421], [164, 403], [116, 361]], "face": [271, 203], "faceUp": [271, 141], "radius": 62, "ears": [], "paint": [[249, 333, 69, 47, 0.45]], "shadows": [[[146, 338], [203, 380], [302, 383]]]}, {"id": "study_tall", "name": "细腿大头", "points": [[130, 75], [190, 120], [283, 110], [344, 58], [365, 156], [341, 220], [299, 244], [288, 321], [305, 424], [281, 433], [258, 334], [238, 326], [220, 434], [195, 429], [208, 314], [195, 249], [147, 229], [114, 165]], "face": [239, 182], "faceUp": [239, 117], "radius": 65, "ears": [], "paint": [[247, 289, 24, 39, 0.4]], "shadows": [[[221, 265], [223, 302], [207, 418]]]}, {"id": "study_peek", "name": "歪头探身", "points": [[95, 407], [117, 338], [182, 309], [214, 259], [191, 222], [139, 214], [101, 177], [91, 99], [150, 130], [224, 112], [272, 60], [292, 153], [280, 208], [255, 241], [282, 299], [322, 336], [377, 342], [428, 310], [451, 324], [426, 363], [363, 389], [291, 383], [247, 355], [219, 395], [166, 424]], "face": [198, 171], "faceUp": [198, 119], "radius": 52, "ears": [], "paint": [[210, 351, 46, 37, 0.38]], "shadows": [[[255, 298], [274, 343], [327, 363]]]}, {"id": "study_splat", "name": "摊开四爪", "points": [[60, 119], [91, 100], [159, 165], [191, 170], [187, 97], [223, 128], [277, 126], [315, 89], [312, 173], [346, 168], [413, 104], [442, 124], [409, 181], [350, 221], [333, 282], [370, 339], [422, 394], [401, 421], [331, 375], [291, 329], [247, 344], [204, 328], [161, 378], [91, 420], [68, 397], [125, 343], [163, 283], [148, 224], [91, 183]], "face": [250, 204], "faceUp": [250, 156], "radius": 48, "ears": [], "paint": [[246, 281, 49, 42, 0.48]], "shadows": [[[185, 259], [211, 299], [247, 312], [288, 293]]]}];
TEMPLATES.push(...STUDY_POSES);
export const PRESETS=TEMPLATES.map(t=>({name:t.name,points:t.points}));
const bounds=p=>{const xs=p.map(v=>v[0]),ys=p.map(v=>v[1]);return{x:Math.min(...xs),y:Math.min(...ys),w:Math.max(...xs)-Math.min(...xs),h:Math.max(...ys)-Math.min(...ys)};};
const signedArea=p=>p.reduce((a,v,i)=>{const q=p[(i+1)%p.length];return a+v[0]*q[1]-v[1]*q[0];},0)/2;
function sampleBoundary(points,count=48){
 const p=signedArea(points)<0?[...points].reverse():points;
 const lengths=p.map((v,i)=>Math.hypot(v[0]-p[(i+1)%p.length][0],v[1]-p[(i+1)%p.length][1]));
 const perimeter=lengths.reduce((a,b)=>a+b,0);let edge=0,walk=0;
 return Array.from({length:count},(_,i)=>{const distance=i*perimeter/count;while(edge<lengths.length-1&&walk+lengths[edge]<distance){walk+=lengths[edge++];}const a=p[edge],b=p[(edge+1)%p.length],t=(distance-walk)/(lengths[edge]||1);return[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t];});
}
const templateSamples=TEMPLATES.map(template=>[false,true].map(mirror=>({template,mirror,samples:sampleBoundary(template.points.map(([x,y])=>[mirror?-x:x,y]))})));
// Preserve exact template identity under cyclic vertex order and arbitrary similarity transforms.
function exactVertexFit(template,points,mirror,samples){
 if(template.points.length!==points.length)return null;
 let source=template.points.map(([x,y])=>[mirror?-x:x,y]),target=points;
 if(signedArea(source)<0)source=[...source].reverse();if(signedArea(target)<0)target=[...target].reverse();
 const n=source.length,mean=p=>p.reduce((a,v)=>[a[0]+v[0]/n,a[1]+v[1]/n],[0,0]),sc=mean(source),tc=mean(target);
 const den=source.reduce((s,q)=>s+(q[0]-sc[0])**2+(q[1]-sc[1])**2,0);
 for(let k=0;k<n;k++){
 let dot=0,cross=0;for(let i=0;i<n;i++){const q=source[i],p=target[(i+k)%n];dot+=(q[0]-sc[0])*(p[0]-tc[0])+(q[1]-sc[1])*(p[1]-tc[1]);cross+=(q[0]-sc[0])*(p[1]-tc[1])-(q[1]-sc[1])*(p[0]-tc[0]);}
 const a=dot/den,b=cross/den,tx=tc[0]-a*sc[0]+b*sc[1],ty=tc[1]-b*sc[0]-a*sc[1];
 const raw=([x,y])=>[a*x-b*y+tx,b*x+a*y+ty];
 if(source.every((q,i)=>{const r=raw(q),p=target[(i+k)%n];return Math.hypot(r[0]-p[0],r[1]-p[1])<1e-6;})){
 const map=([x,y])=>raw([mirror?-x:x,y]);return{id:template.id,name:template.name,template,mirror,map,scale:Math.hypot(a,b),angle:Math.atan2(b,a)*180/Math.PI,error:0,fitCost:0,source:samples,target:samples.map(raw),offset:0};
 }
 }return null;
}
// A conservative cue for tall, upright silhouettes with two distinct upper ears.
// It supplies evidence only; ambiguous outlines retain unrestricted matching.
function uprightHeadCue(points,box){
 if(box.h<box.w*1.25)return null;
 const tips=points.map((p,i)=>({p,i})).filter(({p,i})=>p[1]<box.y+box.h*.24&&p[1]<points[(i+points.length-1)%points.length][1]&&p[1]<points[(i+1)%points.length][1]);
 for(const a of tips)for(const b of tips){if(a.i===b.i||Math.abs(a.p[0]-b.p[0])<box.w*.4)continue;
  const arc=[];for(let i=(a.i+1)%points.length;i!==b.i;i=(i+1)%points.length)arc.push(points[i]);
  if(!arc.length||arc.length>4||arc.some(p=>p[1]>box.y+box.h*.3))continue;
  const valley=Math.max(...arc.map(p=>p[1]));if(valley-Math.max(a.p[1],b.p[1])<box.h*.035)continue;
  return {x:(a.p[0]+b.p[0])/2,y:valley+box.h*.13};
 }return null;
}
const matchCache=new Map();
export function matchTemplates(points,lockedId=null){
 const key=JSON.stringify([points,lockedId]);if(matchCache.has(key))return matchCache.get(key);
 const box=bounds(points),target=sampleBoundary(points),n=target.length,headCue=uprightHeadCue(points,box);
 const mean=p=>p.reduce((a,v)=>[a[0]+v[0]/n,a[1]+v[1]/n],[0,0]);
 const tc=mean(target),norm=Math.hypot(box.w,box.h)||1;
 const candidates=[];
 for(const variants of templateSamples){if(lockedId&&variants[0].template.id!==lockedId)continue;let best=null;
  for(const {template,mirror,samples:source} of variants){const exact=exactVertexFit(template,points,mirror,source);if(exact){best=exact;break;}const sc=mean(source);let denom=0;for(const q of source)denom+=(q[0]-sc[0])**2+(q[1]-sc[1])**2;
   for(let offset=0;offset<n;offset++){
    let dot=0,cross=0;
    for(let i=0;i<n;i++){const q=source[i],p=target[(i+offset)%n],qx=q[0]-sc[0],qy=q[1]-sc[1],px=p[0]-tc[0],py=p[1]-tc[1];dot+=qx*px+qy*py;cross+=qx*py-qy*px;}
    const a=dot/denom,b=cross/denom,scale=Math.hypot(a,b),tx=tc[0]-a*sc[0]+b*sc[1],ty=tc[1]-b*sc[0]-a*sc[1];
    let error=0;for(let i=0;i<n;i++){const q=source[i],p=target[(i+offset)%n];error+=(a*q[0]-b*q[1]+tx-p[0])**2+(b*q[0]+a*q[1]+ty-p[1])**2;}
    error=Math.sqrt(error/n)/norm;
    const fitCost=error+.025*Math.abs(Math.atan2(b,a))/Math.PI*Math.min(1,Math.max(0,(error-.015)/.035));
    if(!best||fitCost<best.fitCost){const map=([x,y])=>{if(mirror)x=-x;return[a*x-b*y+tx,b*x+a*y+ty];};best={id:template.id,name:template.name,template,mirror,map,scale,angle:Math.atan2(b,a)*180/Math.PI,error,fitCost,source,target,offset};}
   }
  }
  // Compare filled silhouettes too: a close perimeter alone can hide a wrong limb gap.
  const mapped=best.template.points.map(best.map),unionBox=bounds([...points,...mapped]);let intersection=0,union=0;
  for(let iy=0;iy<28;iy++)for(let ix=0;ix<28;ix++){const q=[unionBox.x+(ix+.5)*unionBox.w/28,unionBox.y+(iy+.5)*unionBox.h/28],u=inside(q,points),v=inside(q,mapped);if(u||v)union++;if(u&&v)intersection++;}
  best.overlap=intersection/(union||1);best.score=best.fitCost+.08*(1-best.overlap);
  if(headCue&&best.error>.012&&!lockedId){
   const face=best.map(best.template.face),angle=(best.angle+(best.mirror?-(best.template.angle||0):(best.template.angle||0)))*Math.PI/180;
   best.headPenalty=.14*Math.hypot(face[0]-headCue.x,face[1]-headCue.y)/norm+.065*(1-Math.cos(angle));best.score+=best.headPenalty;
  }
  candidates.push(best);
 }
 candidates.sort((a,b)=>a.score-b.score);
 const result={candidates,box,headCue,weak:candidates[0].score>.105,ambiguous:candidates.length>1&&candidates[1].score-candidates[0].score<.012};
 if(matchCache.size>=32)matchCache.delete(matchCache.keys().next().value);matchCache.set(key,result);return result;
}
// Transfer landmarks with a bounded, local residual correction from the matched contour.
function transfer(match,point){
 const base=match.map(point);let dx=0,dy=0,total=0;
 for(let i=0;i<match.source.length;i++){const q=match.source[i],world=match.map([match.mirror?-q[0]:q[0],q[1]]),p=match.target[(i+match.offset)%match.target.length],weight=1/(Math.hypot(world[0]-base[0],world[1]-base[1])**2+400*match.scale**2);dx+=(p[0]-world[0])*weight;dy+=(p[1]-world[1])*weight;total+=weight;}
 const limit=match.template.radius*match.scale*.6,length=Math.hypot(dx/total,dy/total),factor=Math.min(1,limit/(length||1));
 return[base[0]+dx/total*factor,base[1]+dy/total*factor];
}
const layoutCache=new Map();
export function poseLayout(points,anchor=null,lockedId=null){
 const cacheKey=JSON.stringify([points,anchor,lockedId]);if(layoutCache.has(cacheKey))return layoutCache.get(cacheKey);
 const analysis=matchTemplates(points,lockedId),match=analysis.candidates.find(c=>c.id===lockedId)||analysis.candidates[0],template=match.template;
 const expected=transfer(match,template.face),desired=template.radius*match.scale;
 // Face nudges are confined to the matched head, not allowed to drift down a leg.
 let target=expected;if(anchor){const dx=anchor[0]-expected[0],dy=anchor[1]-expected[1],factor=Math.min(1,desired*.55/(Math.hypot(dx,dy)||1));target=[expected[0]+dx*factor,expected[1]+dy*factor];}
 let best=null;
 const consider=q=>{if(!inside(q,points))return;const room=clearance(q,points),radius=Math.min(desired,room*.76),distance=Math.hypot(q[0]-target[0],q[1]-target[1]);const score=radius-distance*.42;if(!best||score>best.score)best={x:q[0],y:q[1],r:radius,score};};
 consider(target);
 const reach=desired*1.15,step=Math.max(2,desired/12);
 for(let y=target[1]-reach;y<=target[1]+reach;y+=step)for(let x=target[0]-reach;x<=target[0]+reach;x+=step)if(Math.hypot(x-expected[0],y-expected[1])<desired*1.5)consider([x,y]);
 // An unmatched silhouette still receives a visible face, explicitly marked as weak.
 let fallback=false;if(!best||best.r<Math.min(9,desired*.3)){fallback=true;const b=analysis.box;for(let y=b.y;y<b.y+b.h;y+=Math.max(3,b.h/35))for(let x=b.x;x<b.x+b.w;x+=Math.max(3,b.w/35))consider([x,y]);}
 const face=best||{x:expected[0],y:expected[1],r:1};face.angle=match.angle+(match.mirror?-(template.angle||0):(template.angle||0));
 if(template.faceUp){const up=match.map(template.faceUp),center=match.map(template.face);face.angle=Math.atan2(up[0]-center[0],center[1]-up[1])*180/Math.PI;}
 const result={box:analysis.box,face,pose:template,match,analysis,fallback,expected,desired,map:p=>transfer(match,p)};
 if(layoutCache.size>=32)layoutCache.delete(layoutCache.keys().next().value);layoutCache.set(cacheKey,result);return result;
}

// Fur pigments are separate from facial ink, so white fur does not acquire black edges.
export const COATS=[
 {id:'cow',name:'黑白奶牛',pattern:'patches',base:'#f2efe7',shade:'#b4b1a9',light:'#fff9ec',ink:'#302c2a',iris:'#b4aa58',patches:['#25282b'],face:'cow'},
 {id:'eyepatch',name:'单眼眼罩',pattern:'sparse',base:'#f1eade',shade:'#c5baad',light:'#fff7e8',ink:'#322c28',iris:'#acb778',patches:['#343337'],face:'eyepatch'},
 {id:'calico',name:'橘黑三花',pattern:'patches',base:'#f1e8d9',shade:'#bbae9d',light:'#fff6e7',ink:'#32291f',iris:'#b3a35d',patches:['#c77d38','#2c2a2a'],face:'calico'},
 {id:'british_blue',name:'英短蓝灰',pattern:'solid',base:'#7c8997',shade:'#424d60',light:'#adb9c5',ink:'#27313d',iris:'#d4a44b',patches:[],face:'solid'},
 {id:'british_silver',name:'英短银渐层',pattern:'shaded',base:'#d3d7d5',shade:'#7c8990',light:'#f3f1e8',ink:'#3c4549',iris:'#7eac8b',patches:[],face:'shaded'},
 {id:'ginger',name:'橘色虎斑',pattern:'tabby',base:'#d89a55',shade:'#996437',light:'#f2d4a5',ink:'#63432c',iris:'#acb15c',patches:['#8d572e'],face:'tabby'},
 {id:'tabby',name:'棕色狸花',pattern:'tabby',base:'#a08b68',shade:'#5e513e',light:'#d2c2a0',ink:'#382f27',iris:'#acb964',patches:['#463d31'],face:'tabby'},
 {id:'tuxedo',name:'黑白燕尾服',pattern:'bib',base:'#2d323b',shade:'#171d28',light:'#616975',ink:'#20252e',iris:'#d6bb59',patches:['#f0ece3'],face:'tuxedo'},
 {id:'tortie',name:'玳瑁碎斑',pattern:'mottle',base:'#39322f',shade:'#201e21',light:'#8d7051',ink:'#282326',iris:'#b4ae59',patches:['#bb7b42','#d8ad70','#4d3c31'],face:'tortie'},
 {id:'point',name:'暹罗重点色',pattern:'point',base:'#dbcfb8',shade:'#b6a38b',light:'#f3e6cd',ink:'#2b2529',iris:'#89b6d0',patches:['#59443d'],face:'point'},
 {id:'white',name:'奶油白猫',pattern:'solid',base:'#eee4cf',shade:'#c6b8a2',light:'#fff7e7',ink:'#6c5f52',iris:'#9fb7b0',patches:[],face:'solid'},
 {id:'black',name:'乌云黑猫',pattern:'solid',base:'#2a2f36',shade:'#141b23',light:'#575f69',ink:'#9aa0a5',iris:'#cfb24a',patches:[],face:'solid'},
];
export const EXPRESSIONS=['乖巧','轻闭眼','眨眼','惊讶','好奇','委屈','流泪','流汗','大小眼困惑','嫌弃侧目','炸毛生气','困到睁不开'];
export const MARKINGS=['自然毛色','宽额分纹','细额分纹','不对称额纹','低额纹','高额纹','细碎额纹','分叉额纹','疏额纹'];
export function coatFor(seed,mode='auto'){
 return COATS.find(c=>c.id===mode)||COATS[Math.floor(random(seed^0x716fc3)()*COATS.length)];
}
// Closed quadratic blobs give irregular spots with soft paint edges.
function pigmentBlob(cx,cy,rx,ry,color,rng,opacity=1){
 const vertices=Array.from({length:9},(_,i)=>{const angle=i*Math.PI*2/9,radius=.7+rng()*.45;return[cx+Math.cos(angle)*rx*radius,cy+Math.sin(angle)*ry*radius];});
 const midpoint=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
 let d='M'+midpoint(vertices.at(-1),vertices[0]);
 for(let i=0;i<vertices.length;i++)d+=`Q${vertices[i]} ${midpoint(vertices[i],vertices[(i+1)%vertices.length])}`;
 return `<path d="${d}Z" fill="${color}" opacity="${opacity}"/>`;
}

// Pigment follows crown → brow → cheek. No standalone forehead badges or glyphs.
export function naturalFaceFur(profile,seed,variant=0){
 const rng=random(seed^0x718e42^Math.imul(variant,0x85ebca6b)),ink=profile.patches[0]||profile.shade;
 const blob=(x,y,rx,ry,color,opacity)=>pigmentBlob(x,y,rx,ry,color,rng,opacity);
 const ribbon=(points,width,color,opacity)=>{
  const left=[],right=[];
  for(let i=0;i<points.length;i++){const [x,y]=points[i],a=points[Math.max(0,i-1)],b=points[Math.min(points.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,t=i/(points.length-1),w=width*Math.sin(Math.PI*(.08+.9*t))*(.72+rng()*.35);left.push([x-dy/len*w,y+dx/len*w]);right.unshift([x+dy/len*w,y-dx/len*w]);}
  const p=[...left,...right],mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let d='M'+mid(p.at(-1),p[0]);for(let i=0;i<p.length;i++)d+=`Q${p[i]} ${mid(p[i],p[(i+1)%p.length])}`;
  return `<path d="${d}Z" fill="${color}" opacity="${opacity}"/>`;
 };
 let result='';
 if(profile.pattern==='tabby'){
  const shift=(rng()-.5)*.12,spread=.22+(variant%3)*.045;
  // Unequal, tapered crown bands reach in from the ears, splitting around the brow.
  for(const sign of[-1,1]){
   result+=ribbon([[sign*.78,-1.55],[sign*.54,-1.13],[sign*spread+shift,-.82],[sign*.15+shift,-.51]],.075+rng()*.035,ink,.46);
   result+=ribbon([[sign*.29,-1.6],[sign*.22,-1.18],[sign*.09,-.94],[sign*.12,-.71]],.04+rng()*.025,ink,.35);
   result+=ribbon([[sign*.98,-.52],[sign*.77,-.36],[sign*.6,-.27]],.045,ink,.4);
   for(let j=0;j<2;j++)result+=ribbon([[sign*1.29,.1+j*.29],[sign*.99,.12+j*.25],[sign*.76,.24+j*.21]],.065-j*.012,ink,.35);
  }
  // A narrow pale nose bridge opens naturally between the pigmented brows.
  result+=blob(0,-.18,.13,.57,profile.light,.18);
 }else if(['cow','eyepatch','calico'].includes(profile.face)){
  const side=rng()<.5?-1:1,color=profile.face==='calico'?'#bb7b43':ink;
  result+=ribbon([[side*.84,-1.75],[side*.74,-1.12],[side*.61,-.57],[side*.56,-.06],[side*.74,.38]],.35,color,.85);
  result+=blob(side*.64,-.32,.38,.52,color,.5);
  if(profile.face!=='eyepatch'){
   const other=profile.face==='calico'?'#353333':ink;
   result+=ribbon([[-side*.88,-1.7],[-side*.77,-1.05],[-side*.64,-.63],[-side*.72,-.28]],.3,other,.78);
  }
  result+=ribbon([[.02,-1.6],[-.08,-.82],[.03,-.22],[.04,.32]],.12,profile.light,.68);
 }else if(profile.face==='tortie'){
  for(let i=0;i<17;i++){const a=rng()*Math.PI*2,rad=.2+rng()*1.2;result+=blob(Math.cos(a)*rad,Math.sin(a)*rad-.25,.12+rng()*.25,.2+rng()*.3,profile.patches[i%profile.patches.length],.35+rng()*.3);}
 }else if(profile.face==='point'){
  const id='point-pigment-'+(seed>>>0);
  result+=`<defs><radialGradient id="${id}" cx="50%" cy="43%" r="57%"><stop stop-color="#59443d" stop-opacity=".66"/><stop offset=".4" stop-color="#59443d" stop-opacity=".48"/><stop offset=".75" stop-color="#59443d" stop-opacity=".16"/><stop offset="1" stop-color="#59443d" stop-opacity="0"/></radialGradient></defs><ellipse cx="0" cy="-.05" rx="1.35" ry="1.55" fill="url(#${id})"/>`;
  for(const sign of[-1,1])result+=ribbon([[sign*.85,-1.8],[sign*.73,-1.13],[sign*.6,-.65]],.18,'#59443d',.22);
 }else if(profile.face==='tuxedo'){
  result+=ribbon([[.02,-1.7],[-.06,-.8],[.01,-.2],[.02,.45]],.14,'#eeeae1',.9);
  result+=blob(0,.45,.56,.43,'#eeeae1',.65);
 }else{
  // Solid and shaded cats have diffuse brow/cheek shading, not an added forehead spot.
  for(const sign of[-1,1])result+=ribbon([[sign*.9,-1.8],[sign*.85,-1],[sign*.95,-.1],[sign*1.12,.55]],.32,profile.shade,profile.face==='shaded'?.16:.09);
 }
 return result;
}

// Body pigment is laid out along the annotated torso, then follows the template fit.
export function naturalBodyFur(profile,seed,template,project=p=>p){
 const rng=random(seed^0x6c1e39),box=bounds(template.points);
 const center=template.paint.length?template.paint[0].slice(0,2):[box.x+box.w*.5,box.y+box.h*.62];
 const dx=template.face[0]-center[0],dy=template.face[1]-center[1],distance=Math.hypot(dx,dy)||1,axis=[dx/distance,dy/distance],normal=[-axis[1],axis[0]];
 const length=Math.max(85,distance*1.5),width=Math.min(90,Math.max(35,Math.min(box.w,box.h)*.27));
 const point=(u,v)=>project([center[0]+u*axis[0]+v*normal[0],center[1]+u*axis[1]+v*normal[1]]);
 const shape=(p,color,opacity)=>{const mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let d='M'+mid(p.at(-1),p[0]);for(let i=0;i<p.length;i++)d+=`Q${p[i]} ${mid(p[i],p[(i+1)%p.length])}`;return `<path d="${d}Z" fill="${color}" opacity="${opacity}"/>`;};
 const patch=(u,v,rx,ry,color,opacity)=>shape(Array.from({length:13},(_,i)=>{const a=i*Math.PI*2/13,jitter=.75+rng()*.4;return point(u+Math.cos(a)*rx*jitter,v+Math.sin(a)*ry*jitter);}),color,opacity);
 let result='';
 if(profile.pattern==='tabby'){
  for(let i=0;i<8;i++){
   const u=length*((i+.3)/8-.6),bend=(rng()-.5)*length*.18,band=5+rng()*6;
   // Unequal flanking bands taper toward the belly rather than crossing as straight bars.
   for(const sign of[-1,1]){
    const v=width*(.9+rng()*.35)*sign,end=width*(.03+rng()*.25)*sign;
    result+=shape([point(u-band,v),point(u+bend-band,v*.65),point(u+bend*.7-band*.35,end),point(u+bend*.7+band*.25,end),point(u+bend+band,v*.65),point(u+band,v)],profile.patches[0],.28+rng()*.22);
   }
  }
 }else if(['patches','sparse','mottle'].includes(profile.pattern)){
  const count=profile.pattern==='mottle'?28:profile.pattern==='sparse'?3:6;
  for(let i=0;i<count;i++){
   const u=(rng()-.5)*length*1.5,v=(rng()-.5)*width*2;
   const size=profile.pattern==='mottle'?.25:1;
   // Alternate calico pigments rather than accidentally giving the body only one color.
   const color=profile.patches[i%profile.patches.length];
   result+=patch(u,v,(20+rng()*65)*size,(20+rng()*48)*size,color,.55+rng()*.27);
  }
 }else if(profile.pattern==='bib'){
  result+=patch(length*.35,0,length*.31,width*.6,profile.light,.65);
 }else if(profile.pattern==='point'){
  result+=patch(-length*.64,0,length*.25,width*.75,profile.patches[0],.28);
 }else{
  result+=patch(-length*.2,-width*.6,length*.65,width*.5,profile.shade,.1);
 }
 // Explicit tail paths keep rings off legs and out of the face.
 const tails={sit:[[88,299],[99,339],[139,364]],stand:[[57,201],[81,225],[104,245]],stretch:[[63,309],[106,292],[151,300]],curl:[[111,280],[131,324],[180,345],[239,348]],tailup:[[85,114],[85,159],[99,205]],wave:[[176,365],[183,329]]};
 const tail=tails[template.id.replace('_study','')];
 if(tail&&['tabby','point','patches','sparse'].includes(profile.pattern)){
  for(let i=0;i<tail.length-1;i++){const a=tail[i],b=tail[i+1],vx=b[0]-a[0],vy=b[1]-a[1],n=Math.hypot(vx,vy)||1;
   for(const t of[.25,.7]){const x=a[0]+vx*t,y=a[1]+vy*t,spread=9,half=3;const p=[[-half,-spread],[half,-spread],[half,spread],[-half,spread]].map(([u,v])=>project([x+vx/n*u-vy/n*v,y+vy/n*u+vx/n*v]));result+=shape(p,profile.patches[0]||profile.shade,.35);}
  }
 }
 return `<g data-body-fur="torso-aligned">${result}</g>`;
}

export const EYE_PALETTES=[{id:'ivory',name:'象牙白',color:'#f0ebd9'},{id:'sage',name:'鼠尾草绿',color:'#c4d6aa'},{id:'blue',name:'雾蓝',color:'#bfd4da'},{id:'amber',name:'浅琥珀',color:'#e6c787'},{id:'lilac',name:'灰紫',color:'#d1c7dc'},{id:'mint',name:'薄荷青',color:'#b9d6c8'}];

export function catSVG(points,seed=1,anchor=null,asymmetry=.75,detail=1,lockedId=null,coatMode='auto',expressionMode='auto',markingMode='auto',eyePaletteMode='auto'){const rng=random(seed),profile=coatFor(seed,coatMode),coat=profile.base,dark=profile.ink,cream=profile.light,iris=profile.iris,{box:b,face:f,pose,match,map}=poseLayout(points,anchor,lockedId),d=pathOf(points),id='cat'+(seed>>>0),r=f.r,x=f.x,y=f.y;
  const personality=random(seed^0xabcdef),amount=Math.max(0,Math.min(1,asymmetry));
  const tilt=f.angle+(personality()-.5)*24*amount,skew=(personality()-.5)*18*amount;
  // Stable size personality: broad between-cat range, restrained left/right mismatch.
  personality(); // Preserve existing seeded coat/face variation sequence.
  const eyeScale=[1-(.08+personality()*.25)*amount,1+personality()*.18*amount];
  if(personality()<.5)eyeScale.reverse();
  const eyeLift=(personality()-.5)*r*.22*amount,noseShift=(personality()-.5)*r*.2*amount;
  const faceTransform=`rotate(${tilt} ${x} ${y}) translate(${x} ${y}) skewX(${skew}) translate(${-x} ${-y})`;
  const ellipse=(cx,cy,rx,ry,fill,extra='')=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
  let marks=naturalBodyFur(profile,seed,pose,map),faceMarks='',forehead='';
  const ears=pose.ears.map(p=>`<path d="${pathOf(p.map(map))}" fill="#d5a29a" opacity=".35"/>`).join('');
  const faceRandom=random(seed^0x935a),expression=expressionMode==='auto'?Math.floor(faceRandom()*EXPRESSIONS.length):((Number(expressionMode)%EXPRESSIONS.length)+EXPRESSIONS.length)%EXPRESSIONS.length;
  const mouthChoice=[0,4,4,2,0,3,3,4,2,4,3,2][expression];
  const tongue=false,tears=expression===6,sweat=expression===7;
  const mark=markingMode==='auto'?Math.floor(random(seed^0x2c58)()*MARKINGS.length):Math.max(0,Math.min(MARKINGS.length-1,Number(markingMode)));
  faceMarks=`<g data-fur-model="anatomical" transform="translate(${x} ${y}) scale(${r})">${naturalFaceFur(profile,seed,mark)}</g>`;
  const line=(d,width=4,color=dark)=>`<path d="${d}" stroke="${color}" stroke-width="${width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const oval=(cx,cy,rx,ry,color)=>`<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${color}"/>`;
  let eyes='',mouth='',emotion='';
  // Each contour follows the selected expression reference, in normalized head space.
  const shapes={
   half:'M-1,-.4 L.96,.05 Q.8,.87 -.03,.8 Q-.83,.64 -1,-.4Z',
   wide:'M-.91,-.5 L-.43,-.94 Q.12,-1.08 .69,-.64 L.97,-.03 Q1.02,.64 .42,.87 L-.23,.96 Q-.96,.68 -.91,-.5Z',
   gaze:'M-.98,.13 Q-.65,-.78 .1,-.97 Q.8,-.99 .98,-.38 Q.99,.35 .39,.81 Q-.37,1.08 -.98,.13Z',
   worried:'M-1,.23 Q-.25,-.16 .58,-1.02 Q.92,-.55 .96,.26 Q.89,.95 .21,.93 Q-.59,.91 -1,.23Z',
   small:'M-1,-.15 Q-.26,-.61 .98,.09 Q.63,.84 -.19,.76 Q-.79,.67 -1,-.15Z',
   side:'M-1,.51 Q-.62,-.57 .95,-1.02 Q1.03,-.03 .63,.58 Q-.11,1.01 -1,.51Z',
   angry:'M-1,-.65 L.96,.11 Q.86,.93 -.05,.87 Q-.9,.81 -1,-.65Z'
  };
  const defaultColors=['ivory','amber','sage','sage','amber','amber','sage','amber','sage','sage','sage','ivory'];
  const eyePalette=EYE_PALETTES.find(p=>p.id===eyePaletteMode)||EYE_PALETTES.find(p=>p.id===defaultColors[expression]);
  const ink=profile.id==='black'?'#322f2b':dark;
  for(const sign of[-1,1]){
   const side=sign===-1?0:1,mirror=-sign;
   const ex=sign*58,ey=-18+sign*eyeLift/r*20;
   const closed=expression===0||expression===11||(expression===2&&sign===1);
   const eid=`${id}-pigment-${side}`;
   if(closed){
    const d=expression===0?`M${ex-35},${ey+4} Q${ex-4},${ey-28} ${ex+34},${ey+3}`:expression===11?`M${ex-37},${ey+2} Q${ex},${ey+6} ${ex+35},${ey+2}`:`M${ex+28},${ey-18} Q${ex+4},${ey-13} ${ex-25},${ey+7} L${ex+28},${ey+6}`;
    eyes+=`<g data-closed-eye="${side}" filter="url(#${id}-eye-ink)">${line(d,4.8)}</g>`;
    continue;
   }
   let kind=[null,'half','wide','wide','gaze','worried','worried','half','wide','half','angry'][expression];
   let rx=58,ry=48,angle=0,gx=0,gy=-8;
   if(expression===1||expression===7){ry=39;gx=18;gy=5;}
   if(expression===2){rx=59;ry=55;gx=22;gy=-27;}
   if(expression===3){rx=56;ry=53;gx=side===0?23:-17;gy=-4;}
   if(expression===4){rx=61;ry=53;angle=sign*17;gx=side===0?12:28;gy=-27;}
   if(expression===5||expression===6){rx=55;ry=53;gx=28;gy=-29;}
   if(expression===8){if(side===0){rx=62;ry=56;gx=-12;gy=-28;}else{kind='small';rx=39;ry=36;gx=-18;gy=-2;}}
   if(expression===9){if(side===0){kind='half';rx=57;ry=29;gx=28;gy=3;}else{kind='side';rx=52;ry=52;gx=29;gy=-26;}}
   if(expression===10){rx=61;ry=46;gx=25;gy=4;}
   // Apply restrained asymmetry, preserving the designed eye contour and readable gaze.
   const scale=1+(eyeScale[side]-1)*.3;rx*=scale;ry*=scale;
   const shape=shapes[kind],pupilRx=expression===3?12:14,pupilRy=expression===3?17:18;
   eyes+=`<g data-open-eye="${sign}" data-eye-size="${(rx/20).toFixed(3)}" data-eye-shape="${kind}" data-eye-palette="${eyePalette.id}" transform="translate(${ex} ${ey}) rotate(${angle}) scale(${mirror} 1)"><g filter="url(#${id}-eye-ink)"><defs><clipPath id="${eid}-clip"><path d="${shape}" transform="scale(${rx} ${ry})"/></clipPath><linearGradient id="${eid}-shade" x2=".2" y2="1"><stop stop-color="${eyePalette.color}"/><stop offset="1" stop-color="#eee9be"/></linearGradient></defs><path data-eye-ground="true" d="${shape}" transform="scale(${rx} ${ry})" fill="url(#${eid}-shade)"/><g clip-path="url(#${eid}-clip)">${oval(gx,gy,pupilRx,pupilRy,ink)}</g></g></g>`;
  }
  const mouths=[
   line('M0,34 C-1,49 -18,49 -17,39 M0,34 C1,49 18,49 17,39',4),
   line('M-10,45 L1,39 L9,47',3.3),
   line('M-2,39 L4,44 L1,49',3),
   '<path d="M-12,62 Q-13,38 0,36 Q14,39 13,62Z" fill="#a75e59"/><path d="M-9,61 Q0,52 10,61" fill="#dca19b"/>',
   '<path d="M-7,39 L9,43 L-4,52Z" fill="#b97970"/>',
   line('M-12,47 L0,39 L11,48',3.5),
   line('M-11,47 Q0,35 11,47',3.5),
   line('M-10,45 L1,39 L9,47',3.3),
   '<path d="M-6,42 Q4,36 8,43 Q7,53 -3,51Z" fill="#b57570"/>',
   line('M-6,43 L2,41 L5,46',3),
   line('M-9,45 L0,40 L9,45',3.5),
   '<path d="M-7,46 Q-5,35 3,39 L10,49 Q0,55 -7,46Z" fill="#c08078"/>'
  ];
  mouth=mouths[expression];
  if(tears)emotion+=`<path data-tear="true" d="M91,23 Q77,46 86,51 Q102,55 91,23Z" fill="#b8d6dd" opacity=".85"/>`;
  if(sweat)emotion+=`<path data-sweat-drop="forehead" d="M63,-91 Q42,-62 54,-56 Q77,-52 63,-91Z" fill="#a9cfd9" opacity=".88"/>`;
  const expressionArt=`<g data-facial-style="soft-pigment" data-expression-art="${expression}" transform="translate(${x} ${y}) scale(${r/100})">${emotion}${eyes}${mouth}</g>`;
  let whiskers='',features='',body='';
  const extras=random(seed^0x123456),stroke=(d,width=1.5,opacity=.55)=>`<path d="${d}" fill="none" stroke="${dark}" stroke-width="${width}" opacity="${opacity}" stroke-linecap="round"/>`;
  if(detail>0){
   for(const sign of [-1,1]){
    for(let j=0;j<Math.ceil(2*detail);j++)whiskers+=stroke(`M${x+sign*r*.32},${y+r*(.3+j*.07)} Q${x+sign*r*.64},${y+r*(.2+j*.15)} ${x+sign*r*(.82+extras()*.17)},${y+r*(.03+j*.22)}`,r*.012,.22);
    for(let j=0;j<3;j++)features+=ellipse(x+sign*r*(.2+extras()*.17),y+r*(.23+extras()*.2),r*.012,r*.014,dark,'opacity=".2"');

   }
   if(extras()>.5)features+=ellipse(x+noseShift,y+r*.28,r*.065,r*.035,'#d69d95');
  }
  for(const [cx,cy,rx,ry,opacity] of pose.paint){const q=map([cx,cy]);body+=ellipse(q[0],q[1],rx*match.scale,ry*match.scale,cream,`opacity="${opacity}" transform="rotate(${match.angle} ${q[0]} ${q[1]})"`);}
  for(const line of pose.shadows){const p=line.map(map);let d=`M${p[0]}`;for(let i=1;i<p.length-1;i++)d+=`Q${p[i]} ${(p[i][0]+p[i+1][0])/2},${(p[i][1]+p[i+1][1])/2}`;d+=`L${p.at(-1)}`;body+=stroke(d,Math.max(8,match.scale*13),.27);}
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" role="img" aria-label="${profile.name}小猫" data-coat="${profile.id}" data-expression="${expression}" data-marking="${mark}" data-mouth="${mouthChoice}" data-tongue="${tongue}" data-tears="${tears}" data-sweat="${sweat}"><defs>
  <clipPath id="${id}-clip"><path d="${d}"/></clipPath>
  <filter id="${id}-soft" filterUnits="userSpaceOnUse" x="-600" y="-600" width="1700" height="1700"><feGaussianBlur stdDeviation="${Math.max(5,match.scale*9)}"/></filter>
  <filter id="${id}-fur" filterUnits="userSpaceOnUse" x="-600" y="-600" width="1700" height="1700"><feGaussianBlur stdDeviation="${Math.max(2.4,r*.085)}"/></filter>
  <radialGradient id="${id}-head-fade"><stop stop-color="black" stop-opacity=".97"/><stop offset=".38" stop-color="black" stop-opacity=".88"/><stop offset=".73" stop-color="black" stop-opacity=".25"/><stop offset="1" stop-color="black" stop-opacity="0"/></radialGradient>
  <mask id="${id}-body-mask" maskUnits="userSpaceOnUse" x="-600" y="-600" width="1700" height="1700"><rect x="-600" y="-600" width="1700" height="1700" fill="white"/><ellipse cx="${x}" cy="${y}" rx="${r*2.1}" ry="${r*2.3}" fill="url(#${id}-head-fade)"/></mask>
  <linearGradient id="${id}-edge" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="${cream}" stop-opacity=".32"/><stop offset=".45" stop-color="${profile.shade}" stop-opacity=".12"/><stop offset="1" stop-color="${profile.shade}" stop-opacity=".34"/></linearGradient>
  <filter id="${id}-edge-soft" filterUnits="userSpaceOnUse" x="-600" y="-600" width="1700" height="1700"><feGaussianBlur in="SourceAlpha" stdDeviation="${Math.max(4,match.scale*7)}" result="soft-alpha"/><feOffset in="soft-alpha" dx="-1.5" dy="-2" result="lit-alpha"/><feComposite in="SourceAlpha" in2="lit-alpha" operator="out" result="inside-rim"/><feFlood flood-color="${profile.shade}" flood-opacity=".28" result="rim-color"/><feComposite in="rim-color" in2="inside-rim" operator="in"/></filter>
  <filter id="${id}-eye-ink" filterUnits="userSpaceOnUse" x="-150" y="-150" width="300" height="300"><feGaussianBlur stdDeviation="2"/></filter>
  <filter id="${id}-tiny" filterUnits="userSpaceOnUse" x="-600" y="-600" width="1700" height="1700"><feGaussianBlur stdDeviation="${Math.max(.7,r*.02)}"/></filter>
  <radialGradient id="${id}-body" cx="42%" cy="32%" r="70%"><stop stop-color="${cream}"/><stop offset=".48" stop-color="${coat}"/><stop offset="1" stop-color="${profile.shade}"/></radialGradient>
  <radialGradient id="${id}-face"><stop stop-color="${cream}" stop-opacity=".12"/><stop offset=".55" stop-color="${cream}" stop-opacity=".04"/><stop offset="1" stop-color="${coat}" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}-muzzle"><stop stop-color="${cream}" stop-opacity=".28"/><stop offset=".5" stop-color="${cream}" stop-opacity=".14"/><stop offset="1" stop-color="${cream}" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}-light"><stop stop-color="${cream}" stop-opacity=".75"/><stop offset="1" stop-color="${cream}" stop-opacity="0"/></radialGradient>
  </defs><g clip-path="url(#${id}-clip)"><path d="${d}" fill="url(#${id}-body)"/>
  <g mask="url(#${id}-body-mask)" filter="url(#${id}-soft)">${marks}</g>
  ${ellipse(b.x+b.w*.46,b.y+b.h*.55,b.w*.34,b.h*.42,`url(#${id}-light)`)}
  <g filter="url(#${id}-soft)" opacity=".12">${ellipse(b.x+b.w*.37,b.y+b.h*.31,b.w*.21,b.h*.18,'#fff9df')}${ellipse(b.x+b.w*.7,b.y+b.h*.52,b.w*.12,b.h*.21,'#ecc5cb')}</g>
  <g data-layer="body-paint" filter="url(#${id}-soft)">${body}${ears}</g><g transform="${faceTransform}">${ellipse(x,y,r*1.48,r*1.33,`url(#${id}-face)`)}
  <g data-layer="face-coat" data-pattern="${profile.face}" filter="url(#${id}-fur)">${faceMarks}</g>
  ${ellipse(x+r*.04,y+r*.43,r*.83,r*.66,`url(#${id}-muzzle)`)}
  <g filter="url(#${id}-tiny)"><g data-layer="tabby-markings"></g>${expressionArt}${features}${whiskers}
  <path d="M${x-r*.11+noseShift},${y+r*.26} Q${x},${y+r*.22} ${x+r*.11+noseShift},${y+r*.26} L${x+noseShift},${y+r*.37}Z" fill="${dark}"/>
  </g></g><path data-layer="inner-edge-shade" d="${d}" fill="white" filter="url(#${id}-edge-soft)"/></g></svg>`;
}
