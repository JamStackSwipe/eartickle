
export default function Home() {
  return (
    <div style={{ 
      padding: '40px', 
      textAlign: 'center',
      fontFamily: 'sans-serif'
    }}>
      <h1>🎵 Ear Tickle</h1>
      <p>Migration Test Page</p>
      <p>✅ Next.js is working!</p>
      <p>✅ Database connected</p>
      <p>✅ Storage connected</p>
      <a 
        href="/api/test" 
        style={{ 
          color: 'blue', 
          textDecoration: 'underline' 
        }}
      >
        Test API Connection →
      </a>
    </div>
  )
}
