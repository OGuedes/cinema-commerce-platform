import { useEffect, useState } from "react";
import "./App.css";

type Movie = {
  id: number;
  name: string;
  posterUrl: string;
  unitPrice: number;
};

type Order = {
  id: number;
  movieName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
};

const movies: Movie[] = [
  {
    id: 1,
    name: "Interestelar",
    posterUrl: "/posters/interstellar.jpg",
    unitPrice: 32,
  },
  {
    id: 2,
    name: "Batman",
    posterUrl: "/posters/batman.jpg",
    unitPrice: 34,
  },
  {
    id: 3,
    name: "Vingadores",
    posterUrl: "/posters/avengers.jpg",
    unitPrice: 30,
  },
  {
    id: 4,
    name: "Resident Evil",
    posterUrl: "/posters/resident-evil.jpg",
    unitPrice: 36,
  },
];

function App() {
  const [selectedMovieId, setSelectedMovieId] = useState(movies[0].id);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);

  const activeMovie = movies[activeSlideIndex];
  const visibleMovies = Array.from(
    { length: Math.min(2, movies.length) },
    (_, position) => movies[(activeSlideIndex + position) % movies.length],
  );
  const selectedMovie =
    movies.find((movie) => movie.id === selectedMovieId) ?? movies[0];

  const currentOrderValue = selectedMovie.unitPrice * ticketQuantity;

  const totalRevenue = orders.reduce(
    (currentTotal, order) => currentTotal + order.totalValue,
    0,
  );

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isManuallyPaused || isInteracting || prefersReducedMotion) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) =>
        currentIndex === movies.length - 1 ? 0 : currentIndex + 1,
      );
    }, 10000);

    return () => window.clearInterval(timer);
  }, [isInteracting, isManuallyPaused]);

  function showPreviousMovie() {
    setActiveSlideIndex((currentIndex) =>
      currentIndex === 0 ? movies.length - 1 : currentIndex - 1,
    );
  }

  function showNextMovie() {
    setActiveSlideIndex((currentIndex) =>
      currentIndex === movies.length - 1 ? 0 : currentIndex + 1,
    );
  }

  function selectMovie(movieId: number) {
    setSelectedMovieId(movieId);
  }

  function registerOrder() {
    if (ticketQuantity < 1) {
      alert("Informe pelo menos um ingresso.");
      return;
    }

    const newOrder: Order = {
      id: Date.now(),
      movieName: selectedMovie.name,
      quantity: ticketQuantity,
      unitPrice: selectedMovie.unitPrice,
      totalValue: currentOrderValue,
    };

    setOrders((currentOrders) => [...currentOrders, newOrder]);
    setTicketQuantity(1);
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <h1>Cinema Commerce</h1>
        <p>Escolha um filme, defina os ingressos e confirme seu pedido.</p>
      </header>

      <section
        className="booking-layout"
        aria-labelledby="movie-selection-title"
      >
        <div className="movie-selection">
          <div className="section-heading">
            <h2 id="movie-selection-title">Filmes em cartaz</h2>
          </div>

          <div
            className="carousel"
            onMouseEnter={() => setIsInteracting(true)}
            onMouseLeave={() => setIsInteracting(false)}
            onFocusCapture={() => setIsInteracting(true)}
            onBlurCapture={() => setIsInteracting(false)}
          >
            <div className="carousel-track">
              {visibleMovies.map((movie) => (
                <button
                  key={movie.id}
                  type="button"
                  className={`carousel-slide${
                    movie.id === selectedMovieId ? " selected" : ""
                  }`}
                  aria-pressed={movie.id === selectedMovieId}
                  onClick={() => selectMovie(movie.id)}
                >
                  <img src={movie.posterUrl} alt={`Pôster de ${movie.name}`} />
                  <span className="slide-shade" aria-hidden="true" />
                  <span className="slide-copy">
                    <strong>{movie.name}</strong>
                    <span>Ingressos a R$ {movie.unitPrice.toFixed(2)}</span>
                    <b>
                      {movie.id === selectedMovieId
                        ? "Filme selecionado"
                        : "Clique para selecionar"}
                    </b>
                  </span>
                </button>
              ))}
            </div>

            <div className="carousel-controls">
              <button
                type="button"
                className="carousel-arrow"
                aria-label="Mostrar filme anterior"
                onClick={showPreviousMovie}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" />
                </svg>
              </button>

              <div className="carousel-dots" aria-label="Escolha um slide">
                {movies.map((movie, index) => (
                  <button
                    key={movie.id}
                    type="button"
                    className={index === activeSlideIndex ? "active" : ""}
                    aria-label={`Mostrar ${movie.name}`}
                    aria-current={
                      index === activeSlideIndex ? "true" : undefined
                    }
                    onClick={() => setActiveSlideIndex(index)}
                  />
                ))}
              </div>

              <button
                type="button"
                className="carousel-arrow"
                aria-label="Mostrar próximo filme"
                onClick={showNextMovie}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" />
                </svg>
              </button>

              <button
                type="button"
                className="pause-button"
                onClick={() =>
                  setIsManuallyPaused((currentValue) => !currentValue)
                }
              >
                {isManuallyPaused ? "Continuar" : "Pausar"}
              </button>
            </div>

            <div className="autoplay-progress" aria-hidden="true">
              <span
                key={activeMovie.id}
                className={isManuallyPaused || isInteracting ? "paused" : ""}
              />
            </div>
          </div>
        </div>

        <aside className="checkout-panel" aria-labelledby="order-title">
          <div>
            <span className="status">Sua escolha</span>
            <h2 id="order-title">{selectedMovie.name}</h2>
            <p>Ingresso inteiro · Sessão de hoje</p>
          </div>

          <label className="quantity-field">
            Quantidade de ingressos
            <input
              type="number"
              min="1"
              max="10"
              value={ticketQuantity}
              onChange={(event) =>
                setTicketQuantity(Number(event.target.value))
              }
            />
          </label>

          <dl className="price-summary">
            <div>
              <dt>Preço unitário</dt>
              <dd>R$ {selectedMovie.unitPrice.toFixed(2)}</dd>
            </div>
            <div className="price-total">
              <dt>Total</dt>
              <dd>R$ {currentOrderValue.toFixed(2)}</dd>
            </div>
          </dl>

          <button
            className="primary-action"
            type="button"
            onClick={registerOrder}
          >
            Confirmar pedido
          </button>
        </aside>
      </section>

      <section className="orders-section" aria-labelledby="orders-title">
        <div className="section-heading">
          <div>
            <h2 id="orders-title">Pedidos registrados</h2>
            <p>Acompanhe os ingressos adicionados nesta sessão.</p>
          </div>
          <strong className="revenue">R$ {totalRevenue.toFixed(2)}</strong>
        </div>

        {orders.length === 0 ? (
          <div className="empty-state">
            <strong>Sua lista está vazia</strong>
            <span>Selecione um pôster para começar um pedido.</span>
          </div>
        ) : (
          <ul className="order-list">
            {orders.map((order) => (
              <li key={order.id}>
                <div>
                  <strong>{order.movieName}</strong>
                  <span>
                    {order.quantity} ingresso{order.quantity > 1 ? "s" : ""} a R
                    {order.unitPrice.toFixed(2)}
                  </span>
                </div>
                <b>R$ {order.totalValue.toFixed(2)}</b>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

export default App;
