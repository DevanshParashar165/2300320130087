function NotificationCard({ notification }) {
  return (
    <div className="card">
      <h3>{notification.Type}</h3>

      <p>{notification.Message}</p>

      <small>{notification.Timestamp}</small>
    </div>
  );
}

export default NotificationCard;

