import "./NotificationCard.css";

function NotificationCard({ notification }) {
  const getTypeClass = (type) => {
    switch (type) {
      case "Placement":
        return "placement";

      case "Result":
        return "result";

      case "Event":
        return "event";

      default:
        return "";
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <span
          className={`notification-badge ${getTypeClass(
            notification.Type
          )}`}
        >
          {notification.Type}
        </span>
      </div>

      <div className="card-body">
        <h3>{notification.Message}</h3>

        <p className="timestamp">
          {notification.Timestamp}
        </p>
      </div>
    </div>
  );
}

export default NotificationCard;
