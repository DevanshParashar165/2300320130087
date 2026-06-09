import { useEffect, useState } from "react";
import { fetchNotifications } from "./services/api";
import NotificationList from "./components/NotificationList";
import { getTopNotifications } from "./utils/priority";

function App() {
  const [notifications, setNotifications] =
    useState([]);

  const [type, setType] = useState("All");

  const [topN, setTopN] = useState(20);

  useEffect(() => {
    const loadNotifications = async () => {
      const data =
        await fetchNotifications();

      setNotifications(data);
    };

    loadNotifications();
  }, []);

  let filtered =
    type === "All"
      ? notifications
      : notifications.filter(
          (item) => item.Type === type
        );

  filtered = getTopNotifications(
    filtered,
    topN
  );

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "auto",
        padding: "20px",
      }}
    >
      <h1>Notification Dashboard</h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
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