import PropTypes from "prop-types";
import "./Toggle.css";

// Fixed star positions (with slight jitter) so they scatter evenly
// across the right side of the track - opposite where the moon knob
// sits in night mode - instead of clustering, which is what pure
// random positioning produced during design.
const STAR_POSITIONS_LG = [
  [60, 8], [78, 6], [92, 14], [66, 20], [84, 24],
  [58, 34], [90, 36], [72, 42], [62, 44], [86, 46],
];
const STAR_POSITIONS_SM = [
  [38, 5], [48, 4], [56, 8], [40, 13], [52, 15], [36, 21], [54, 23],
];

/**
 * Animated day/night toggle. `size="sm"` is used in compact contexts
 * like the profile panel; default is the larger nav/settings version.
 */
const Toggle = ({ isDay, onToggle, size = "default" }) => {
  const stars = size === "sm" ? STAR_POSITIONS_SM : STAR_POSITIONS_LG;

  return (
    <div
      className={`ui-toggle ui-toggle-${size} ${isDay ? "day" : ""}`}
      onClick={onToggle}
      role="button"
      tabIndex={0}
      aria-label={isDay ? "Switch to night mode" : "Switch to day mode"}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onToggle()}
    >
      <div className="ui-toggle-stars">
        {stars.map(([x, y], i) => (
          <div
            key={i}
            className="ui-toggle-star"
            style={{ left: `${x}px`, top: `${y}px` }}
          />
        ))}
      </div>
      <div className="ui-toggle-cloud c1" />
      <div className="ui-toggle-cloud c2" />
      <div className="ui-toggle-knob">
        <div className="ui-toggle-crater" style={{ width: 5, height: 5, top: 8, left: 6 }} />
        <div className="ui-toggle-crater" style={{ width: 3, height: 3, top: 16, left: 15 }} />
        <div className="ui-toggle-crater" style={{ width: 4, height: 4, top: 21, left: 8 }} />
      </div>
    </div>
  );
};

Toggle.propTypes = {
  isDay: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  size: PropTypes.oneOf(["default", "sm"]),
};

export default Toggle;
