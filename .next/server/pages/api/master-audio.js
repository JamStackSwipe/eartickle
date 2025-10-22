"use strict";(()=>{var e={};e.id=594,e.ids=[594],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},8747:e=>{e.exports=import("@vercel/blob")},3610:e=>{e.exports=import("@vercel/postgres")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},9431:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{config:()=>l,default:()=>d,routeModule:()=>c});var o=r(1802),s=r(7153),i=r(6249),n=r(7734),u=e([n]);n=(u.then?(await u)():u)[0];let d=(0,i.l)(n,"default"),l=(0,i.l)(n,"config"),c=new o.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/master-audio",pathname:"/api/master-audio",bundlePath:"",filename:""},userland:n});a()}catch(e){a(e)}})},7734:(e,t,r)=>{r.a(e,async(e,a)=>{try{r.r(t),r.d(t,{config:()=>u,default:()=>n});var o=r(3610),s=r(8747),i=e([o,s]);[o,s]=i.then?(await i)():i;let u={api:{bodyParser:{sizeLimit:"50mb"}}};async function n(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed"});let{songId:r,preset:a,userId:i}=e.body;if(!i)return t.status(401).json({error:"Unauthorized"});try{let{rows:e}=await (0,o.sql)`
      SELECT audio_url 
      FROM songs 
      WHERE id = ${r}
    `;if(!e.length)return t.status(404).json({error:"Song not found"});let n=e[0],{rows:u}=await (0,o.sql)`
      INSERT INTO mastering_jobs (song_id, user_id, preset, status)
      VALUES (${r}, ${i}, ${a}, 'processing')
      RETURNING id
    `,d=u[0].id;try{let e=await fetch(n.audio_url);if(!e.ok)throw Error("Failed to download original audio");let i=await e.arrayBuffer();console.log("Processing audio with preset:",a);let u=`mastered-${r}-${a}-${Date.now()}.mp3`,l=await (0,s.put)(u,i,{access:"public",addRandomSuffix:!1});return await (0,o.sql)`
        UPDATE mastering_jobs
        SET status = 'completed', 
            mastered_audio_url = ${l.url},
            completed_at = NOW()
        WHERE id = ${d}
      `,t.status(200).json({masteredUrl:l.url,jobId:d})}catch(e){return console.error("Mastering error:",e.message),await (0,o.sql)`
        UPDATE mastering_jobs
        SET status = 'failed', 
            error_message = ${e.message}
        WHERE id = ${d}
      `,t.status(500).json({error:"Mastering failed: "+e.message})}}catch(e){return console.error("Database error:",e.message),t.status(500).json({error:"Database error"})}}a()}catch(e){a(e)}})},7153:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},1802:(e,t,r)=>{e.exports=r(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var r=t(t.s=9431);module.exports=r})();