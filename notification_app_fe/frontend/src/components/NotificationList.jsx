import NotificationCard from "./NotificationCard";

function NotificationList({ notifications }) {
  if (!notifications.length) {
    return (
      <div
        style={{
          textAlign: "center",
          marginTop: "40px",
        }}
      >
        <h2>No Notifications Found</h2>
      </div>
    );
  }

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.ID}
          notification={notification}
        />
      ))}
    </div>
  );
}

export default NotificationList;

