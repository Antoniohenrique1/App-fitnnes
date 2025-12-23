import { db } from "./db.js";
import { eq, and, desc, sql } from "drizzle-orm";
import { posts, postLikes, postComments, follows, users, userStats } from "../shared/schema.js";

/**
 * Create a new post in the social feed
 */
export async function createPost(userId: string, data: {
  type: "workout" | "achievement" | "milestone" | "challenge";
  content?: string;
  media?: string[];
  workoutId?: string;
  achievementId?: string;
  visibility?: "public" | "friends" | "private";
}) {
  const [post] = await db
    .insert(posts)
    .values({
      userId,
      type: data.type,
      content: data.content,
      media: data.media,
      workoutId: data.workoutId,
      achievementId: data.achievementId,
      visibility: data.visibility || "public",
    })
    .returning();

  // Increment posts created in user stats
  await db
    .update(userStats)
    .set({
      postsCreated: sql`${userStats.postsCreated} + 1`,
      socialScore: sql`${userStats.socialScore} + 15`, // Reward for posting
    })
    .where(eq(userStats.userId, userId));

  return post;
}

/**
 * Get feed for a user (posts from followed users + public posts)
 */
export async function getFeed(userId: string, limit = 20, offset = 0) {
  // Get IDs of users followed by the current user
  const followedUsers = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, userId));

  const followedIds = followedUsers.map(f => f.followingId);
  followedIds.push(userId); // Include own posts

  const feed = await db
    .select({
      post: posts,
      user: users,
      stats: userStats,
    })
    .from(posts)
    .innerJoin(users, eq(posts.userId, users.id))
    .innerJoin(userStats, eq(users.id, userStats.userId))
    .where(
      sql`${posts.visibility} = 'public' OR ${posts.userId} IN ${followedIds}`
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  return feed;
}

/**
 * Like/Unlike a post
 */
export async function toggleLike(userId: string, postId: string) {
  const [existingLike] = await db
    .select()
    .from(postLikes)
    .where(
      and(
        eq(postLikes.postId, postId),
        eq(postLikes.userId, userId)
      )
    )
    .limit(1);

  if (existingLike) {
    // Unlike
    await db.delete(postLikes).where(eq(postLikes.id, existingLike.id));
    await db
      .update(posts)
      .set({ likes: sql`${posts.likes} - 1` })
      .where(eq(posts.id, postId));
    return { liked: false };
  } else {
    // Like
    await db.insert(postLikes).values({ userId, postId });
    await db
      .update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, postId));

    // Reward post owner with social score
    const [post] = await db.select().from(posts).where(eq(posts.id, postId)).limit(1);
    if (post) {
      await db
        .update(userStats)
        .set({ socialScore: sql`${userStats.socialScore} + 2` })
        .where(eq(userStats.userId, post.userId));
    }

    return { liked: true };
  }
}

/**
 * Add comment to a post
 */
export async function addComment(userId: string, postId: string, content: string) {
  const [comment] = await db
    .insert(postComments)
    .values({ userId, postId, content })
    .returning();

  await db
    .update(posts)
    .set({ comments: sql`${posts.comments} + 1` })
    .where(eq(posts.id, postId));

  return comment;
}

/**
 * Follow/Unfollow a user
 */
export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId) throw new Error("Cannot follow yourself");

  const [existingFollow] = await db
    .select()
    .from(follows)
    .where(
      and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      )
    )
    .limit(1);

  if (existingFollow) {
    await db.delete(follows).where(eq(follows.id, existingFollow.id));
    return { followed: false };
  } else {
    await db.insert(follows).values({ followerId, followingId });
    return { followed: true };
  }
}

/**
 * Get leaderboard data
 */
export async function getLeaderboard(type: "global" | "friends", period: "weekly" | "all_time", userId?: string) {
  let query = db
    .select({
      user: users,
      stats: userStats,
    })
    .from(userStats)
    .innerJoin(users, eq(userStats.userId, users.id));

  if (type === "friends" && userId) {
    const followedUsers = await db
      .select({ followingId: follows.followingId })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const friendIds = followedUsers.map(f => f.followingId);
    friendIds.push(userId);

    query = query.where(sql`${userStats.userId} IN ${friendIds}`) as any;
  }

  const orderBy = period === "weekly" ? desc(userStats.weeklyXP) : desc(userStats.totalXpEarned);

  return await query.orderBy(orderBy).limit(10);
}

/**
 * Get comprehensive profile data for a user
 */
export async function getUserProfileData(userId: string) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const [stats] = await db.select().from(userStats).where(eq(userStats.userId, userId)).limit(1);

  const [followersCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(follows)
    .where(eq(follows.followingId, userId));

  const [followingCount] = await db
    .select({ count: sql`count(*)::int` })
    .from(follows)
    .where(eq(follows.followerId, userId));

  const userPosts = await db
    .select()
    .from(posts)
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt))
    .limit(12);

  const userBadgesList = await db
    .select()
    .from(userBadges)
    .where(eq(userBadges.userId, userId));

  return {
    user: user ? {
      id: user.id,
      username: user.username,
      name: user.name,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      createdAt: user.createdAt
    } : null,
    stats,
    followersCount: followersCount?.count || 0,
    followingCount: followingCount?.count || 0,
    posts: userPosts,
    badges: userBadgesList,
  };
}
