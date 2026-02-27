import Link from "next/link"

export default function Home() {
  return (
    <div>
      <h1>Card Clash</h1>
      <p>Test your knowledge against others in real time.</p>

      <div>
        <Link href="/login">Login</Link>
        <br />
        <Link href="/register">Register</Link>
      </div>
    </div>
  )
}