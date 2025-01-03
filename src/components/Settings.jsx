import React, { useState, useEffect } from "react";
import { FaCog } from "react-icons/fa";

const Settings = ({
  onSave,
  initialDuration,
  initialPerformance,
  showSettings,
  setShowSettings,
}) => {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [performance, setPerformance] = useState(initialPerformance);
  const [isSettingsHovered, setIsSettingsHovered] = useState(false);

  useEffect(() => {
    const initialMinutes = Math.floor(initialDuration / 60);
    const initialSeconds = initialDuration % 60;
    setMinutes(initialMinutes);
    setSeconds(initialSeconds);
  }, [initialDuration]);

  const handleMinutesChange = (event) => {
    setMinutes(parseInt(event.target.value));
  };

  const handleSecondsChange = (event) => {
    setSeconds(parseInt(event.target.value));
  };

  const handlePerformanceChange = (event) => {
    setPerformance(event.target.value);
  };

  const handleSave = () => {
    const durationInSeconds = minutes * 60 + seconds;
    onSave({ duration: durationInSeconds, performance });
  };

  const handleSettingsMouseEnter = () => {
    setIsSettingsHovered(true);
  };

  const handleSettingsMouseLeave = () => {
    setIsSettingsHovered(false);
  };

  return (
    <>
      <div
        className="settings-icon"
        onClick={() => setShowSettings(!showSettings)}
        onMouseEnter={handleSettingsMouseEnter}
        onMouseLeave={handleSettingsMouseLeave}
      >
        <FaCog size={24} />
        <span className={`settings-text ${isSettingsHovered ? "visible" : ""}`}>
          Settings
        </span>
      </div>

      {showSettings && (
        <div className="settings-dropdown">
          <div className="settings">
            <h2>Settings</h2>
            <div className="time-setting">
              <label htmlFor="minutes">Duration:</label>
              <input
                type="number"
                id="minutes"
                value={minutes}
                onChange={handleMinutesChange}
                min="0"
              />
              <span>m :</span>
              <input
                type="number"
                id="seconds"
                value={seconds}
                onChange={handleSecondsChange}
                min="0"
                max="59"
              />
              <span>s</span>
            </div>
            <div className="performance-setting">
              <label htmlFor="performance">Performance:</label>
              <select
                id="performance"
                value={performance}
                onChange={handlePerformanceChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <button onClick={handleSave}>Save Settings</button>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;