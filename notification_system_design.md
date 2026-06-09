# Notification System Design

## Stage 1: REST API Design

### Objective

Design a notification platform capable of delivering Event, Result, and Placement notifications to students.

### Notification Types

* Event
* Result
* Placement

---

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
      "_id": "6618e4c4b81d0c0e2a8c2f12",
      "studentId": 1042,
      "type": "Placement",
      "message": "Amazon Hiring Drive",
      "isRead": false,
      "createdAt": "2026-04-22T17:50:30Z"
    }
  ]
}
```

---

#### Create Notification

```http
POST /notifications
```

Request

```json
{
  "studentId": 1042,
  "type": "Placement",
  "message": "Amazon Hiring Drive"
}
```

---

#### Mark Notification As Read

```http
PATCH /notifications/:id/read
```

Response

```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

#### Delete Notification

```http
DELETE /notifications/:id
```

Response

```json
{
  "success": true,
  "message": "Notification deleted"
}
```

---

### Notification Schema

```json
{
  "_id": "ObjectId",
  "studentId": 1042,
  "type": "Placement",
  "message": "Amazon Hiring Drive",
  "isRead": false,
  "createdAt": "2026-04-22T17:50:30Z"
}
```

---

# Stage 2: Database Design

## Database Choice

MongoDB is selected because:

* Flexible schema design
* High write throughput
* Easy horizontal scaling
* JSON document structure aligns naturally with notification data
* Suitable for large-scale notification systems

---

## Collection: notifications

```javascript
{
  _id: ObjectId,
  studentId: Number,
  type: String,
  message: String,
  isRead: Boolean,
  createdAt: Date
}
```

### Example Document

```javascript
{
  _id: ObjectId("6618e4c4b81d0c0e2a8c2f12"),
  studentId: 1042,
  type: "Placement",
  message: "Amazon Hiring Drive",
  isRead: false,
  createdAt: ISODate("2026-04-22T17:50:30Z")
}
```

---

## Indexing Strategy

```javascript
db.notifications.createIndex({
    studentId: 1,
    isRead: 1,
    createdAt: 1
})
```

### Benefits

* Faster unread notification retrieval
* Optimized sorting by timestamp
* Reduced collection scans
* Better scalability

---

# Stage 3: Query Optimization

### Existing Query

```javascript
db.notifications.find({
    studentId: 1042,
    isRead: false
}).sort({
    createdAt: 1
})
```

---

## Potential Problems

Without indexes:

* Full collection scans
* High query latency
* Poor performance as records increase

---

## Optimized Solution

Create Compound Index

```javascript
db.notifications.createIndex({
    studentId: 1,
    isRead: 1,
    createdAt: 1
})
```

### Why This Works

MongoDB can:

1. Filter by studentId
2. Filter by isRead
3. Return sorted results using the index

without performing an additional in-memory sort.

---

## Why Not Index Every Field?

Indexing every field causes:

* Higher storage consumption
* Slower inserts
* Slower updates
* Increased maintenance cost

Indexes should only be created for frequently queried fields.

---

# Stage 4: Performance Improvements

## Problem

Notifications are fetched every time a user opens the application, causing excessive database load.

---

## Solution 1: Pagination

API

```http
GET /notifications?page=1&limit=20
```

Benefits

* Smaller result sets
* Faster queries
* Reduced memory consumption

Tradeoff

* Multiple requests required

---

## Solution 2: Redis Caching

Architecture

```text
Client
   |
Redis Cache
   |
MongoDB
```

Benefits

* Faster response times
* Reduced database hits

Tradeoff

* Additional memory usage
* Cache invalidation complexity

---

## Solution 3: Lazy Loading

Load notifications only when users scroll.

Benefits

* Reduced initial API calls
* Improved user experience

Tradeoff

* Additional frontend implementation complexity

---

# Stage 5: Notify-All Architecture

### Existing Implementation

```javascript
for(student of students){
    sendEmail(student);
    saveNotification(student);
    pushNotification(student);
}
```

---

## Problems

* Sequential execution
* High latency
* Not scalable for 50,000 students
* Failure in one operation affects overall processing

---

## Proposed Architecture

```text
Admin
   |
Notification Service
   |
Message Queue
   |
-----------------------------------
|               |                |
Email Worker  Push Worker   DB Worker
```

---

## Queue Options

* RabbitMQ
* Apache Kafka
* AWS SQS

---

## Advantages

### Scalability

Workers can be increased independently.

### Reliability

Failed messages can be retried automatically.

### Fault Tolerance

Failure in one worker does not affect others.

### Performance

Notification requests become asynchronous.

---

# Stage 6: Priority Notification Design

## Priority Mapping

| Type      | Priority |
| --------- | -------- |
| Placement | 3        |
| Result    | 2        |
| Event     | 1        |

---

## Algorithm

```javascript
function getTopNotifications(notifications, limit) {

    const priority = {
        Placement: 3,
        Result: 2,
        Event: 1
    };

    return [...notifications]
        .sort((a, b) =>
            priority[b.Type] - priority[a.Type]
        )
        .slice(0, limit);
}
```

---

## Time Complexity

```text
O(n log n)
```

---

## Optimization

For larger datasets, a Min Heap of size N can be used to achieve:

```text
O(n log N)
```

which is more efficient when N is much smaller than total notifications.

---

# Stage 7: Frontend Architecture

## Technology Stack

* React
* Axios
* CSS

---

## Features

* Fetch notifications from API
* Filter by notification type
* Pagination
* Top N priority notifications
* Responsive design

---

## Component Structure

```text
App
|
|-- FilterBar
|
|-- NotificationList
      |
      |-- NotificationCard
```

---

## API Integration

```http
GET /notifications?page=1&limit=20&notification_type=Placement
```

---

## User Flow

1. User opens application.
2. Notifications are fetched from API.
3. User filters notifications by type.
4. User selects Top N notifications.
5. Paginated results are displayed.
6. Responsive layout supports desktop and mobile devices.

---

# Conclusion

The proposed architecture leverages MongoDB for scalable notification storage, Redis for caching, and message queues for reliable notification delivery. The system is designed to handle large volumes of notifications while maintaining high performance, scalability, and reliability.
