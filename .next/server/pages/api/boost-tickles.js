"use strict";(()=>{var e={};e.id=271,e.ids=[271],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3610:e=>{e.exports=import("@vercel/postgres")},6249:(e,t)=>{Object.defineProperty(t,"l",{enumerable:!0,get:function(){return function e(t,r){return r in t?t[r]:"then"in t&&"function"==typeof t.then?t.then(t=>e(t,r)):"function"==typeof t&&"default"===r?t:void 0}}})},1231:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.r(t),r.d(t,{config:()=>u,default:()=>c,routeModule:()=>d});var o=r(1802),s=r(7153),i=r(6249),a=r(1117),l=e([a]);a=(l.then?(await l)():l)[0];let c=(0,i.l)(a,"default"),u=(0,i.l)(a,"config"),d=new o.PagesAPIRouteModule({definition:{kind:s.x.PAGES_API,page:"/api/boost-tickles",pathname:"/api/boost-tickles",bundlePath:"",filename:""},userland:a});n()}catch(e){n(e)}})},1117:(e,t,r)=>{r.a(e,async(e,n)=>{try{r.r(t),r.d(t,{default:()=>i});var o=r(3610),s=e([o]);async function i(e,t){if("POST"!==e.method)return console.error("❌ Invalid method"),t.status(405).json({error:"Method Not Allowed"});try{let{user_id:r,artist_id:n,song_id:s,amount:i,reason:a}=e.body;console.log("⚡ Boost Tickles Request:",e.body);let{rows:l}=await (0,o.sql)`
      SELECT tickle_balance 
      FROM profiles 
      WHERE id = ${r}
    `;if(!l.length||l[0].tickle_balance<i)return t.status(400).json({error:"Insufficient Tickles"});return await (0,o.sql)`
      UPDATE profiles 
      SET tickle_balance = tickle_balance - ${i}
      WHERE id = ${r}
    `,n&&n!==r&&await (0,o.sql)`
        UPDATE profiles 
        SET tickle_balance = tickle_balance + ${i}
        WHERE id = ${n}
      `,await (0,o.sql)`
      INSERT INTO tickle_transactions (sender_id, receiver_id, song_id, amount)
      VALUES (${r}, ${n}, ${s}, ${i})
    `,await (0,o.sql)`
      UPDATE songs 
      SET score = score + ${10*i}
      WHERE id = ${s}
    `,console.log("✅ Boost successful"),t.status(200).json({success:!0})}catch(e){return console.error("❌ Uncaught error in boost-tickles:",e),t.status(500).json({error:"Internal Server Error"})}}o=(s.then?(await s)():s)[0],n()}catch(e){n(e)}})},7153:(e,t)=>{var r;Object.defineProperty(t,"x",{enumerable:!0,get:function(){return r}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(r||(r={}))},1802:(e,t,r)=>{e.exports=r(145)}};var t=require("../../webpack-api-runtime.js");t.C(e);var r=t(t.s=1231);module.exports=r})();