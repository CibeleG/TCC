import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const OMDB_API_KEY = '7e322e72';

const NewRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [movieImages, setMovieImages] = useState({});
  const [userId, setUserId] = useState(null);
  const [status, setStatus] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    const storedStatus = localStorage.getItem('status');
    setStatus(storedStatus);
    if (!storedUserId) {
      // Redireciona para o login se o user_id não estiver no localStorage
      router.push('/');
    } else {
      setUserId(storedUserId);
      if (status === 'novo') {
        fetchNewUserRecommendations(storedUserId)
      } else if (status === 'existente') {
        fetchOldUserRecommendations(storedUserId)
      }
    }
  }, [router]);

  const fetchNewUserRecommendations = async (userId) => {
    try {
      const genres = JSON.parse(localStorage.getItem('selected_genres') || '[]');
      const response = await fetch(`http://127.0.0.1:5010/recommendation/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ genres }),
      });

      if (response.ok) {
        const data = await response.json();
        processRecommendations(data.result);
      } else {
        console.error('Falha na requisição');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const fetchOldUserRecommendations = async (userId) => {
    try {
      const response = await fetch(`http://127.0.0.1:5010/recommendation/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        processRecommendations(data.result);
      } else {
        console.error('Falha na requisição');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const processRecommendations = async (movies) => {
    setRecommendations(movies);
    const images = {};
    for (const movie of movies) {
      const formattedTitle = formatMovieTitle(movie.title);
      const posterUrl = await fetchMoviePoster(formattedTitle);
      images[movie.title] = posterUrl;
    }
    setMovieImages(images);
  };

  const fetchMoviePoster = async (title) => {
    try {
      const response = await fetch(`http://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(title)}`);
      const data = await response.json();
      return data.Poster || '';
    } catch (error) {
      console.error('Erro ao buscar imagem:', error);
      return '';
    }
  };

  function formatMovieTitle(title) {
    // Remove o conteúdo dentro dos parênteses (ex: " (1995)")
    title = title.replace(/\s*\(\d{4}\)/, '');
  
    // Reorganiza títulos com vírgula (ex: "Misérables, Les" -> "Les Misérables")
    if (title.includes(',')) {
      const parts = title.split(', ');
      return `${parts[1]} ${parts[0]}`;
    }
  
    return title;
  }

  return (
    <main style={styles.container}>
      <h2 style={styles.title}>Recomendações de Filmes</h2>
      <div style={styles.grid}>
        {recommendations.map((movie) => (
          <div key={movie._id} style={styles.movieCard}>
            <img
              src={movieImages[movie.title] || ''}
              alt={movie.title}
              style={styles.movieImage}
            />
            <h3 style={styles.movieTitle}>{formatMovieTitle(movie.title)}</h3>
          </div>
        ))}
        <style jsx>{`
            main {
                padding: 4.9rem 0;
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                background-color: #d5f5da;
            }
            body {
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
            background-color: #d5f5da;
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
      </div>
    </main>
  );
};

const styles = {
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
    marginLeft: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)', // 5 colunas
    gap: '20px',
    width: '100%',
    padding: '20px',
  },
  movieCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  movieImage: {
    width: '150px',
    height: '225px',
    objectFit: 'cover',
    borderRadius: '5px',
  },
  movieTitle: {
    fontSize: '1rem',
    marginTop: '10px',
    color: '#333',
    fontWeight: 'bold',
  },
};

export default NewRecommendation;
