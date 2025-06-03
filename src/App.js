function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} /> {/* ✅ Set homepage */}
        <Route path="/auth" element={<LoginScreen />} />
        <Route path="/swipe" element={<SwipeScreen />} />
        <Route path="/upload" element={<UploadScreen />} />
        <Route path="/stacker" element={<JamStackScreen />} />
        <Route path="/rewards" element={<RewardsScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/charts" element={<ChartsScreen />} />
        <Route path="/artist/:id" element={<ArtistProfileScreen />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
      </Routes>
      <FooterGlobal />
    </>
  );
}
