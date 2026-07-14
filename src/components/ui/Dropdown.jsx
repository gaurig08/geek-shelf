import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import "./Dropdown.css";

/**
 * @param {{value: string, label: string}[]} options
 * @param {string} value - currently selected option's value
 * @param {(value: string) => void} onChange
 */
const Dropdown = ({ options, value, onChange, ariaLabel }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div className="ui-dropdown" ref={ref}>
      <button
        type="button"
        className={`neu-surface neu-raised ui-dropdown-btn ${open ? "open" : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
      >
        <span>{selected?.label ?? "Select"}</span>
        <span className="ui-dropdown-chevron">▾</span>
      </button>

      <div className={`neu-surface neu-raised ui-dropdown-panel ${open ? "open" : ""}`} role="listbox">
        {options.map((opt) => (
          <div
            key={opt.value}
            role="option"
            aria-selected={opt.value === value}
            className={`ui-dropdown-option ${opt.value === value ? "neu-inset selected" : ""}`}
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
          >
            {opt.label}
          </div>
        ))}
      </div>
    </div>
  );
};

Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({ value: PropTypes.string.isRequired, label: PropTypes.string.isRequired })
  ).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  ariaLabel: PropTypes.string,
};

export default Dropdown;
