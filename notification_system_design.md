# Notification System Design

## Stage 1: REST API Design

### Objective

Design a notification platform capable of delivering Event, Result, and Placement notifications to students.

### Notification Types

* Event
* Result
* Placement

### API Endpoints

#### Get Notifications

```http
GET /notifications
```

Response

```json
{
  "notifications": [
    {
      "id": "uuid",
      "type": "Placement",
      "message": "Amazon Hiring Drive",
      "timestamp": "2026-04-22T17:50:30Z"
    }
  ]
}
```

#### Create Notification

```http
POST /notifications
```

Request

```json
{
  "type": "Placement",
  "message": "Amazon Hiring Drive"
}
```

#### Mark Notification as Read

```http
PATCH /notifications/{id}/read
```

#### Delete Notification

```http
DELETE /notifications/{id}
```

### Notification Schema

```json
{
  "id": "uuid",
  "type": "Placement",
  "message": "Amazon Hiring Drive",
  "timestamp": "2026-04-22T17:50:30Z"
}
```

---

# Stage 2: Database Design

## Database Selection

PostgreSQL is selected because:

* Strong ACID compliance
* Efficient indexing support
* Excellent query performance
* Scales well for notification systems

### Notifications Table

```sql
CREATE TABLE notifications(
    id UUID PRIMARY KEY,
    student_id INT NOT NULL,
    type VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Explanation

| Column     | Purpose                        |
| ---------- | ------------------------------ |
| id         | Unique notification identifier |
| student_id | Recipient student              |
| type       | Event, Result, Placement       |
| message    | Notification content           |
| is_read    | Read status                    |
| created_at | Notification creation time     |

---

# Stage 3: Query Optimization

Given Query:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

## Problems

Without indexes:

* Full table scan
* High latency
* Poor scalability

### Recommended Index

```sql
CREATE INDEX idx_notifications_lookup
ON notifications(student_id, is_read, created_at);
```

### Benefits

* Faster filtering by student_id
* Faster unread notification retrieval
* Optimized sorting using created_at
* Reduced I/O operations

### Why Not Index Every Column?

Indexing every column:

* Increases storage requirements
* Slows INSERT operations
* Slows UPDATE operations
* Creates unnecessary maintenance overhead

Indexes should be created only for frequently queried columns.

---

# Stage 4: Performance Improvements

Problem:

Notifications are fetched on every page load causing excessive database load.

## Solution 1: Pagination

```http
GET /notifications?page=1&limit=20
```

Advantages:

* Smaller query results
* Faster response times
* Reduced database stress

---

## Solution 2: Redis Cache

Store frequently accessed notifications in Redis.

Advantages:

* Reduced database hits
* Faster responses

Tradeoffs:

* Additional memory usage
* Cache synchronization complexity

---

## Solution 3: Lazy Loading

Load notifications only when required.

Advantages:

* Better user experience
* Reduced initial load time

Tradeoffs:

* Additional frontend logic

---

# Stage 5: Notify-All Architecture

Current Implementation

```text
for each student:
    send_email()
    save_to_db()
    push_notification()
```

## Issues

* Sequential processing
* Poor scalability
* Failure impacts entire workflow
* High latency

## Proposed Solution

```text
Admin
  |
Notification Service
  |
Message Queue
  |
--------------------------------
|              |              |
Email Worker  Push Worker   DB Worker
```

### Queue Technologies

* Apache Kafka
* RabbitMQ
* AWS SQS

### Advantages

#### Scalability

Workers can be increased independently.

#### Reliability

Failed jobs can be retried automatically.

#### Fault Tolerance

Failure in one worker does not affect others.

#### Performance

Asynchronous execution significantly reduces processing time.

---

# Stage 6: Priority Notification Design

Priority Mapping

| Type      | Priority |
| --------- | -------- |
| Placement | 3        |
| Result    | 2        |
| Event     | 1        |

## Algorithm

```javascript
function getTopNotifications(notifications, limit) {
    const priority = {
        Placement: 3,
        Result: 2,
        Event: 1
    };

    return notifications
        .sort((a, b) => priority[b.Type] - priority[a.Type])
        .slice(0, limit);
}
```

### Time Complexity

```text
O(n log n)
```

### Space Complexity

```text
O(1)
```

### Optimization

For very large datasets, a Min Heap of size N can reduce complexity to:

```text
O(n log N)
```

---

# Stage 7: Frontend Architecture

## Technology Stack

* React
* Axios
* CSS

## Features

* Fetch notifications from API
* Notification filtering
* Pagination
* Top N priority notifications
* Responsive UI

### Component Structure

```text
App
|
|-- FilterBar
|
|-- NotificationList
      |
      |-- NotificationCard
```

### API Request

```http
GET /notifications?page=1&limit=20&notification_type=Placement
```

### User Flow

1. User opens application.
2. Notifications are fetched from API.
3. User filters notifications.
4. User selects Top N notifications.
5. Paginated results are displayed.
6. Responsive UI works on mobile and desktop.
