<SongCard
  song={song}
  onSwipeLeft={() => playSound('meh')}
  onSwipeRight={() => handleAddToJamStack(song.id)}
  autoplay={true}
  showStats={true}
  enableSwipe={true}
/>
