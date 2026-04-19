import { useEffect, useState } from "react";
import tarotCards from "../data/tarotCards";
import { drawCards } from "../utils/drawCards";

function FateDeck() {
  const [screen, setScreen] = useState("landing");
  const [question, setQuestion] = useState("");
  const [drawnCards, setDrawnCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reading, setReading] = useState("");
  const [allReadings, setAllReadings] = useState([]);
  const [savedReadings, setSavedReadings] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("fatedeck-saved-readings");
    if (stored) {
      try {
        setSavedReadings(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse saved readings:", error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "fatedeck-saved-readings",
      JSON.stringify(savedReadings)
    );
  }, [savedReadings]);

  const fetchReadingForCard = async (card) => {
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

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate reading.");
    }

    return data.reading;
  };

  const handleDrawCards = async () => {
    if (!question.trim()) return;

    try {
      const cards = drawCards(tarotCards, 3);

      setSaveMessage("");
      setScreen("loading");

      const readings = [];
      for (const card of cards) {
        const result = await fetchReadingForCard(card);
        readings.push(result);
      }

      setDrawnCards(cards);
      setAllReadings(readings);
      setCurrentCardIndex(0);
      setReading(readings[0]);
      setScreen("reveal");
    } catch (error) {
      console.error(error);
      setScreen("landing");
      alert("The sea is silent right now. Please try again.");
    }
  };

  const beginReading = () => {
    setCurrentCardIndex(0);
    setReading(allReadings[0]);
    setSaveMessage("");
    setScreen("reading");
  };

  const nextCard = () => {
    if (currentCardIndex < drawnCards.length - 1) {
      const next = currentCardIndex + 1;
      setCurrentCardIndex(next);
      setReading(allReadings[next]);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      const prev = currentCardIndex - 1;
      setCurrentCardIndex(prev);
      setReading(allReadings[prev]);
    }
  };

  const saveCurrentReading = () => {
    if (!question || drawnCards.length === 0 || allReadings.length === 0) return;

    const entry = {
      id: Date.now(),
      question,
      cards: drawnCards,
      readings: allReadings,
      createdAt: new Date().toLocaleString(),
    };

    setSavedReadings((prev) => [entry, ...prev]);
    setSaveMessage("Reading saved to your codex.");
  };

  const openSavedReading = (entry) => {
    setQuestion(entry.question);
    setDrawnCards(entry.cards);
    setAllReadings(entry.readings);
    setCurrentCardIndex(0);
    setReading(entry.readings[0]);
    setSaveMessage("");
    setScreen("reading");
  };

  const deleteSavedReading = (id) => {
    setSavedReadings((prev) => prev.filter((entry) => entry.id !== id));
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

            <div style={styles.buttonRow}>
              <button onClick={handleDrawCards} className="magic-button" style={styles.button}>
                Draw Cards
              </button>

              <button
                onClick={() => setScreen("deck")}
                className="magic-button"
                style={styles.secondaryButton}
              >
                Consult the Codex
              </button>

              <button
                onClick={() => setScreen("saved")}
                className="magic-button"
                style={styles.secondaryButton}
              >
                Saved Readings
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === "deck" && (
        <div style={styles.section}>
          <div style={styles.topNav}>
            <button
              onClick={() => setScreen("landing")}
              className="magic-button"
              style={styles.homeButton}
            >
              Return to FateDeck
            </button>
          </div>

          <h1 style={styles.sectionTitle}>The Fate Deck</h1>
          <p style={styles.deckSubtitle}>
            Explore the symbols and entities that shape the currents of fate.
          </p>

          <div className="deck-grid">
            {tarotCards.map((card) => (
              <div key={card.id} style={styles.cardPreview}>
                <img src={card.image} alt={card.name} style={styles.smallCard} />
                <p style={styles.cardLabel}>{card.name}</p>
                <p style={styles.deckMeaning}>{card.meaning}</p>
              </div>
            ))}
          </div>

          <button
            onClick={() => setScreen("landing")}
            className="magic-button"
            style={styles.button}
          >
            Return
          </button>
        </div>
      )}

      {screen === "saved" && (
        <div style={styles.section}>
          <div style={styles.topNav}>
            <button
              onClick={() => setScreen("landing")}
              className="magic-button"
              style={styles.homeButton}
            >
              Return to FateDeck
            </button>
          </div>

          <h1 style={styles.sectionTitle}>My Codex</h1>
          <p style={styles.deckSubtitle}>
            Your saved spreads and digital keepsakes.
          </p>

          {savedReadings.length === 0 ? (
            <div style={styles.emptyState}>
              <p>No saved readings yet.</p>
              <button
                onClick={() => setScreen("landing")}
                className="magic-button"
                style={styles.button}
              >
                Return
              </button>
            </div>
          ) : (
            <>
              <div style={styles.savedGrid}>
                {savedReadings.map((entry) => (
                  <div key={entry.id} style={styles.savedCard}>
                    <p style={styles.savedDate}>{entry.createdAt}</p>
                    <h3 style={styles.savedQuestion}>{entry.question}</h3>

                    <div style={styles.savedMiniRow}>
                      {entry.cards.map((card) => (
                        <img
                          key={card.id}
                          src={card.image}
                          alt={card.name}
                          style={styles.savedMiniCard}
                        />
                      ))}
                    </div>

                    <div style={styles.savedActions}>
                      <button
                        onClick={() => openSavedReading(entry)}
                        className="magic-button"
                        style={styles.button}
                      >
                        Open
                      </button>

                      <button
                        onClick={() => deleteSavedReading(entry.id)}
                        className="magic-button"
                        style={styles.secondaryButton}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setScreen("landing")}
                className="magic-button"
                style={styles.button}
              >
                Return
              </button>
            </>
          )}
        </div>
      )}

      {screen === "loading" && (
        <div style={styles.section}>
          <h1 style={styles.sectionTitle}>Consulting the Deep...</h1>
          <p style={styles.loadingText}>
            Shuffling the currents and preparing your reading.
          </p>

          <div className="shuffle-stage">
            <div className="shuffle-card shuffle-card-1" />
            <div className="shuffle-card shuffle-card-2" />
            <div className="shuffle-card shuffle-card-3" />
          </div>
        </div>
      )}

      {screen === "reveal" && (
        <div style={styles.section}>
          <div style={styles.topNav}>
            <button
              onClick={() => setScreen("landing")}
              className="magic-button"
              style={styles.homeButton}
            >
              Return to FateDeck
            </button>
          </div>

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

          <div style={styles.buttonRow}>
            <button onClick={beginReading} className="magic-button" style={styles.button}>
              Begin Reading
            </button>

            <button
              onClick={() => setScreen("landing")}
              className="magic-button"
              style={styles.secondaryButton}
            >
              Return
            </button>
          </div>
        </div>
      )}

      {screen === "reading" && currentCard && (
        <div style={styles.section}>
          <div style={styles.topNav}>
            <button
              onClick={() => setScreen("landing")}
              className="magic-button"
              style={styles.homeButton}
            >
              Return to FateDeck
            </button>
          </div>

          <h1 style={styles.sectionTitle}>Reading</h1>
          <p style={styles.readingCount}>
            Card {currentCardIndex + 1} of {drawnCards.length}
          </p>

          <img src={currentCard.image} alt={currentCard.name} style={styles.largeCard} />

          <h2 style={styles.readingCardTitle}>{currentCard.name}</h2>

          <div style={styles.readingBox}>
            <p>
              <strong>Your question:</strong> {question}
            </p>
            <p>
              <strong>Card meaning:</strong> {currentCard.meaning}
            </p>

            <div style={styles.aiBlock}>
              <h3 style={styles.aiHeading}>AI Reading</h3>
              <p>{reading}</p>
            </div>

            <button onClick={saveCurrentReading} className="magic-button" style={styles.button}>
              Keep This Reading
            </button>

            {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}
          </div>

          <div style={styles.navRow}>
            <button
              onClick={prevCard}
              disabled={currentCardIndex === 0}
              className="magic-button"
              style={styles.button}
            >
              Previous
            </button>

            <button
              onClick={nextCard}
              disabled={currentCardIndex === drawnCards.length - 1}
              className="magic-button"
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
    justifyContent: "center",
    position: "relative",
  },

  topNav: {
    width: "100%",
    maxWidth: "1400px",
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: "12px",
  },

  sectionTitle: {
    fontSize: "clamp(2.5rem, 4vw, 4.5rem)",
    marginBottom: "14px",
  },

  deckSubtitle: {
    fontSize: "1.1rem",
    color: "#d8e6ea",
    marginBottom: "20px",
    maxWidth: "760px",
  },

  loadingText: {
    fontSize: "1.1rem",
    color: "#d8e6ea",
    marginBottom: "36px",
  },

  input: {
    width: "100%",
    maxWidth: "680px",
    padding: "20px 24px",
    borderRadius: "18px",
    border: "2px solid rgba(120,220,255,.55)",
    background: "rgba(8,30,45,.82)",
    color: "white",
    fontSize: "1.1rem",
    boxShadow: "0 0 20px rgba(90,220,255,.25), 0 0 40px rgba(0,0,0,.25)",
    backdropFilter: "blur(10px)",
    outline: "none",
  },

  buttonRow: {
    display: "flex",
    gap: "18px",
    marginTop: "10px",
    flexWrap: "wrap",
    justifyContent: "center",
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

  secondaryButton: {
    padding: "12px 26px",
    borderRadius: "12px",
    border: "1px solid rgba(120,220,255,.45)",
    background: "rgba(8,30,45,.75)",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    marginTop: "8px",
  },

  homeButton: {
    padding: "10px 18px",
    borderRadius: "12px",
    border: "1px solid rgba(120,220,255,.45)",
    background: "rgba(8,30,45,.75)",
    color: "white",
    cursor: "pointer",
    fontSize: ".95rem",
    fontWeight: "600",
  },

  cardPreview: {
    textAlign: "center",
  },

  cardLabel: {
    marginTop: "12px",
    fontSize: "1.05rem",
  },

  deckMeaning: {
    marginTop: "8px",
    color: "#d8e6ea",
    fontSize: ".95rem",
    lineHeight: "1.5",
    maxWidth: "260px",
    marginInline: "auto",
  },

  smallCard: {
    width: "min(24vw, 280px)",
    minWidth: "220px",
    borderRadius: "16px",
    boxShadow: "0 18px 48px rgba(0,0,0,.4)",
  },

  largeCard: {
    width: "min(28vw, 280px)",
    minWidth: "220px",
    borderRadius: "16px",
    boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
  },

  readingCount: {
    fontSize: "1rem",
    color: "#d8e6ea",
    marginBottom: "24px",
  },

  readingCardTitle: {
    marginTop: "18px",
    marginBottom: "10px",
    fontSize: "2rem",
  },

  readingBox: {
    maxWidth: "900px",
    width: "100%",
    margin: "30px auto",
    padding: "24px",
    background: "rgba(255,255,255,0.08)",
    borderRadius: "16px",
    lineHeight: "1.7",
  },

  aiBlock: {
    marginTop: "18px",
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

  saveMessage: {
    marginTop: "12px",
    color: "#9be7ff",
    fontWeight: "600",
  },

  savedGrid: {
    width: "100%",
    maxWidth: "1400px",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "28px",
    margin: "30px auto 40px",
  },

  savedCard: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: "18px",
    padding: "22px",
    textAlign: "left",
    boxShadow: "0 14px 36px rgba(0,0,0,.25)",
  },

  savedDate: {
    color: "#a7c9d4",
    fontSize: ".95rem",
    marginBottom: "10px",
  },

  savedQuestion: {
    fontSize: "1.15rem",
    marginBottom: "16px",
  },

  savedMiniRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  savedMiniCard: {
    width: "72px",
    borderRadius: "10px",
    boxShadow: "0 8px 20px rgba(0,0,0,.25)",
  },

  savedActions: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    marginTop: "20px",
  },
};

export default FateDeck;