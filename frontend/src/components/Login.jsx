import { useState } from "react";
import { supabase } from "../supabaseClient";

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setLoading(false);
    }
  };

  return (
    <div style={container}>
      <div style={card}>

        <h2 style={title}>
          TALLER <span style={{ color: "#FFB74D" }}>PROD</span>
        </h2>

        <p style={subtitle}>Ingreso al sistema</p>

        <input
          style={input}
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <input
          style={input}
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <button style={button} onClick={handleLogin} disabled={loading}>
          {loading ? "Ingresando..." : "Ingresar"}
        </button>

        {error && <p style={errorText}>{error}</p>}

      </div>
    </div>
  );
}

const container = {
  height: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#0D0D0D"
};

const card = {
  width: "90%",
  maxWidth: 320,
  background: "#111",
  padding: 20,
  borderRadius: 12,
  border: "1px solid #2A2A2A",
  display: "flex",
  flexDirection: "column",
  gap: 12,
  boxShadow: "0 0 20px rgba(0,0,0,0.5)"
};

const title = {
  margin: 0,
  textAlign: "center",
  fontFamily: "'Bebas Neue', sans-serif",
  letterSpacing: "0.15em",
  color: "#E8E0D0"
};

const subtitle = {
  margin: 0,
  fontSize: 12,
  color: "#666",
  textAlign: "center"
};

const input = {
  padding: 10,
  borderRadius: 8,
  border: "1px solid #2A2A2A",
  background: "#1A1A1A",
  color: "#E8E0D0",
  outline: "none"
};

const button = {
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "#FFB74D",
  color: "#0D0D0D",
  fontWeight: "bold",
  cursor: "pointer",
  marginTop: 5
};

const errorText = {
  color: "#EF5350",
  fontSize: 12,
  textAlign: "center"
};

export default Login;