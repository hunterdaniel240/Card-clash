"use client"

import { useState } from "react"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    console.log("Register attempt:", { username, email, password })
  }

  return (
    <div>
      <h1>Register</h1>

      <form onSubmit={handleRegister}>
        <div>
          <label>Username</label>
          <br />
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div>
          <label>Email</label>
          <br />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit">Create Account</button>
      </form>
    </div>
  )
}