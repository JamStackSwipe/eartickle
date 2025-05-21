# 🎧 EarTickle™

**Swipe. Stack. Play.**  
A music discovery and rewards platform where users build their JamStack™, upload original songs, and send Tickles™ to support artists.

---

## 🚀 Features

- 🔐 GitHub + Email (Magic Link) login
- 👤 Profile page with user stats
- 🎵 Upload songs with cover image and MP3 support
- 🎧 Swipe to discover new music
- 📚 JamStack viewer (your saved tracks)
- 🎁 Tickles reward system (send + receive virtual gifts)
- 📊 Rewards dashboard: see Tickles sent and earned
- 🖼 Tailwind-powered responsive UI
- ☁️ Supabase for auth, DB, and file storage
- 🔄 Live deployment via Vercel + GitHub CI/CD

---

## 🧱 Tech Stack

- React + Vite
- Supabase (DB, Auth, Storage)
- Tailwind CSS
- Vercel (Hosting + GitHub Deploys)

---

## 📁 Data Tables

- `songs`: title, artist, user_id, cover_url, mp3_url
- `jamstacksongs`: user_id, song_id, order
- `rewards`: sender_id, receiver_id, song_id, amount, created_at
- `profiles`: user info and metadata

---

## 📦 File Storage Buckets

- `covers`: album art (jpg, png)
- `mp3s`: audio uploads (mp3)

---

## 🧪 Coming Soon

- Google + Spotify OAuth
- Send Tickles from Swipe view
- My Uploads viewer
- Track engagement metrics (swipes, likes, etc)
- Shareable JamStacks

---

## 🛠️ Local Setup

```bash
git clone https://github.com/JamStackSwipe/eartickle.git
cd eartickle
npm install
npm run dev
```

Set environment variables in `.env` for Supabase URL + anon key.

---

## 🤝 Contributing

Have a track to upload, feature idea, or UI tweak? Fork it, push it, open a PR.

---

## 🪙 License

MIT — use it, remix it, build something better with it.
