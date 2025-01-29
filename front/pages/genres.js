import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const genresList = [
  { en: 'Comedy', pt: 'Comédia' },
  { en: 'Crime', pt: 'Crime' },
  { en: 'Drama', pt: 'Drama' },
  { en: 'Thriller', pt: 'Suspense' },
  { en: 'War', pt: 'Guerra' },
  { en: 'Musical', pt: 'Musical' },
  { en: 'Romance', pt: 'Romance' },
  { en: 'Adventure', pt: 'Aventura' },
  { en: 'Film-Noir', pt: 'Film-Noir' },
  { en: 'Sci-Fi', pt: 'Ficção Científica' },
  { en: 'Western', pt: 'Faroeste' },
  { en: 'Fantasy', pt: 'Fantasia' },
  { en: 'Mystery', pt: 'Mistério' },
  { en: 'Children', pt: 'Infantil' },
  { en: 'Action', pt: 'Ação' },
  { en: 'Documentary', pt: 'Documentário' },
  { en: 'Animation', pt: 'Animação' },
  { en: 'Horror', pt: 'Terror' },
  { en: 'IMAX', pt: 'IMAX' }
];

const Genres = () => {
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState(null); // Usado para armazenar o user_id
  const router = useRouter();

//   useEffect(() => {
//     if (typeof window !== "undefined") {
//       // Garantir que o código só execute no lado do cliente
//       const storedUserId = localStorage.getItem('user_id');
//       if (storedUserId) {
//         setUserId(storedUserId);
//       } else {
//         // Se o user_id não estiver no localStorage, redireciona para o login
//         router.push('/');
//       }
//     }
//   }, [router]);

  const handleChange = (genre) => {
    setSelectedGenres((prevGenres) => {
      if (prevGenres.includes(genre)) {
        return prevGenres.filter((g) => g !== genre); // Remove a seleção
      } else {
        return [...prevGenres, genre]; // Adiciona a seleção
      }
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Verificar se o número de gêneros selecionados está entre 3 e 5
    if (selectedGenres.length < 3 || selectedGenres.length > 5) {
      setError('Por favor, selecione entre 3 e 5 gêneros.');
      return;
    }

    // Armazenar os gêneros selecionados no localStorage
    localStorage.setItem('selected_genres', JSON.stringify(selectedGenres));

    // Converter os gêneros selecionados para o formato em inglês
    const genresInEnglish = selectedGenres.map((genre) => {
      const genreObject = genresList.find((g) => g.pt === genre);
      return genreObject ? genreObject.en : genre;
    });

    try {
      const response = await fetch(`http://127.0.0.1:5010/genres/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genres: genresInEnglish }), // Envia os gêneros em inglês para o backend
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Gêneros enviados com sucesso:', data);

        // Redirecionar para a página de newRecommendation
        router.push('/newRecommendation');
      } else {
        console.error('Falha na requisição');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

//   if (!userId) {
//     return null; // Evita renderizar a página até que o userId seja obtido
//   }

  return (
    <main className="Home_container__d256j">
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Escolha seus gêneros favoritos</h2>
        <p style={styles.text}>Selecione entre 3 a 5 gêneros:</p>

        <div style={styles.grid}>
          {genresList.map((genre, index) => (
            <div key={genre.en} style={styles.checkboxContainer}>
              <input
                type="checkbox"
                id={genre.en}
                name={genre.en}
                value={genre.pt}
                onChange={() => handleChange(genre.pt)} // Passa o nome em português
                style={styles.checkbox}
              />
              <label htmlFor={genre.en} style={styles.label}>
                {genre.pt} {/* Exibe o nome em português */}
              </label>
            </div>
          ))}
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" style={styles.button}>
          Finalizar
        </button>
      </form>
      <style jsx>{`
        main {
          padding: 3.9rem 0;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background-color: #d5f5da;
        }
        .Home_container__d256j{
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

      <style jsx global>{`
        html,
        body {
          padding: 0;
          margin: 0;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            Segoe UI,
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            Fira Sans,
            Droid Sans,
            Helvetica Neue,
            sans-serif;
        }
        * {
          box-sizing: border-box;
        }
      `}</style>
    </main>
  );
};

const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column',
      width: '550px', // Aumenta a largura do formulário
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
    },
    text: {
      fontSize: '1rem',
      color: '#333',
      marginBottom: '20px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)', // 4 colunas
      gap: '15px',
      width: '100%',
      marginBottom: '20px',
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
    },
    checkbox: {
      marginRight: '10px',
    },
    label: {
      fontSize: '1rem',
      color: '#333',
    },
    error: {
      color: 'red',
      marginTop: '10px',
    },
    button: {
      padding: '10px',
      borderRadius: '4px',
      border: 'none',
      backgroundColor: '#5ce65c',
      color: '#fff',
      fontSize: '1rem',
      cursor: 'pointer',
      width: '100%',
      marginTop: '20px',
    },
};
  
  
export default Genres;
  