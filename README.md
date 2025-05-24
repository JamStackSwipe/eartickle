# 🎧 EarTickle™

**Swipe. Stack. Play.**  
A music discovery and artist support platform where users build their JamStack™, upload original songs, and send Tickles™ (virtual gifts) to artists they love.

---

## 🚀 Features

- 🔐 GitHub + Email (Magic Link) login
- 👤 Profile page with avatar, bio, uploads, and live music stats
- 🎵 Upload original songs with cover art and MP3
- 🎧 Swipe screen for discovering and reacting to new music
- 📚 My Jams — your personal JamStack™
- 🔀 Jam Stacker — smart shuffle player for your saved songs
- 📊 Song stats: Views, Likes, 🔥 Fires, 😢 Sads, 🎯 Bullseyes, and 📦 Jams
- 🎁 Tickles™ rewards (coming soon)
- ⚙️ Admin features for artists to edit songs and profiles
- ☁️ Supabase backend for auth, DB, and storage
- 🖼 Tailwind CSS UI, Vercel CI/CD for live deploys

---

## 🧱 Tech Stack

- React + Vite
- Supabase (Auth, Database, File Storage)
- Tailwind CSS
- Vercel (Hosting + GitHub integration)

---

## 📁 Data Tables

- `songs`: title, artist, user_id, cover_url, mp3_url, views, likes, fires, sads, bullseyes, jams
- `jamstacksongs`: user_id, song_id
- `profiles`: display_name, bio, avatar_url, social links
- `rewards`: sender_id, receiver_id, song_id, amount, created_at

---

## 📦 File Storage Buckets

- `covers`: song artwork (JPG, PNG)
- `mp3s`: audio files (MP3)
- `avatars`: user-uploaded profile images

---

## 🧪 In Development

- ✅ Track engagement metrics and emoji reactions
- ✅ Display Jams (save counts) to artists
- ⏳ Shareable JamStacks and artist pages
- ⏳ Tickles gifting system with reward tiers
- ⏳ OAuth with Google and Spotify
- ⏳ Fan badges and swipe streaks

---

## 🛠️ Local Setup

```bash
git clone https://github.com/JamStackSwipe/eartickle.git
cd eartickle
npm install
npm run dev
```

Then set up your `.env` with:

```env
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_KEY=your_anon_key
```

---

## 🤝 Contributing

Got a song, feature idea, or UI tweak? Fork it, commit it, PR it. Let’s make EarTickle even better.

---

## 🪙 License

This project is licensed under a custom license created specifically for the EarTickle platform.
You are free to view and build upon the project under fair-use guidelines, but redistribution,
rebranding, or monetization without permission is not allowed.

See the full license text in [`LICENSE`](./LICENSE) for details.
