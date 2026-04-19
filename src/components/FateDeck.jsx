import { useState } from "react";
import tarotCards from "../data/tarotCards";
import { drawCards } from "../utils/drawCards";

function FateDeck() {
  const [screen, setScreen] = useState("landing");
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reading, setReading] = useState("");
  const [loadingReading, setLoadingReading] = useState(false);

  const handleDrawCards = () => {
    if (!question.trim()) return;

    const cards = drawCards(tarotCards, 3);
    setDrawnCards(cards);
    setCurrentCardIndex(0);
    setReading("");
    setScreen("reveal");
  };

  const fetchReading = async (card) => {
    try {
      setLoadingReading(true);

      const response = await fetch("http://localhost:3001/api/tarot-reading", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question,
          card,
        }),
      });

      const data = await response.json();
      setReading(data.reading);
    } catch (error) {
      console.error(error);
      setReading("The sea is silent right now...");
    } finally {
      setLoadingReading(false);
    }
  };

  const beginReading = async () => {
    setScreen("reading");
    await fetchReading(drawnCards[0]);
  };

  const nextCard = async () => {
    if (currentCardIndex < drawnCards.length - 1) {
      const next = currentCardIndex + 1;
      setCurrentCardIndex(next);
      await fetchReading(drawnCards[next]);
    }
  };

  const prevCard = async () => {
    if (currentCardIndex > 0) {
      const prev = currentCardIndex - 1;
      setCurrentCardIndex(prev);
      await fetchReading(drawnCards[prev]);
    }
  };

  const currentCard = drawnCards[currentCardIndex];

  return (
    <div style={styles.page}>
      {screen === "landing" && (
        <div style={styles.landingPage}>
          <video autoPlay muted loop playsInline style={styles.videoBackground}>
            <source src="/videos/fatedeck-bg.mp4" type="video/mp4" />
          </video>

          <div style={styles.videoOverlay} />

          <div style={styles.bottomUi}>
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask the deep sea what fate awaits..."
              style={styles.input}
            />

            <button onClick={handleDrawCards} style={styles.button}>
              Draw Cards
            </button>
          </div>
        </div>
      )}

      {screen === "reveal" && (
        <div style={styles.section}>
          <h1 style={styles.sectionTitle}>Your Cards</h1>

          <div className="reveal-row">
            {drawnCards.map((card, index) => (
              <div
                key={card.id}
                className={`deal-card deal-delay-${index + 1}`}
                style={styles.cardPreview}
              >
                <img src={card.image} alt={card.name} style={styles.smallCard} />
                <p style={styles.cardLabel}>{card.name}</p>
              </div>
            ))}
          </div>

          <button onClick={beginReading} style={styles.button}>
            Begin Reading
          </button>
        </div>
      )}

      {screen === "reading" && currentCard && (
        <div style={styles.section}>
          <h1 style={styles.sectionTitle}>
            Card {currentCardIndex + 1} of {drawnCards.length}
          </h1>

          <img src={currentCard.image} alt={currentCard.name} style={styles.largeCard} />

          <h2 style={styles.readingCardTitle}>{currentCard.name}</h2>

          <p style={styles.cardMeaning}>{currentCard.meaning}</p>

          <div style={styles.readingBox}>
            <h3 style={styles.aiHeading}>AI Reading</h3>

            {loadingReading ? <p>Consulting the tides...</p> : <p>{reading}</p>}
          </div>

          <div style={styles.navRow}>
            <button
              onClick={prevCard}
              disabled={currentCardIndex === 0}
              style={styles.button}
            >
              Previous
            </button>

            <button
              onClick={nextCard}
              disabled={currentCardIndex === drawnCards.length - 1}
              style={styles.button}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100%",
    background: "#03131d",
    color: "white",
    textAlign: "center",
  },

  landingPage: {
    position: "relative",
    width: "100%",
    minHeight: "100vh",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },

  videoBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },

  videoOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0, 10, 20, 0.28)",
    zIndex: 1,
  },

  bottomUi: {
    position: "absolute",
    bottom: "8vh",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    width: "100%",
    padding: "0 20px",
  },

  section: {
    minHeight: "100vh",
    width: "100%",
    padding: "40px 24px 60px",
    background: "#03131d",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },

  sectionTitle: {
    fontSize: "clamp(2.2rem, 4vw, 4rem)",
    marginBottom: "28px",
  },

  input: {
    width: "100%",
    maxWidth: "640px",
    padding: "16px 18px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.45)",
    background: "rgba(20, 30, 40, 0.74)",
    color: "white",
    fontSize: "1rem",
    outline: "none",
    backdropFilter: "blur(6px)",
  },

  button: {
    padding: "12px 26px",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    marginTop: "8px",
    fontSize: "1rem",
    fontWeight: "600",
  },

  cardPreview: {
    textAlign: "center",
  },

  cardLabel: {
    marginTop: "12px",
    fontSize: "1.05rem",
  },

  smallCard: {
    width: "min(18vw, 200px)",
    minWidth: "150px",
    borderRadius: "14px",
    boxShadow: "0 12px 36px rgba(0,0,0,0.35)",
  },

  largeCard: {
    width: "min(28vw, 280px)",
    minWidth: "220px",
    borderRadius: "16px",
    boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
  },

  readingCardTitle: {
    marginTop: "18px",
    marginBottom: "10px",
    fontSize: "2rem",
  },

  cardMeaning: {
    maxWidth: "760px",
    margin: "0 auto 20px auto",
    fontSize: "1.05rem",
    lineHeight: "1.6",
    color: "#d8e6ea",
    padding: "0 12px",
  },

  readingBox: {
    maxWidth: "760px",
    width: "100%",
    margin: "30px auto",
    padding: "24px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    lineHeight: "1.7",
  },

  aiHeading: {
    marginBottom: "12px",
  },

  navRow: {
    display: "flex",
    justifyContent: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
};

export default FateDeck;