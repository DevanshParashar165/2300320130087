import { useEffect, useState } from "react";
import { fetchNotifications } from "./services/api";
import NotificationList from "./components/NotificationList";
import { getTopNotifications } from "./utils/priority";
import "./App.css";
import Log from "../../../logging_middleware/log.js";

function App() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [type, setType] = useState("All");
  const [topN, setTopN] = useState(20);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);

        const data = await fetchNotifications();
        setNotifications(data);
        await Log("frontend","info","component","Notification dashboard loaded successfully");
      } catch (err) {
        setError("Failed to load notifications");
        console.log(err);
        await Log("frontend","error","component",err.message);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const sortedNotifications = [...notifications].sort(
    (a, b) =>
      new Date(b.Timestamp) - new Date(a.Timestamp)
  );

  let filtered =
    type === "All"
      ? sortedNotifications
      : sortedNotifications.filter(
          (item) => item.Type === type
        );

  filtered = filtered.filter((item) =>
    item.Message.toLowerCase().includes(
      search.toLowerCase()
    )
  );

  filtered = getTopNotifications(
    filtered,
    topN
  );

  if (loading) {
    return (
      <div className="loading">
        Loading Notifications...
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <div>
          <h1>Notification Dashboard</h1>
          <p className="subtitle">
            <br/>
            Smart Notification Management
          </p>
        </div>

        <div className="stats-card">
          <span>Total Notifications</span>
          <h2>{filtered.length}</h2>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="controls">
        <input
          type="text"
          placeholder="Search notifications..."
          value={search}
          onChange={async (e) => {
  const value = e.target.value;

  setSearch(value);

  if (value.length > 2) {
    await Log("frontend","info","component",`Search performed: ${value}`);
  }
}}
          className="search-input"
        />

        <select
          value={type}
          onChange={async (e) => {
    const value = e.target.value;

    setType(value);

    await Log( "frontend", "info", "component",`Notification filter changed to ${value}`);
  }}
        >
          <option>All</option>
          <option>Event</option>
          <option>Result</option>
          <option>Placement</option>
        </select>

        <select
          value={topN}
          onChange={async (e) => {
    const value = Number(e.target.value);

    setTopN(value);

    await Log("frontend","info","component",`Top ${value} notifications selected`);
  }}
        >
          <option value={5}>Top 5</option>
          <option value={10}>Top 10</option>
          <option value={20}>Top 20</option>
        </select>
      </div>

      <NotificationList
        notifications={filtered}
      />
    </div>
  );
}

export default App;