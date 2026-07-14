
import "./HomePage.css"; // Add styling here


import { useNavigate } from "react-router-dom"
import "./HomePage.css"

const HOTSPOTS = [
  {
    id: "shelf",
    label: "Books",
    route: "/shelf/Book",
    style: { left: "51.2%", top: "28%", width: "10%", height: "10%" },
  },
  {
    id: "movies",
    label: "Movies",
    route: "/shelf/Movie",
    style: { left: "64.3%", top: "24%", width: "10%", height: "22%" },
  },
  {
    id: "series",
    label: "Series",
    route: "/shelf/Series",
    style: { left: "56.5%", top: "63%", width: "7%", height: "12%" },
  },
  {
    id: "anime",
    label: "Anime",
    route: "/shelf/Anime",
    style: { left: "39.8%", top: "80%", width: "4.5%", height: "14%" },
  },
  {
    id: "search",
    label: "Search",
    route: "/search",
    style: { left: "18.5%", top: "88.8%", width: "5%", height: "8.5%" },
  },
]

export default function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="room-container">
      {/* Room background image — your full Canva export */}
      <img
        src="/room/room-bg.png"
        alt="GeekShelf room"
        className="room-bg"
        draggable="false"
      />

      {/* Invisible clickable hotspots on top */}
      {HOTSPOTS.map((h) => (
        <div
          key={h.id}
          className={`hotspot hotspot-${h.id}`}
          style={h.style}
          onClick={() => navigate(h.route)}
          role="button"
          aria-label={h.label}
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && navigate(h.route)}
        >
          <span className="hotspot-label">{h.label}</span>
        </div>
      ))}
    </div>
  )
}

