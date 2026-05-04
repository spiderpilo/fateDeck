import { useEffect, useRef, useState } from "react";
import cardBack from "../assets/card-back.png";
import tarotCards from "../data/tarotCards";
import zodiacProfiles from "../data/zodiacProfiles";
import { drawCards } from "../utils/drawCards";

function FateDeck() {
  const zodiacOptions = Object.keys(zodiacProfiles);

  const [screen, setScreen] = useState("welcome");
  const [question, setQuestion] = useState("");
  const [selectedZodiac, setSelectedZodiac] = useState("Aries");
  const [drawnCards, setDrawnCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [reading, setReading] = useState("");
  const [allReadings, setAllReadings] = useState([]);
  const [savedReadings, setSavedReadings] = useState([]);
  const [saveMessage, setSaveMessage] = useState("");
  const [selectedDeckCard, setSelectedDeckCard] = useState(null);
  const [flippedCards, setFlippedCards] = useState([]);
  const [showCardsClicked, setShowCardsClicked] = useState(false);
  const [curtainActive, setCurtainActive] = useState(false);

  const [transitioning, setTransitioning] = useState(false);
  const [pendingScreen, setPendingScreen] = useState(null);
  const [transitionSrc, setTransitionSrc] = useState("/videos/transition1.mp4");
  const [transitionKey, setTransitionKey] = useState(0);
  const pendingAction = useRef(null);
  const cardSlideDir = useRef("next");

  const navigateTo = (targetScreen) => {
    setTransitionSrc("/videos/transition1.mp4");
    setTransitionKey((k) => k + 1);
    setPendingScreen(targetScreen);
    setTransitioning(true);
  };

  const handleTransitionEnd = () => {
    setScreen(pendingScreen);
    setTransitioning(false);
    if (pendingAction.current) {
      pendingAction.current();
      pendingAction.current = null;
    }
  };

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
    const response = await fetch("/api/tarot-reading", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        card,
        zodiac: selectedZodiac,
        zodiacProfile: zodiacProfiles[selectedZodiac],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to generate reading.");
    }

    return data.reading;
  };

  const handleDrawCards = () => {
    if (!question.trim()) return;

    const cards = drawCards(tarotCards, 3);
    setSaveMessage("");

    pendingAction.current = async () => {
      try {
        const readings = [];
        for (const card of cards) {
          const result = await fetchReadingForCard(card);
          readings.push(result);
        }
        setDrawnCards(cards);
        setAllReadings(readings);
        setCurrentCardIndex(0);
        setReading(readings[0]);
        setFlippedCards(cards.map(() => false));
        setShowCardsClicked(false);
        setScreen("reveal");
      } catch (error) {
        console.error(error);
        setScreen("landing");
        alert("The sea is silent right now. Please try again.");
      }
    };

    const drawTransition = Math.floor(Math.random() * 6) + 2;
    setTransitionSrc(`/videos/transition${drawTransition}.mp4`);
    setTransitionKey((k) => k + 1);
    setPendingScreen("loading");
    setTransitioning(true);
  };

  const handleShowCards = () => {
    setShowCardsClicked(true);
    drawnCards.forEach((_, i) => {
      setTimeout(() => {
        setFlippedCards((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, i * 600);
    });
  };

  const handleBeginReading = () => {
    setCurtainActive(true);
    setTimeout(() => beginReading(), 320);
    setTimeout(() => setCurtainActive(false), 700);
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
      cardSlideDir.current = "next";
      setCurrentCardIndex(next);
      setReading(allReadings[next]);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      const prev = currentCardIndex - 1;
      cardSlideDir.current = "prev";
      setCurrentCardIndex(prev);
      setReading(allReadings[prev]);
    }
  };

  const saveCurrentReading = () => {
    if (!question || drawnCards.length === 0 || allReadings.length === 0) return;

    const entry = {
      id: Date.now(),
      question,
      zodiac: selectedZodiac,
      cards: drawnCards,
      readings: allReadings,
      createdAt: new Date().toLocaleString(),
    };

    setSavedReadings((prev) => [entry, ...prev]);
    setSaveMessage("Reading saved to your codex.");
  };

  const openSavedReading = (entry) => {
    setQuestion(entry.question);
    setSelectedZodiac(entry.zodiac || "Aries");
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

  const openDeckCard = (card) => {
    setSelectedDeckCard(card);
  };

  const closeDeckCard = () => {
    setSelectedDeckCard(null);
  };

  const currentCard = drawnCards[currentCardIndex];

  return (
    <div style={styles.page}>
      {screen === "welcome" && (
        <div style={styles.landingPage}>
          <video autoPlay muted loop playsInline style={styles.videoBackground}>
            <source src="/videos/fatedeck-bg.mp4" type="video/mp4" />
          </video>

          <div style={styles.welcomeOverlay} />

          <div style={styles.welcomeContent}>
            <span style={styles.welcomeSymbol}>✦</span>
            <h1 style={styles.welcomeTitle}>FateDeck</h1>
            <p style={styles.welcomeSubtitle}>The deep sea holds your fate.</p>
            <button
              onClick={() => navigateTo("landing")}
              className="magic-button"
              style={styles.welcomeButton}
            >
              Begin
            </button>
          </div>
        </div>
      )}

      {screen === "landing" && (
        <div style={styles.landingPage}>
          <video autoPlay muted loop playsInline style={styles.videoBackground}>
            <source src="/videos/fatedeck-bg.mp4" type="video/mp4" />
          </video>

          <div style={styles.videoOverlay} />

          <div style={styles.bottomUi}>
            <select
              value={selectedZodiac}
              onChange={(e) => setSelectedZodiac(e.target.value)}
              style={styles.select}
            >
              {zodiacOptions.map((sign) => (
                <option key={sign} value={sign}>
                  {sign}
                </option>
              ))}
            </select>

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
                onClick={() => {
                  setSelectedDeckCard(null);
                  setScreen("deck");
                }}
                className="magic-button"
                style={styles.secondaryButton}
              >
                View Deck
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
              onClick={() => {
                setSelectedDeckCard(null);
                setScreen("landing");
              }}
              className="magic-button"
              style={styles.homeButton}
            >
              Return to FateDeck
            </button>
          </div>

          <h1 style={styles.sectionTitle}>The Fate Deck</h1>
          <p style={styles.deckSubtitle}>
            Click a card to inspect it more closely.
          </p>

          <div className="deck-grid">
            {tarotCards.map((card) => {
              const isSelected = selectedDeckCard?.id === card.id;

              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => openDeckCard(card)}
                  className={`deck-card-hover ${isSelected ? "deck-card-selected" : ""}`}
                  style={styles.deckCardButton}
                >
                  <img src={card.image} alt={card.name} style={styles.smallCard} />
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              setSelectedDeckCard(null);
              setScreen("landing");
            }}
            className="magic-button"
            style={styles.button}
          >
            Return
          </button>

          {selectedDeckCard && (
            <div style={styles.deckModalOverlay} onClick={closeDeckCard}>
              <div style={styles.deckModalCard} onClick={(e) => e.stopPropagation()}>
                <img
                  src={selectedDeckCard.image}
                  alt={selectedDeckCard.name}
                  style={styles.deckZoomCard}
                />

                <div style={styles.deckInfoText}>
                  <h2 style={styles.deckInfoTitle}>{selectedDeckCard.name}</h2>
                  <p style={styles.deckInfoDescription}>{selectedDeckCard.meaning}</p>

                  <button
                    onClick={closeDeckCard}
                    className="magic-button"
                    style={styles.button}
                  >
                    Close Card
                  </button>
                </div>
              </div>
            </div>
          )}
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
                    <p style={styles.savedZodiac}>Zodiac: {entry.zodiac || "Unknown"}</p>
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
          <p style={styles.readingLabel}>Zodiac: {selectedZodiac}</p>

          <div className="reveal-row">
            {drawnCards.map((card, index) => (
              <div
                key={card.id}
                className={`deal-card deal-delay-${index + 1}`}
                style={styles.cardPreview}
              >
                <div style={styles.cardFlipContainer}>
                  <div style={{
                    ...styles.cardFlipInner,
                    transform: flippedCards[index] ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}>
                    <img src={cardBack} alt="Card back" style={styles.cardBackFace} />
                    <img src={card.image} alt={card.name} style={styles.cardFrontFace} />
                  </div>
                </div>
                <p style={{
                  ...styles.cardLabel,
                  opacity: flippedCards[index] ? 1 : 0,
                  transition: "opacity 0.4s ease 0.3s",
                }}>
                  {card.name}
                </p>
              </div>
            ))}
          </div>

          <div style={styles.buttonRow}>
            {!showCardsClicked ? (
              <button onClick={handleShowCards} className="magic-button" style={styles.button}>
                Show Cards
              </button>
            ) : (
              <button onClick={handleBeginReading} className="magic-button" style={styles.button}>
                Begin Reading
              </button>
            )}

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
        <div style={styles.readingSection}>
          {/* Header */}
          <div style={styles.readingHeader}>
            <button
              onClick={() => setScreen("landing")}
              className="magic-button"
              style={styles.homeButton}
            >
              Return to FateDeck
            </button>
            <div style={styles.readingHeaderCenter}>
              <span style={styles.readingHeaderCard}>{currentCard.name}</span>
              <span style={styles.readingHeaderMeta}>
                Card {currentCardIndex + 1} of {drawnCards.length} · {selectedZodiac}
              </span>
            </div>
            <div style={{ width: "160px" }} />
          </div>

          {/* Two-panel body — both panels animate together on card change */}
          <div
            key={currentCardIndex}
            style={{
              ...styles.readingBody,
              animation: cardSlideDir.current === "prev"
                ? "slideInLeft 0.35s ease forwards"
                : "slideInRight 0.35s ease forwards",
            }}
          >
            {/* Left panel: large card image + nav */}
            <div style={styles.readingLeftPanel}>
              <img src={currentCard.image} alt={currentCard.name} style={styles.readingCardImg} />
              <div style={styles.navRow}>
                <button
                  onClick={prevCard}
                  disabled={currentCardIndex === 0}
                  className="magic-button"
                  style={styles.navButton}
                >
                  ← Prev
                </button>
                <button
                  onClick={nextCard}
                  disabled={currentCardIndex === drawnCards.length - 1}
                  className="magic-button"
                  style={styles.navButton}
                >
                  Next →
                </button>
              </div>
            </div>

            {/* Right panel: all reading info */}
            <div style={styles.readingRightPanel}>
              <div style={styles.readingSectionBlock}>
                <p style={styles.readingLabel}>Your Question</p>
                <p style={styles.readingBodyText}>{question}</p>
              </div>

              <div style={styles.readingSectionBlock}>
                <p style={styles.readingLabel}>Card Meaning</p>
                <p style={styles.readingBodyText}>{currentCard.meaning}</p>
              </div>

              <div style={styles.readingAIBlock}>
                <p style={styles.readingLabel}>Personalized Reading</p>
                <p style={styles.readingBodyText}>{reading}</p>
              </div>

              <div style={styles.zodiacGrid}>
                <div>
                  <p style={styles.readingLabel}>Strengths</p>
                  <ul style={styles.zodiacList}>
                    {zodiacProfiles[selectedZodiac].strengths.map((trait) => (
                      <li key={trait} style={styles.zodiacTrait}>
                        <span style={styles.zodiacBullet}>•</span>{trait}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p style={styles.readingLabel}>Weaknesses</p>
                  <ul style={styles.zodiacList}>
                    {zodiacProfiles[selectedZodiac].weaknesses.map((trait) => (
                      <li key={trait} style={styles.zodiacTrait}>
                        <span style={styles.zodiacBullet}>•</span>{trait}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div style={styles.readingActions}>
                <button onClick={saveCurrentReading} className="magic-button" style={styles.button}>
                  Keep This Reading
                </button>
                {saveMessage && <p style={styles.saveMessage}>{saveMessage}</p>}
              </div>
            </div>
          </div>
        </div>
      )}
      {curtainActive && (
        <div style={styles.curtainOverlay} />
      )}

      {transitioning && (
        <div style={styles.transitionOverlay}>
          <video
            key={transitionKey}
            autoPlay
            muted
            playsInline
            onEnded={handleTransitionEnd}
            style={styles.transitionVideo}
          >
            <source src={transitionSrc} type="video/mp4" />
          </video>
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

  curtainOverlay: {
    position: "fixed",
    inset: 0,
    background: "#03131d",
    animation: "curtainFade 0.7s ease forwards",
    zIndex: 9998,
    pointerEvents: "none",
  },

  transitionOverlay: {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
    background: "#000",
    pointerEvents: "all",
  },

  transitionVideo: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
  },

  welcomeOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0, 10, 20, 0.5)",
    zIndex: 1,
  },

  welcomeContent: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
    animation: "fadeInUp 1.2s ease forwards",
  },

  welcomeSymbol: {
    fontSize: "2.4rem",
    color: "rgba(155, 231, 255, 0.75)",
    textShadow: "0 0 24px rgba(90, 220, 255, 0.55)",
  },

  welcomeTitle: {
    fontSize: "clamp(4rem, 10vw, 8rem)",
    fontWeight: "700",
    letterSpacing: "0.06em",
    color: "white",
    margin: 0,
    textShadow: "0 0 48px rgba(90, 220, 255, 0.3), 0 4px 32px rgba(0, 0, 0, 0.6)",
  },

  welcomeSubtitle: {
    fontSize: "clamp(1rem, 2vw, 1.25rem)",
    color: "#d8e6ea",
    letterSpacing: "0.12em",
    margin: 0,
    opacity: 0.8,
  },

  welcomeButton: {
    marginTop: "10px",
    padding: "16px 56px",
    fontSize: "1.05rem",
    fontWeight: "600",
    letterSpacing: "0.12em",
    borderRadius: "50px",
    border: "1.5px solid rgba(120, 220, 255, 0.55)",
    background: "rgba(8, 30, 45, 0.72)",
    color: "white",
    cursor: "pointer",
    backdropFilter: "blur(10px)",
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
    gap: "14px",
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

  select: {
    width: "100%",
    maxWidth: "680px",
    padding: "16px 18px",
    borderRadius: "16px",
    border: "2px solid rgba(120,220,255,.45)",
    background: "rgba(8,30,45,.82)",
    color: "white",
    fontSize: "1rem",
    boxShadow: "0 0 16px rgba(90,220,255,.18), 0 0 28px rgba(0,0,0,.2)",
    outline: "none",
    backdropFilter: "blur(8px)",
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

  cardFlipContainer: {
    perspective: "1200px",
    display: "inline-block",
  },

  cardFlipInner: {
    position: "relative",
    transformStyle: "preserve-3d",
    WebkitTransformStyle: "preserve-3d",
    transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
    width: "min(24vw, 280px)",
    minWidth: "220px",
  },

  cardBackFace: {
    display: "block",
    width: "100%",
    borderRadius: "16px",
    boxShadow: "0 18px 48px rgba(0,0,0,.4)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
  },

  cardFrontFace: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    borderRadius: "16px",
    boxShadow: "0 18px 48px rgba(0,0,0,.4)",
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    transform: "rotateY(180deg)",
    objectFit: "cover",
  },

  deckCardButton: {
    background: "transparent",
    border: "none",
    padding: 0,
    cursor: "pointer",
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

  deckModalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.52)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    zIndex: 1000,
  },

  deckModalCard: {
    width: "100%",
    maxWidth: "1000px",
    background: "rgba(8,32,48,0.72)",
    backdropFilter: "blur(4px)",
    transition: "transform 180ms ease, box-shadow 180ms ease, background 180ms ease",
    borderRadius: "22px",
    padding: "28px",
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: "28px",
    boxShadow: "0 24px 80px rgba(0,0,0,.55)",
  },

  deckZoomCard: {
    width: "min(32vw, 360px)",
    minWidth: "240px",
    borderRadius: "18px",
    boxShadow: "0 24px 60px rgba(0,0,0,.45)",
  },

  deckInfoText: {
    maxWidth: "420px",
    textAlign: "left",
  },

  deckInfoTitle: {
    fontSize: "2rem",
    marginBottom: "14px",
  },

  deckInfoDescription: {
    fontSize: "1.05rem",
    lineHeight: "1.7",
    color: "#d8e6ea",
    marginBottom: "18px",
  },

  readingSection: {
    height: "100vh",
    width: "100%",
    background: "#03131d",
    display: "flex",
    flexDirection: "column",
    boxSizing: "border-box",
    overflow: "hidden",
  },

  readingHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 28px",
    borderBottom: "1px solid rgba(120,220,255,0.12)",
    flexShrink: 0,
    gap: "16px",
  },

  readingHeaderCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
  },

  readingHeaderCard: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "white",
    letterSpacing: "0.02em",
  },

  readingHeaderMeta: {
    fontSize: "0.78rem",
    color: "#9be7ff",
    letterSpacing: "0.08em",
  },

  readingBody: {
    display: "flex",
    flex: 1,
    overflow: "hidden",
  },

  readingLeftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "24px",
    padding: "28px 24px",
    borderRight: "1px solid rgba(120,220,255,0.12)",
    background: "rgba(0,0,0,0.12)",
    overflow: "hidden",
  },

  readingCardImg: {
    maxHeight: "calc(100vh - 180px)",
    maxWidth: "100%",
    borderRadius: "18px",
    boxShadow: "0 0 48px rgba(90,220,255,0.2), 0 28px 64px rgba(0,0,0,0.65)",
    display: "block",
    objectFit: "contain",
  },

  readingRightPanel: {
    flex: 1,
    overflowY: "auto",
    padding: "28px 36px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },

  readingSectionBlock: {
    paddingBottom: "16px",
    borderBottom: "1px solid rgba(120,220,255,0.08)",
  },

  readingLabel: {
    fontSize: "0.68rem",
    fontWeight: "700",
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: "rgba(155,231,255,0.6)",
    margin: "0 0 6px",
  },

  readingBodyText: {
    fontSize: "0.95rem",
    lineHeight: "1.75",
    color: "#d8e6ea",
    margin: 0,
  },

  readingAIBlock: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: "14px",
    padding: "18px 20px",
    border: "1px solid rgba(120,220,255,0.08)",
  },

  zodiacGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    padding: "16px 0",
    borderTop: "1px solid rgba(120,220,255,0.08)",
  },

  zodiacList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },

  zodiacTrait: {
    fontSize: "0.88rem",
    color: "#d8e6ea",
    lineHeight: "1.4",
    display: "flex",
    gap: "8px",
  },

  zodiacBullet: {
    color: "#9be7ff",
    flexShrink: 0,
    fontSize: "0.8rem",
  },

  readingActions: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },

  navButton: {
    padding: "10px 24px",
    borderRadius: "12px",
    border: "1px solid rgba(120,220,255,.45)",
    background: "rgba(8,30,45,.75)",
    color: "white",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
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

  savedZodiac: {
    color: "#9be7ff",
    fontSize: ".95rem",
    marginBottom: "10px",
    fontWeight: "600",
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