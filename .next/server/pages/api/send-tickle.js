"use strict";(()=>{var e={};e.id=416,e.ids=[416],e.modules={145:e=>{e.exports=require("next/dist/compiled/next-server/pages-api.runtime.prod.js")},3610:e=>{e.exports=import("@vercel/postgres")},6249:(e,r)=>{Object.defineProperty(r,"l",{enumerable:!0,get:function(){return function e(r,t){return t in r?r[t]:"then"in r&&"function"==typeof r.then?r.then(r=>e(r,t)):"function"==typeof r&&"default"===t?r:void 0}}})},2769:(e,r,t)=>{t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{config:()=>c,default:()=>u,routeModule:()=>d});var a=t(1802),n=t(7153),i=t(6249),o=t(5667),l=e([o]);o=(l.then?(await l)():l)[0];let u=(0,i.l)(o,"default"),c=(0,i.l)(o,"config"),d=new a.PagesAPIRouteModule({definition:{kind:n.x.PAGES_API,page:"/api/send-tickle",pathname:"/api/send-tickle",bundlePath:"",filename:""},userland:o});s()}catch(e){s(e)}})},5667:(e,r,t)=>{t.a(e,async(e,s)=>{try{t.r(r),t.d(r,{default:()=>o});var a=t(3610),n=t(6620),i=e([a]);async function o(e,r){if("POST"!==e.method)return r.status(405).json({error:"Method not allowed"});try{let{song_id:t,emoji:s,artist_id:i}=e.body;if(!t||!s)return r.status(400).json({error:"Missing required fields",details:t?"Missing emoji":"Missing song_id"});let o=e.headers.authorization?.replace("Bearer ","");if(!o)return r.status(401).json({error:"Authorization token required"});let{data:{user:l},error:u}=await n.O.auth.getUser(o);if(u||!l)return r.status(401).json({error:"Invalid authentication",details:u?.message});let c=l.id,{rows:d}=await (0,a.sql)`
      SELECT tickle_balance 
      FROM profiles 
      WHERE id = ${c}
    `;if(!d.length||d[0].tickle_balance<1)return r.status(400).json({error:"Insufficient Tickles"});let{rows:E}=await (0,a.sql)`
      SELECT user_id 
      FROM songs 
      WHERE id = ${t}
    `;if(!E.length)return r.status(404).json({error:"Song not found"});let f=i||E[0].user_id;if(c===f)return r.status(400).json({error:"Cannot send Tickles to yourself"});return await (0,a.sql)`
      UPDATE profiles 
      SET tickle_balance = tickle_balance - 1
      WHERE id = ${c}
    `,await (0,a.sql)`
      UPDATE profiles 
      SET tickle_balance = tickle_balance + 1
      WHERE id = ${f}
    `,await (0,a.sql)`
      INSERT INTO tickle_transactions (sender_id, receiver_id, song_id, amount)
      VALUES (${c}, ${f}, ${t}, 1)
    `,await (0,a.sql)`
      UPDATE songs 
      SET score = score + 10
      WHERE id = ${t}
    `,console.log("✅ Tickle sent:",{senderId:c,receiverId:f,song_id:t}),r.status(200).json({success:!0,message:"Tickle sent successfully"})}catch(e){return console.error("Server Error:",{message:e.message,stack:e.stack}),r.status(500).json({error:"Internal server error",details:void 0})}}a=(i.then?(await i)():i)[0],s()}catch(e){s(e)}})},6620:(e,r,t)=>{t.d(r,{O:()=>i});let s=require("@supabase/supabase-js"),a=process.env.REACT_APP_SUPABASE_URL,n=process.env.REACT_APP_SUPABASE_KEY;if(console.log("Supabase URL:",a),console.log("Supabase Key:",n?"Set (hidden)":"undefined"),!a)throw Error("Supabase URL is required");if(!n)throw Error("Supabase Key is required");let i=(0,s.createClient)(a,n,{global:{headers:{Accept:"application/json"}}})},7153:(e,r)=>{var t;Object.defineProperty(r,"x",{enumerable:!0,get:function(){return t}}),function(e){e.PAGES="PAGES",e.PAGES_API="PAGES_API",e.APP_PAGE="APP_PAGE",e.APP_ROUTE="APP_ROUTE"}(t||(t={}))},1802:(e,r,t)=>{e.exports=t(145)}};var r=require("../../webpack-api-runtime.js");r.C(e);var t=r(r.s=2769);module.exports=t})();