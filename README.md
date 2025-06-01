# 🎷 EarTickle™

**Scroll. Stack. Play.**  
A mobile-first music discovery and artist support platform where users explore original tracks, build their JamStack™, and send Tickles™ (virtual gifts) to artists.

---

## 🚀 Features

- 🔐 GitHub + Spotify Login + Google Login
- 👤 Profile page: avatar, bio, uploads, stats, My JamStack
- 🎵 Upload original songs with cover art + MP3
- 🎧 Swipe to discover music, tap to react
- 📂 JamStack™: save favorite songs with one tap
- 🔀 Stacker: autoplay your JamStack playlist
- 📊 Charts: ranked by score, views, and jams
- 🏱 Reaction emojis: 🔥 Fires, ❤️ Loves, 😢 Sads, 🎯 Bullseyes
- 📥 Track views, jams, and reactions in real-time
- 🏰 Stripe Connect: Artists receive Tickles as rewards
- ✨ Fully responsive + mobile-first Tailwind UI

---

## 🧱 Tech Stack

- React (Create React App)
- Supabase (Auth, Database, File Storage)
- Tailwind CSS
- Vercel (CI/CD + hosting)
- Stripe (Connect for payouts)
- react-hot-toast, lucide-react, framer-motion

---

## 📂 Folder Structure

```bash
src/
├── components/
│   ├── SongCard.js
│   ├── ReactionStatsBar.js
│   ├── AddToJamStackButton.js
│   └── AuthProvider.js
├── screens/
│   ├── SwipeScreen.js
│   ├── ProfileScreen.js
│   ├── ChartsScreen.js
│   ├── StackerScreen.js
│   └── RewardsScreen.js
├── utils/
│   └── tickleSound.js
└── supabase.js
```

---

## 📝 Database Tables

- `songs`: id, title, artist, user_id, cover, audio, views, jams, score, emoji stats, stripe_account_id
- `profiles`: id, display_name, avatar_url, bio, tickle_balance
- `jamstacksongs`: user_id, song_id
- `rewards`: sender_id, receiver_id, song_id, amount, emoji, created_at
- `song_reactions`: user_id, song_id, emoji

---

## 📁 Buckets (File Storage)

- `covers`: Song artwork (JPG, PNG)
- `mp3s`: Audio files (MP3)
- `avatars`: Profile pictures

---

## 🤔 Development Setup

```bash
git clone https://github.com/JamStackSwipe/eartickle.git
cd eartickle
npm install
npm start
```

### ⚖️ Environment Variables

```env
REACT_APP_SUPABASE_URL=your_project_url
REACT_APP_SUPABASE_KEY=your_anon_key
```

---

## 🛠️ Roadmap (Next Up)

- [ ] Full Tickle history view (sent + received)
- [ ] Artist dashboard for earnings + uploads
- [ ] Licensing options / downloads
- [ ] Swipe streaks, badges, and achievements
- [ ] Mobile-native wrapper (PWA or React Native)

---

## 🤝 Contributing

Have a song idea, bug fix, or feature suggestion? Fork it, commit it, and open a PR.

---

## 💰 License

Custom EarTickle License: view, remix, and contribute fairly. No rebranding, resale, or redistribution without permission.

See [`LICENSE`](./LICENSE) for details.
