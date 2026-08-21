# Database

MongoDB stores users, posts, comments, and likes. User passwords are stored as bcrypt hashes. Likes have a compound unique index on `(post, user)` so toggling remains idempotent at the data layer.

Posts keep denormalized `likeCount` and `commentCount` values for efficient feed rendering. The service layer updates those counters whenever an interaction changes.
