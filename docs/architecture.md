
# QuickNotes System Architecture

## 1. Functional Requirements

QuickNotes should allow users to:

- Register and authenticate.
- Create notes.
- View their notes.
- Update notes.
- Delete notes.
- Search and filter notes.
- Add tags to notes.
- View notes by tag.
- Access their notes from a browser or mobile client.

## 2. Non-Functional Requirements

The system should:

- Be available to users most of the time.
- Support approximately 1 million registered users.
- Scale horizontally as traffic increases.
- Protect user data.
- Respond quickly to normal read requests.
- Handle temporary failures gracefully.
- Support database backups and recovery.
- Avoid single points of failure.
- Allow background tasks to run asynchronously.

---

# 3. Load Estimate

For planning purposes, I assume:

- 1,000,000 registered users.
- 20% are active each day.
- 200,000 daily active users.
- Each active user reads 50 notes or note-feed items per day.
- Each active user creates 2 notes per day.
- Average note data stored is approximately 5 KB.
- A year has 365 days.
- Peak traffic can be approximately 5 times average traffic.

## Daily Reads

200,000 × 50 = 10,000,000 reads per day.

Average reads per second:

10,000,000 ÷ 86,400 ≈ 115.7 reads/second.

Therefore:

**Average reads ≈ 116 requests/second.**

At 5× peak:

116 × 5 ≈ 580 reads/second.

## Daily Writes

200,000 × 2 = 400,000 writes per day.

Average writes per second:

400,000 ÷ 86,400 ≈ 4.63 writes/second.

Therefore:

**Average writes ≈ 4.6 requests/second.**

At 5× peak:

4.63 × 5 ≈ 23.15 writes/second.

## Storage Per Year

400,000 notes are created per day.

400,000 × 365 = 146,000,000 notes per year.

Assuming each note requires approximately 5 KB:

146,000,000 × 5 KB = 730,000,000 KB.

This is approximately **730 GB per year** of raw note data.

This estimate excludes indexes, database overhead, backups, replicas, logs and
other infrastructure storage.

## Read-Heavy or Write-Heavy?

QuickNotes is primarily **read-heavy** because the estimated average is about
116 reads per second compared with approximately 4.6 writes per second.

The architecture should therefore focus on caching, efficient database queries,
CDN usage where appropriate, and database read replicas.

---

# 4. Architecture Diagram

```text
                         ┌──────────────────┐
                         │     Client       │
                         │ Browser / Mobile │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │       DNS        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │       CDN        │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │  Load Balancer   │
                         └────────┬─────────┘
                                  │
                   ┌──────────────┼──────────────┐
                   │              │              │
                   ▼              ▼              ▼
             ┌──────────┐   ┌──────────┐   ┌──────────┐
             │App Server│   │App Server│   │App Server│
             │    1     │   │    2     │   │    3     │
             └────┬─────┘   └────┬─────┘   └────┬─────┘
                  │              │              │
                  └──────────────┼──────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌─────────────┐          ┌───────────────┐
             │    Cache    │          │ Primary DB    │
             │   Redis     │          │               │
             └─────────────┘          └───────┬───────┘
                                              │
                                              ▼
                                      ┌───────────────┐
                                      │  Read Replica │
                                      └───────────────┘

                         Background Processing
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Queue       │
                         └────────┬─────────┘
                                  │
                                  ▼
                         ┌──────────────────┐
                         │      Worker      │
                         └──────────────────┘
```

---

# 5. Component Responsibilities

### Client

The client provides the user interface through which users create and view
their notes.

### DNS

DNS translates the QuickNotes domain name into the appropriate infrastructure
endpoint.

### CDN

The CDN serves cacheable static files such as JavaScript, CSS and images closer
to users, reducing latency and origin traffic.

### Load Balancer

The load balancer distributes requests across multiple application servers so
that traffic is not concentrated on one server.

### App Servers

The application servers execute the QuickNotes API and business logic.

### Cache

The cache stores frequently requested data so that repeated reads do not always
reach the database.

### Primary Database

The primary database stores authoritative QuickNotes data and handles writes.

### Read Replica

The read replica handles database read traffic and reduces the workload on the
primary database.

### Queue

The queue holds background jobs so that slow or non-critical work does not block
normal API requests.

### Worker

The worker processes queued background jobs asynchronously.

---

# 6. GET /notes Flow

When a user requests their notes:

1. The client sends `GET /notes`.
2. DNS resolves the QuickNotes domain.
3. The request reaches the CDN.
4. If the requested content is cacheable and available in the CDN, it can be
   returned directly.
5. Otherwise, the request reaches the load balancer.
6. The load balancer selects a healthy application server.
7. The application server authenticates the user.
8. The application checks the cache for the requested notes.
9. If the data is in the cache, the application returns it without querying the
   database.
10. If the data is not cached, the application queries the read replica.
11. The application stores suitable results in the cache.
12. The application returns the notes to the client.

---

# 7. POST /notes Flow

When a user creates a note:

1. The client sends `POST /notes` with the note title and body.
2. DNS resolves the QuickNotes domain.
3. The request passes through the CDN and load balancer.
4. The load balancer sends the request to a healthy application server.
5. The application authenticates the user.
6. The application validates the note data.
7. The application writes the new note to the primary database.
8. The primary database confirms the successful write.
9. The application returns a `201 Created` response to the client.
10. If additional background processing is required, the application places a
    job on the queue.
11. A worker processes the queued job asynchronously.

Writes go to the primary database rather than the read replica because the
primary database is the authoritative source for new data.

---

# 8. Scaling Trade-offs

## Trade-off 1: Cache vs Data Freshness

Caching improves read performance and reduces database load, but cached data can
become stale.

QuickNotes can use appropriate cache expiration and invalidation strategies to
reduce this problem.

## Trade-off 2: Read Replica vs Consistency

A read replica allows the application to handle more read traffic, but replication
can introduce a small delay.

A user might briefly see older data after creating or updating a note.

## Trade-off 3: More App Servers vs Infrastructure Cost

Running multiple application servers improves availability and allows horizontal
scaling, but it increases infrastructure costs.

The additional cost is justified because one server failure should not bring the
entire application down.

---

# 9. Avoiding Single Points of Failure

The system should avoid single points of failure by using multiple application
servers behind a load balancer. If one application server fails, the load
balancer can send requests to the healthy servers.

The database should have a read replica and regular backups. The cache should
also be deployed in a highly available configuration rather than relying on a
single cache server.

The queue and workers should support multiple workers so that one failed worker
does not stop background processing.

The load balancer itself should be provided as a highly available managed
service or deployed redundantly so that it does not become a single point of
failure.

---

# 10. Summary

QuickNotes is expected to be a read-heavy application with approximately
116 reads per second and 4.6 writes per second on average under the stated
assumptions.

The architecture uses horizontal application scaling, caching, a primary
database with a read replica, and asynchronous background processing.

This design provides a path for QuickNotes to grow from a small browser-based
application into a service capable of supporting approximately 1 million
registered users.
