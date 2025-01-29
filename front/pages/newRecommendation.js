import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const movieImages = {
  "A Tree of Palme (2002)": "https://image.tmdb.org/t/p/original/7ZJgUbuAsCAzg2Yav8eD5PqpHTN.jpg",
  "Aelita: The Queen of Mars (Aelita) (1924)": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0qa6x-PPlgas1VIBqP2Fm091LFrC3DfG3xg&s",
  "Afro Samurai (2007)": "https://upload.wikimedia.org/wikipedia/en/3/3e/Afro_vol1_english.jpg",
  "Agadah (2017)": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQI1a9wA2DJ8M2uHat_gWxEkIozLOcD0ck16w&s",
  "Along With the Gods: The Last 49 Days (2018)": "https://m.media-amazon.com/images/M/MV5BZDZjZDJhMTUtNmM5ZC00MzE4LTljZWEtNjFlODYzM2JhMjBiXkEyXkFqcGc@._V1_FMjpg_UX1000_.jpg"
};

const NewRecommendation = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [userId, setUserId] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // const storedUserId = localStorage.getItem('user_id');
    // if (!storedUserId) {
    //   // Redireciona para o login se o user_id não estiver no localStorage
    //   router.push('/');
    // } else {
    //   setUserId(storedUserId);
    // Comentando a requisição e colocando o mock de resposta
    // fetchRecommendations(storedUserId)
    mockFetchRecommendations();
    // }
  }, [router]);

  const mockFetchRecommendations = () => {
    const mockResponse = {
      "result": [
        {
          "_id": "678757c24f67247ea673ade4",
          "created_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "movie_id": "181099",
          "score": 3,
          "set": "primeira recomendação",
          "title": "A Tree of Palme (2002)",
          "updated_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "user_id": "67872e8a018aba39a5a7ff46"
        },
        {
          "_id": "678757c24f67247ea673ade5",
          "created_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "movie_id": "71999",
          "score": 3,
          "set": "primeira recomendação",
          "title": "Aelita: The Queen of Mars (Aelita) (1924)",
          "updated_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "user_id": "67872e8a018aba39a5a7ff46"
        },
        {
          "_id": "678757c24f67247ea673ade6",
          "created_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "movie_id": "139130",
          "score": 3,
          "set": "primeira recomendação",
          "title": "Afro Samurai (2007)",
          "updated_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "user_id": "67872e8a018aba39a5a7ff46"
        },
        {
          "_id": "678757c24f67247ea673ade7",
          "created_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "movie_id": "180975",
          "score": 3,
          "set": "primeira recomendação",
          "title": "Agadah (2017)",
          "updated_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "user_id": "67872e8a018aba39a5a7ff46"
        },
        {
          "_id": "678757c24f67247ea673ade8",
          "created_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "movie_id": "192749",
          "score": 3,
          "set": "primeira recomendação",
          "title": "Along With the Gods: The Last 49 Days (2018)",
          "updated_at": "Wed, 15 Jan 2025 06:37:54 GMT",
          "user_id": "67872e8a018aba39a5a7ff46"
        }
      ]
    };
    setRecommendations(mockResponse.result);
  };

  const fetchRecommendations = async (userId) => {
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
        setRecommendations(data.result);
      } else {
        console.error('Falha na requisição');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

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
                    <h3 style={styles.movieTitle}>{movie.title}</h3>
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
      </div>
    </main>
  );
};

const styles = {
  title: {
    fontSize: '2rem',
    marginBottom: '20px',
    color: '#333',
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
