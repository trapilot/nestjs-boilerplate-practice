import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { ApiError } from '../../lib/apiError'

export function Login() {
  const navigate = useNavigate()
  const { login, loading, error } = useUser()
  const [email, setEmail] = useState(import.meta.env.VITE_APP_USERNAME || '')
  const [password, setPassword] = useState(import.meta.env.VITE_APP_USERPASS || '')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      const apiErr = ApiError.fromUnknown(err)
      setFieldErrors(apiErr.getErrors())
      apiErr.showError()
    }
  }

  const formStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    width: '300px',
    margin: '100px auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
  }

  const inputStyle: React.CSSProperties = {
    marginBottom: '1rem',
    padding: '0.5rem',
    fontSize: '1rem',
  }

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem',
    fontSize: '1rem',
    cursor: 'pointer',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
  }

  const errorStyle: React.CSSProperties = {
    color: 'red',
    marginBottom: '1rem',
  }

  return (
    <form onSubmit={handleLogin} style={formStyle}>
      <h2>Login</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        style={inputStyle}
        required
      />
      {fieldErrors.email && <p style={errorStyle}>{fieldErrors.email}</p>}
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        style={inputStyle}
        required
      />
      {fieldErrors.password && <p style={errorStyle}>{fieldErrors.password}</p>}
      {error && <p style={errorStyle}>{error}</p>}
      <button type="submit" style={buttonStyle} disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  )
}
