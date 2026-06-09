import { useEffect, useState } from "react";
import { fetchNotifications } from "./services/api";
import NotificationList from "./components/NotificationList";
import { getTopNotifications } from "./utils/priority";
import "./App.css";

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
      } catch (err) {
        setError("Failed to load notifications");
        console.log(err);
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
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="search-input"
        />

        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value)
          }
        >
          <option>All</option>
          <option>Event</option>
          <option>Result</option>
          <option>Placement</option>
        </select>

        <select
          value={topN}
          onChange={(e) =>
            setTopN(Number(e.target.value))
          }
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