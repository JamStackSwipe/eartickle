# Hot Seat Feedback Feature Design Notes

## Overview
- **Purpose**: Allow artists to upload songs and receive feedback from AI or real users, earning Tickles for giving feedback.
- **Goal**: Foster community interaction, inspire artists, and make feedback inclusive (no buying required).
- **Tone**: Friendly, supportive, like a constructive critique session.

## Frontend Components
1. **Hot Seat Upload Button (Artist View)**
   - Location: Profile Page (“My Uploads” section, next to each song).
   - UI: Button with `#3FD6CD` background, e.g., “🔥 Submit to Hot Seat”.
   - Action: Opens a modal to confirm song submission for feedback.
   - Props: `songId`, `userId`.

2. **Hot Seat Modal**
   - UI: Centered modal with `#3FD6CD` accents.
   - Content:
     - Song title and preview (audio player).
     - Option: “Request AI Feedback” or “Request Community Feedback”.
     - Submit button (`#3FD6CD`) to queue the song.
   - State: Tracks submission type (AI or community).

3. **Hot Seat Feedback Page**
   - Path: `/hot-seat` (new route).
   - UI: TikTok-style scrolling list of songs awaiting feedback.
   - Card:
     - Song title, artist, preview player.
     - Feedback form: Textarea for comments, 1-5 star rating.
     - Submit button (`#3FD6CD`) to send feedback and earn 1 Tickle.
   - Filters: Toggle “AI Feedback” or “Community Feedback” songs.
   - Props: `userId` (to award Tickles), `songId`.

4. **Feedback Display (Artist View)**
   - Location: Profile Page, new “Song Feedback” tab for each uploaded song.
   - UI: List of feedback entries with user/AI name, rating, and comment.
   - Action: Artist can reply with a thank-you emoji (e.g., 🙌).

## User Flow
1. Artist submits a song to Hot Seat from Profile Page.
2. Song appears in `/hot-seat` for users or AI to review.
3. User provides feedback (comment + rating), earns 1 Tickle.
4. Artist views feedback in Profile Page and can reply.

## Mockup Notes
- Use `#3FD6CD` for buttons, borders, and accents.
- White cards with shadows, rounded corners, gradient background (`from-gray-100 to-gray-200`).
- Responsive: Stack on mobile, grid on desktop.
- Emojis (🔥, 🙌) for vibe, matching Genre Flavors (🤠, 🎤).

## Next Steps
- Build Hot Seat Upload Button and Modal (React components).
- Create `/hot-seat` route and Feedback Page.
- Integrate Tickle rewards (backend RPC to award 1 Tickle).
- Add AI feedback stub (placeholder for future integration).
