import { useEffect, useState } from "react";
import "./App.css";

type Movie = {
  id: number;
  name: string;
  posterUrl: string;
  unitPrice: number;
  availableTickets: number;
};

type Order = {
  id: string;
  movieName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  status: "Pending" | "Paid";
};

const API_URL = "http://localhost:5175/api";

const posterByMovieId: Record<number, string> = {
  1: "/posters/interstellar.jpg",
  2: "/posters/batman.jpg",
  3: "/posters/avengers.jpg",
  4: "/posters/resident-evil.jpg",
};

const initialMovies: Movie[] = [
  {
    id: 1,
    name: "Interestelar",
    posterUrl: "/posters/interstellar.jpg",
    unitPrice: 32,
    availableTickets: 100,
  },
  {
    id: 2,
    name: "Batman",
    posterUrl: "/posters/batman.jpg",
    unitPrice: 34,
    availableTickets: 100,
  },
  {
    id: 3,
    name: "Vingadores",
    posterUrl: "/posters/avengers.jpg",
    unitPrice: 30,
    availableTickets: 100,
  },
  {
    id: 4,
    name: "Resident Evil",
    posterUrl: "/posters/resident-evil.jpg",
    unitPrice: 36,
    availableTickets: 100,
  },
];

function PopcornMark() {
  return (
    <svg
      className="popcorn-mark"
      viewBox="0 0 64 64"
      aria-hidden="true"
    >
      <g className="popcorn-kernels" fill="currentColor">
        <circle className="kernel kernel-left" cx="22" cy="23" r="10" />
        <circle className="kernel kernel-center" cx="32" cy="17" r="11" />
        <circle className="kernel kernel-right" cx="43" cy="23" r="10" />
        <circle className="kernel kernel-fill" cx="32" cy="27" r="12" />
      </g>
      <path
        d="M17 30h30l-4 27H21L17 30Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="m27 31 1.5 25M38 31l-2 25"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function App() {
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [selectedMovieId, setSelectedMovieId] = useState(initialMovies[0].id);
  const [carouselStartIndex, setCarouselStartIndex] = useState(0);
  const [isManuallyPaused, setIsManuallyPaused] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(1);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showSplash, setShowSplash] = useState(true);

  const orderedMovies = movies.map(
    (_, offset) => movies[(carouselStartIndex + offset) % movies.length],
  );
  const loopingMovies = [...orderedMovies, ...orderedMovies];
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
    const timer = window.setTimeout(
      () => setShowSplash(false),
      prefersReducedMotion ? 420 : 1500,
    );

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      try {
        const [moviesResponse, ordersResponse] = await Promise.all([
          fetch(`${API_URL}/movies`),
          fetch(`${API_URL}/orders`),
        ]);

        if (!moviesResponse.ok || !ordersResponse.ok) {
          throw new Error("A API não respondeu corretamente.");
        }

        const apiMovies = (await moviesResponse.json()) as Array<
          Omit<Movie, "posterUrl">
        >;
        const apiOrders = (await ordersResponse.json()) as Order[];

        if (!isCancelled) {
          setMovies(
            apiMovies.map((movie) => ({
              ...movie,
              posterUrl: posterByMovieId[movie.id] ?? "",
            })),
          );
          setOrders(apiOrders);
          setErrorMessage("");
        }
      } catch {
        if (!isCancelled) {
          setErrorMessage(
            "Não foi possível conectar à API. Confirme se o backend está ligado na porta 5175.",
          );
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingData(false);
        }
      }
    }

    void loadData();

    return () => {
      isCancelled = true;
    };
  }, []);

  function selectMovie(movieId: number) {
    setSelectedMovieId(movieId);
  }

  function showPreviousMovie() {
    const previousIndex =
      carouselStartIndex === 0 ? movies.length - 1 : carouselStartIndex - 1;

    setCarouselStartIndex(previousIndex);
    setSelectedMovieId(movies[previousIndex].id);
  }

  function showNextMovie() {
    const nextIndex = (carouselStartIndex + 1) % movies.length;

    setCarouselStartIndex(nextIndex);
    setSelectedMovieId(movies[nextIndex].id);
  }

  async function registerOrder() {
    if (ticketQuantity < 1) {
      alert("Informe pelo menos um ingresso.");
      return;
    }

    setIsSubmittingOrder(true);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieId: selectedMovie.id,
          quantity: ticketQuantity,
        }),
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Não foi possível criar o pedido.");
      }

      const newOrder = (await response.json()) as Order;
      setOrders((currentOrders) => [newOrder, ...currentOrders]);
      setMovies((currentMovies) =>
        currentMovies.map((movie) =>
          movie.id === selectedMovie.id
            ? {
                ...movie,
                availableTickets: movie.availableTickets - ticketQuantity,
              }
            : movie,
        ),
      );
      setTicketQuantity(1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Erro inesperado ao criar o pedido.",
      );
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  async function processPayment(orderId: string) {
    setPayingOrderId(orderId);
    setErrorMessage("");

    try {
      const response = await fetch(`${API_URL}/payments/${orderId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = (await response.json()) as { message?: string };
        throw new Error(error.message ?? "Não foi possível aprovar o pagamento.");
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Paid" } : order,
        ),
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Erro inesperado ao processar o pagamento.",
      );
    } finally {
      setPayingOrderId(null);
    }
  }

  return (
    <>
      {showSplash && (
        <div
          className="splash-screen"
          role="status"
          aria-label="Abrindo Cinema Commerce"
        >
          <div className="splash-content">
            <PopcornMark />
            <strong>Cinema Commerce</strong>
            <span>Ingressos em cena</span>
          </div>
        </div>
      )}

      <main className="app-shell">
      <header className="page-header">
        <h1>Cinema Commerce</h1>
        <p>Escolha um filme, defina os ingressos e confirme seu pedido.</p>
      </header>

      {errorMessage && (
        <div className="error-message" role="alert">
          {errorMessage}
        </div>
      )}

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
            <div
              key={carouselStartIndex}
              className={`carousel-track${
                isManuallyPaused || isInteracting ? " paused" : ""
              }`}
            >
              {loopingMovies.map((movie, index) => {
                const isRepeatedCopy = index >= movies.length;

                return (
                <button
                  key={`${movie.id}-${isRepeatedCopy ? "copy" : "original"}`}
                  type="button"
                  className={`carousel-slide${
                    movie.id === selectedMovieId ? " selected" : ""
                  }`}
                  aria-pressed={movie.id === selectedMovieId}
                  aria-hidden={isRepeatedCopy || undefined}
                  tabIndex={isRepeatedCopy ? -1 : 0}
                  onClick={() => selectMovie(movie.id)}
                >
                  <img src={movie.posterUrl} alt={`Pôster de ${movie.name}`} />
                  <span className="slide-shade" aria-hidden="true" />
                  <span className="slide-copy">
                    <strong>{movie.name}</strong>
                    <span>Ingressos a R$ {movie.unitPrice.toFixed(2)}</span>
                    <span>{movie.availableTickets} disponíveis</span>
                    <b>
                      {movie.id === selectedMovieId
                        ? "Filme selecionado"
                        : "Clique para selecionar"}
                    </b>
                  </span>
                </button>
                );
              })}
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

              <span className="carousel-hint">
                O carrossel pausa enquanto você escolhe
              </span>

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
          </div>
        </div>

        <aside className="checkout-panel" aria-labelledby="order-title">
          <div>
            <span className="status">Sua escolha</span>
            <h2 id="order-title">{selectedMovie.name}</h2>
            <p>
              Ingresso inteiro · {selectedMovie.availableTickets} disponíveis
            </p>
          </div>

          <label className="quantity-field">
            Quantidade de ingressos
            <input
              type="number"
              min="1"
              max={Math.min(10, selectedMovie.availableTickets)}
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
            disabled={isSubmittingOrder || selectedMovie.availableTickets < 1}
          >
            {isSubmittingOrder ? "Salvando pedido..." : "Confirmar pedido"}
          </button>
        </aside>
      </section>

      <section className="orders-section" aria-labelledby="orders-title">
        <div className="section-heading">
          <div>
            <h2 id="orders-title">Pedidos registrados</h2>
            <p>
              {isLoadingData
                ? "Carregando pedidos do banco..."
                : "Pedidos salvos no banco de dados."}
            </p>
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
                <div className="order-copy">
                  <strong>{order.movieName}</strong>
                  <span>
                    {order.quantity} ingresso{order.quantity > 1 ? "s" : ""} a R$
                    {order.unitPrice.toFixed(2)}
                  </span>
                </div>
                <div className="order-side">
                  <span className={`order-status ${order.status.toLowerCase()}`}>
                    {order.status === "Paid" ? "Pago" : "Pagamento pendente"}
                  </span>
                  <b>R$ {order.totalValue.toFixed(2)}</b>
                  {order.status === "Pending" && (
                    <button
                      type="button"
                      className="payment-button"
                      disabled={payingOrderId === order.id}
                      onClick={() => processPayment(order.id)}
                    >
                      {payingOrderId === order.id
                        ? "Processando..."
                        : "Simular pagamento"}
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      </main>
    </>
  );
}

export default App;
