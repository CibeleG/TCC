import React, { useState } from 'react';
import { useRouter } from 'next/router';

const Login = () => {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5010/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Login successful:', data);

        // Salvar o user_id no localStorage
        if (data.user_id) {
          localStorage.setItem('user_id', data.user_id);
        }

        // Redirecionar com base no status retornado
        if (data.status === 'novo') {
          router.push('/genres');
        } else if (data.status === 'existente') {
          router.push('/recommendation');
        }
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Login</h2>
        <label htmlFor="email" style={styles.label}>Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="email@gmail.com"
          style={styles.input}
        />
        <button type="submit" style={styles.button}>
          Entrar
        </button>
      </form>
      <style jsx>{`
        main {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #d5f5da;
        }
        .Home_container__d256j{
          padding: 10.8rem 0;
          background-color: #d5f5da;
        }
        code {
          background: #fafafa;
          border-radius: 5px;
          padding: 0.75rem;
          font-size: 1.1rem;
          font-family:
            Menlo,
            Monaco,
            Lucida Console,
            Liberation Mono,
            DejaVu Sans Mono,
            Bitstream Vera Sans Mono,
            Courier New,
            monospace;
        }
      `}</style>
    </div>
  );
};

const styles = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    width: '350px',
    padding: '30px',
    border: '2px solid #0f4d0f',
    borderRadius: '8px',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
    marginTop: 0,
  },
  label: {
    alignSelf: 'flex-start',
    marginBottom: '10px',
    fontSize: '1rem',
    color: '#333',
    width: '100%',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '1rem',
    width: '100%',
  },
  button: {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    backgroundColor: '#5ce65c', // Botão verde
    color: '#fff',
    fontSize: '1rem',
    cursor: 'pointer',
    width: '100%',
  },
};

export default Login;
