# Supabase Integration Guide - Community Learning Features

## Overview

The community learning features are now fully integrated with Supabase for persistent data storage. This guide explains how to set up and use the database.

## Database Schema

### Tables Created

#### 1. **learning_groups**
Stores learning group information.

```sql
- id (UUID, Primary Key)
- name (VARCHAR 100)
- description (TEXT)
- topic (VARCHAR 50)
- icon (VARCHAR 10)
- level (VARCHAR 20: beginner, intermediate, advanced)
- color (VARCHAR 50)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 2. **learning_group_members**
Tracks which users are members of which groups.

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- group_id (UUID, Foreign Key → learning_groups)
- joined_at (TIMESTAMP)
- UNIQUE(user_id, group_id)
```

#### 3. **study_circles**
Stores scheduled study sessions.

```sql
- id (UUID, Primary Key)
- group_id (UUID, Foreign Key → learning_groups)
- title (VARCHAR 200)
- description (TEXT)
- scheduled_at (TIMESTAMP)
- duration (INTEGER, in minutes)
- facilitator_id (UUID, Foreign Key → auth.users)
- facilitator_name (VARCHAR 100)
- max_participants (INTEGER)
- topic (VARCHAR 100)
- status (VARCHAR 20: upcoming, ongoing, completed)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 4. **study_circle_participants**
Tracks participants in study circles.

```sql
- id (UUID, Primary Key)
- circle_id (UUID, Foreign Key → study_circles)
- user_id (UUID, Foreign Key → auth.users)
- joined_at (TIMESTAMP)
- attended (BOOLEAN)
- UNIQUE(circle_id, user_id)
```

#### 5. **shared_resources**
Stores learning resources shared by community members.

```sql
- id (UUID, Primary Key)
- group_id (UUID, Foreign Key → learning_groups)
- title (VARCHAR 200)
- description (TEXT)
- type (VARCHAR 20: article, video, exercise, guide, discussion)
- url (TEXT)
- content (TEXT)
- shared_by_id (UUID, Foreign Key → auth.users)
- shared_by_name (VARCHAR 100)
- likes_count (INTEGER)
- comments_count (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 6. **resource_tags**
Tags for categorizing resources.

```sql
- id (UUID, Primary Key)
- resource_id (UUID, Foreign Key → shared_resources)
- tag (VARCHAR 50)
- created_at (TIMESTAMP)
- UNIQUE(resource_id, tag)
```

#### 7. **resource_likes**
Tracks likes on resources.

```sql
- id (UUID, Primary Key)
- resource_id (UUID, Foreign Key → shared_resources)
- user_id (UUID, Foreign Key → auth.users)
- created_at (TIMESTAMP)
- UNIQUE(resource_id, user_id)
```

#### 8. **resource_comments**
Comments on shared resources.

```sql
- id (UUID, Primary Key)
- resource_id (UUID, Foreign Key → shared_resources)
- user_id (UUID, Foreign Key → auth.users)
- content (TEXT, max 500 chars)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 9. **discussion_threads**
Discussion threads in learning groups.

```sql
- id (UUID, Primary Key)
- group_id (UUID, Foreign Key → learning_groups)
- title (VARCHAR 200)
- description (TEXT)
- author_id (UUID, Foreign Key → auth.users)
- author_name (VARCHAR 100)
- replies_count (INTEGER)
- views_count (INTEGER)
- is_pinned (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- last_activity_at (TIMESTAMP)
```

#### 10. **discussion_tags**
Tags for discussion threads.

```sql
- id (UUID, Primary Key)
- thread_id (UUID, Foreign Key → discussion_threads)
- tag (VARCHAR 50)
- created_at (TIMESTAMP)
- UNIQUE(thread_id, tag)
```

#### 11. **discussion_replies**
Replies to discussion threads.

```sql
- id (UUID, Primary Key)
- thread_id (UUID, Foreign Key → discussion_threads)
- user_id (UUID, Foreign Key → auth.users)
- content (TEXT, max 1000 chars)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 12. **learning_challenges**
Learning challenges for community members.

```sql
- id (UUID, Primary Key)
- title (VARCHAR 200)
- description (TEXT)
- topic (VARCHAR 100)
- difficulty (VARCHAR 20: easy, medium, hard)
- duration (INTEGER, in days)
- icon (VARCHAR 10)
- start_date (TIMESTAMP)
- end_date (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### 13. **challenge_participants**
Tracks participants in challenges.

```sql
- id (UUID, Primary Key)
- challenge_id (UUID, Foreign Key → learning_challenges)
- user_id (UUID, Foreign Key → auth.users)
- joined_at (TIMESTAMP)
- completed_at (TIMESTAMP)
- progress_percentage (INTEGER, 0-100)
- UNIQUE(challenge_id, user_id)
```

#### 14. **challenge_rewards**
Rewards for completing challenges.

```sql
- id (UUID, Primary Key)
- challenge_id (UUID, Foreign Key → learning_challenges)
- reward_text (VARCHAR 200)
- points (INTEGER)
- created_at (TIMESTAMP)
```

#### 15. **learning_milestones**
User achievements in learning.

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users)
- group_id (UUID, Foreign Key → learning_groups)
- title (VARCHAR 200)
- description (TEXT)
- badge (VARCHAR 10)
- points (INTEGER)
- completed_at (TIMESTAMP)
```

#### 16. **user_learning_progress**
Overall learning progress for users.

```sql
- id (UUID, Primary Key)
- user_id (UUID, Foreign Key → auth.users, UNIQUE)
- total_groups_joined (INTEGER)
- total_circles_attended (INTEGER)
- total_resources_shared (INTEGER)
- total_discussions_started (INTEGER)
- total_challenges_completed (INTEGER)
- total_points (INTEGER)
- total_badges (INTEGER)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Setup Instructions

### Step 1: Create the Schema

1. Go to your Supabase project
2. Open the SQL Editor
3. Copy the contents of `sahara/supabase/learning_schema.sql`
4. Paste and run the SQL

This will create all the necessary tables, indexes, and Row Level Security policies.

### Step 2: Seed Demo Data (Optional)

1. Open the SQL Editor again
2. Copy the contents of `sahara/supabase/learning_seed.sql`
3. Paste and run the SQL

This will populate the database with demo data for testing.

### Step 3: Verify Setup

Check that all tables were created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'learning_%' 
OR table_name LIKE 'study_%' 
OR table_name LIKE 'shared_%' 
OR table_name LIKE 'resource_%' 
OR table_name LIKE 'discussion_%' 
OR table_name LIKE 'challenge_%' 
OR table_name LIKE 'user_learning_%';
```

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

### Public Read Access
- `learning_groups` - Anyone can view
- `study_circles` - Anyone can view
- `shared_resources` - Anyone can view
- `discussion_threads` - Anyone can view
- `learning_challenges` - Anyone can view

### User-Specific Access
- Users can only manage their own memberships
- Users can only like/unlike their own reactions
- Users can only comment/reply with their own account
- Users can only view their own milestones and progress

## API Functions

### Learning Groups

```typescript
// Get all learning groups
const groups = await getLearningGroups();

// Join a learning group
await joinLearningGroup(userId, groupId);

// Leave a learning group
await leaveLearningGroup(userId, groupId);
```

### Study Circles

```typescript
// Get all study circles
const circles = await getStudyCircles();

// Get circles for a specific group
const groupCircles = await getStudyCircles(groupId);

// Join a study circle
await joinStudyCircle(userId, circleId);

// Leave a study circle
await leaveStudyCircle(userId, circleId);
```

### Shared Resources

```typescript
// Get all shared resources
const resources = await getSharedResources();

// Get resources for a specific group
const groupResources = await getSharedResources(groupId);

// Like a resource
await likeResource(userId, resourceId);

// Unlike a resource
await unlikeResource(userId, resourceId);

// Comment on a resource
await commentOnResource(userId, resourceId, content);
```

### Discussion Threads

```typescript
// Get all discussion threads
const threads = await getDiscussionThreads();

// Get threads for a specific group
const groupThreads = await getDiscussionThreads(groupId);

// Reply to a thread
await replyToThread(userId, threadId, content);
```

### Learning Challenges

```typescript
// Get all learning challenges
const challenges = await getLearningChallenges();

// Join a challenge
await joinChallenge(userId, challengeId);

// Update challenge progress
await updateChallengeProgress(userId, challengeId, progress);
```

## Data Flow

### User Joins a Learning Group

1. User clicks "Join Group" button
2. `joinLearningGroup()` is called
3. Supabase inserts row into `learning_group_members`
4. RLS policy checks user owns the record
5. UI updates to show "Joined"

### User Likes a Resource

1. User clicks heart icon on resource
2. `likeResource()` is called
3. Supabase inserts row into `resource_likes`
4. Trigger increments `likes_count` on resource
5. UI updates to show filled heart

### User Comments on Resource

1. User submits comment form
2. `commentOnResource()` is called
3. Supabase inserts row into `resource_comments`
4. Trigger increments `comments_count` on resource
5. Comment appears in UI

## Performance Optimizations

### Indexes
All frequently queried columns have indexes:
- User IDs for filtering by user
- Group IDs for filtering by group
- Created/updated timestamps for sorting
- Status fields for filtering

### Aggregations
Counts are stored in denormalized columns:
- `likes_count` on resources
- `comments_count` on resources
- `replies_count` on threads
- `views_count` on threads

This avoids expensive COUNT queries.

### Triggers
Automatic triggers update:
- `updated_at` timestamps
- Denormalized count columns
- `last_activity_at` on threads

## Fallback to Demo Data

If Supabase is unavailable, the app automatically falls back to demo data:

```typescript
try {
  const groups = await getLearningGroups();
  // Use real data
} catch (error) {
  // Falls back to demoLearningGroups
  return demoLearningGroups;
}
```

This ensures the app works even without a database connection.

## Monitoring & Maintenance

### Monitor Usage

```sql
-- Count total members in groups
SELECT group_id, COUNT(*) as member_count
FROM learning_group_members
GROUP BY group_id;

-- Most popular resources
SELECT id, title, likes_count, comments_count
FROM shared_resources
ORDER BY likes_count DESC
LIMIT 10;

-- Active discussions
SELECT id, title, replies_count, views_count
FROM discussion_threads
WHERE last_activity_at > NOW() - INTERVAL '7 days'
ORDER BY last_activity_at DESC;
```

### Backup Data

Supabase automatically backs up your data. You can also manually export:

1. Go to Supabase Dashboard
2. Click "Backups"
3. Click "Download" on any backup

### Scale Considerations

- Current schema supports millions of records
- Indexes ensure fast queries even with large datasets
- RLS policies are efficient and don't impact performance
- Consider archiving old completed challenges after 1 year

## Troubleshooting

### Tables Not Appearing

1. Check SQL execution completed without errors
2. Refresh the Supabase dashboard
3. Verify you're in the correct project

### RLS Errors

If you get "new row violates row-level security policy":

1. Ensure user is authenticated
2. Check that user_id matches auth.uid()
3. Verify RLS policies are correctly set

### Slow Queries

1. Check indexes are created
2. Use EXPLAIN ANALYZE to profile queries
3. Consider adding more indexes if needed

## Next Steps

1. ✅ Schema created
2. ✅ Demo data seeded
3. ✅ RLS policies configured
4. ⏭️ Deploy to production
5. ⏭️ Monitor usage
6. ⏭️ Gather user feedback
7. ⏭️ Iterate on features

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Review the learning engine code: `sahara/src/lib/community-learning-engine.ts`
- Check the community page: `sahara/src/app/(app)/community/page.tsx`

---

**Version:** 2.0.0  
**Last Updated:** January 2026  
**Status:** Production Ready
