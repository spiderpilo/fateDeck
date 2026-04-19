import theAbyss from "../assets/tarotDeck/the-abyss.png";
import theSiren from "../assets/tarotDeck/the-siren.png";
import theSunkenShip from "../assets/tarotDeck/the-sunken-ship.png";
import theHighPriestessOfTides from "../assets/tarotDeck/the-high-priestess-of-tides.png";
import theOceanKing from "../assets/tarotDeck/the-ocean-king.png";
import theCompass from "../assets/tarotDeck/the-compass.png";
import theTwinCurrents from "../assets/tarotDeck/the-twin-currents.png";
import theKraken from "../assets/tarotDeck/the-kraken.png";
import thePearl from "../assets/tarotDeck/the-pearl.png";
import theLantern from "../assets/tarotDeck/the-lantern.png";
import theHiddenTreasure from "../assets/tarotDeck/the-hidden-treasure.png";
import theOracleJelly from "../assets/tarotDeck/the-oracle-jelly.png";
import theGuardianLeviathan from "../assets/tarotDeck/the-guardian-leviathan.png";
import theShipwreck from "../assets/tarotDeck/the-shipwreck.png";
import theAltarOfCoral from "../assets/tarotDeck/the-altar-of-coral.png";
import theDeepExplorer from "../assets/tarotDeck/the-deep-explorer.png";
import theMoonBelow from "../assets/tarotDeck/the-moon-below.png";
import theSerpentOfDepths from "../assets/tarotDeck/the-serpent-of-depths.png";
import theStarfish from "../assets/tarotDeck/the-starfish.png";
import theTrident from "../assets/tarotDeck/the-trident.png";
import theLeviathan from "../assets/tarotDeck/the-leviathan.png";
import theMermaid from "../assets/tarotDeck/the-mermaid.png";
import theLighthouseAbove from "../assets/tarotDeck/the-lighthouse-above.png";
import theGhostShip from "../assets/tarotDeck/the-ghost-ship.png";
import theEndlessDepths from "../assets/tarotDeck/the-endless-depths.png";

const tarotCards = [
  {
    id: 1,
    name: "The Abyss",
    image: theAbyss,
    meaning: "Mystery, surrender, and the courage to face the unknown.",
    theme: "uncertainty",
  },
  {
    id: 2,
    name: "The Siren",
    image: theSiren,
    meaning: "Temptation, attraction, and the danger of illusion.",
    theme: "temptation",
  },
  {
    id: 3,
    name: "The Sunken Ship",
    image: theSunkenShip,
    meaning: "Loss, hidden lessons, and treasures buried in the past.",
    theme: "past",
  },
  {
    id: 4,
    name: "The High Priestess of Tides",
    image: theHighPriestessOfTides,
    meaning: "Intuition, inner wisdom, and unseen emotional currents.",
    theme: "intuition",
  },
  {
    id: 5,
    name: "The Ocean King",
    image: theOceanKing,
    meaning: "Authority, stability, and command over chaos.",
    theme: "power",
  },
  {
    id: 6,
    name: "The Compass",
    image: theCompass,
    meaning: "Direction, purpose, and guidance through uncertainty.",
    theme: "guidance",
  },
  {
    id: 7,
    name: "The Twin Currents",
    image: theTwinCurrents,
    meaning: "Choice, duality, and two forces pulling at once.",
    theme: "choice",
  },
  {
    id: 8,
    name: "The Kraken",
    image: theKraken,
    meaning: "Power, fear, and something immense rising from below.",
    theme: "fear",
  },
  {
    id: 9,
    name: "The Pearl",
    image: thePearl,
    meaning: "Beauty born from pressure, wisdom, and quiet value.",
    theme: "growth",
  },
  {
    id: 10,
    name: "The Lantern",
    image: theLantern,
    meaning: "Clarity, hope, and light in dark waters.",
    theme: "clarity",
  },
  {
    id: 11,
    name: "The Hidden Treasure",
    image: theHiddenTreasure,
    meaning: "Unexpected reward, discovery, and something valuable within reach.",
    theme: "reward",
  },
  {
    id: 12,
    name: "The Oracle Jelly",
    image: theOracleJelly,
    meaning: "Fragile insight, intuition, and messages that drift into view.",
    theme: "insight",
  },
  {
    id: 13,
    name: "The Guardian Leviathan",
    image: theGuardianLeviathan,
    meaning: "Protection, ancient strength, and a force watching over you.",
    theme: "protection",
  },
  {
    id: 14,
    name: "The Shipwreck",
    image: theShipwreck,
    meaning: "Ruin, consequence, and the remains of what once was.",
    theme: "consequence",
  },
  {
    id: 15,
    name: "The Altar of Coral",
    image: theAltarOfCoral,
    meaning: "Devotion, patience, and slow sacred transformation.",
    theme: "devotion",
  },
  {
    id: 16,
    name: "The Deep Explorer",
    image: theDeepExplorer,
    meaning: "Curiosity, courage, and a willingness to go further.",
    theme: "exploration",
  },
  {
    id: 17,
    name: "The Moon Below",
    image: theMoonBelow,
    meaning: "Illusion, dreams, reflection, and truths beneath the surface.",
    theme: "illusion",
  },
  {
    id: 18,
    name: "The Serpent of Depths",
    image: theSerpentOfDepths,
    meaning: "Danger, transformation, and instincts that should not be ignored.",
    theme: "transformation",
  },
  {
    id: 19,
    name: "The Starfish",
    image: theStarfish,
    meaning: "Renewal, healing, and the ability to recover.",
    theme: "healing",
  },
  {
    id: 20,
    name: "The Trident",
    image: theTrident,
    meaning: "Action, willpower, and the ability to shape outcomes.",
    theme: "action",
  },
  {
    id: 21,
    name: "The Leviathan",
    image: theLeviathan,
    meaning: "Raw force, deep emotion, and something too big to dismiss.",
    theme: "intensity",
  },
  {
    id: 22,
    name: "The Mermaid",
    image: theMermaid,
    meaning: "Desire, emotion, and the pull between freedom and attachment.",
    theme: "emotion",
  },
  {
    id: 23,
    name: "The Lighthouse Above",
    image: theLighthouseAbove,
    meaning: "Guidance, warning, and a higher perspective.",
    theme: "perspective",
  },
  {
    id: 24,
    name: "The Ghost Ship",
    image: theGhostShip,
    meaning: "Echoes of the past, unfinished business, and spiritual drift.",
    theme: "memory",
  },
  {
    id: 25,
    name: "The Endless Depths",
    image: theEndlessDepths,
    meaning: "Infinity, uncertainty, and the vastness of what is still unknown.",
    theme: "vastness",
  },
];

export default tarotCards;