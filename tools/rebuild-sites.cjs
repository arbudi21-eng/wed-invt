// Re-derives sites/NN-name/index.html from designs/NN-name.html with lib/core.js (WedCore.build),
// using the same sample event the existing sites were built with.
// Usage: node tools/rebuild-sites.cjs [--check 15]   (--check: build from a given design and diff vs current site, no writes)
const fs=require('fs'),path=require('path'),vm=require('vm');
const root=path.join(__dirname,'..');
const sb={window:{},console};sb.window=sb;vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(root,'lib/core.js'),'utf8'),sb);
const W=sb.WedCore;
const wiring=fs.readFileSync(path.join(root,'templates/wiring.js'),'utf8');
const ev={names:['Amara','Dewa'],dateISO:'2027-03-13T10:00:00',
  gifts:[{bank:'BCA',name:'Amara Putri',no:'1234567890'}],
  schedule:{ceremony:'10:00',reception:'12:00'},
  venue:{name:'Your Venue Name',address:'Street address, City'},
  dress:{en:'Warm neutrals<small>Mocha, sand, clay, cream</small>',id:'Warna hangat<small>Mocha, pasir, terakota, krem</small>'}};
// WORKAROUND (core.js left untouched): WedCore.build step 7 uses a lazy regex that runs from `let pax=1` to the
// final `parse();` and so deletes the video/album/gifts/wishes JS that sits between them. Moving that block above
// `let pax=1` keeps it out of the match, which reproduces what the existing sites/ contain.
function stage(html){
  const a=html.indexOf('let pax=1;'),b=html.indexOf("const vd=$('#vid');"),e=html.lastIndexOf('parse();');
  if(a<0||b<0||b<a)return html;
  return html.slice(0,a)+html.slice(b,e)+html.slice(a,b)+html.slice(e);
}
const build=f=>W.build(stage(fs.readFileSync(f,'utf8')),ev,{},wiring);
module.exports={build};
if(require.main===module){
  const chk=process.argv.indexOf('--check');
  if(chk>0){const n=process.argv[chk+1],dir=fs.readdirSync(path.join(root,'sites')).find(d=>d.startsWith(n));
    const src=process.argv[chk+2]||path.join(root,'designs',dir+'.html');
    const r=build(src);fs.writeFileSync('/tmp/check-out.html',r.html);console.log('miss:',r.miss);
    console.log('identical to current site:',r.html===fs.readFileSync(path.join(root,'sites',dir,'index.html'),'utf8'));}
}
if(require.main===module&&process.argv.includes('--all')){
  const only=new Set(['25','28','29','31','32','33']); // hand-built, left alone
  let n=0;
  fs.readdirSync(path.join(root,'designs')).filter(f=>f.endsWith('.html')&&!only.has(f.slice(0,2))).forEach(f=>{
    const r=build(path.join(root,'designs',f));if(r.miss.length)throw new Error(f+' miss '+r.miss);
    fs.writeFileSync(path.join(root,'sites',f.replace('.html',''),'index.html'),r.html);n++;
  });
  console.log('rebuilt',n,'sites');
}
