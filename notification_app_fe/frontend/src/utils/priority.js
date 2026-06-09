export const getTopNotifications = (notifications,limit) => {
  const priority = {
    Placement: 3,
    Result: 2,
    Event: 1,
  };

  return [...notifications]
    .sort(
      (a, b) =>
        priority[b.Type] -
        priority[a.Type]
    )
    .slice(0, limit);
};

