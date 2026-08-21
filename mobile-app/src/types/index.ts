export type User = {
  id: string;
  name: string;
  username: string;
  email?: string;
  avatar: string;
  avatarUrl?: string;
  coverImage?: string;
  bio: string;
  location: string;
  website?: string;
  followers: number;
  following: number;
  verified: boolean;
  joinedDate: string;
};

export type Comment = {
  id: string;
  _id?: string;
  userId: string;
  username: string;
  name: string;
  avatar: string;
  text: string;
  content?: string;
  time: string;
  createdAt?: string;
  likes: number;
  author?: {
    id?: string;
    username: string;
    avatarUrl?: string;
  };
};

export type Post = {
  id: string;
  _id?: string;
  userId: string;
  username: string;
  name: string;
  avatar: string;
  verified: boolean;
  content: string;
  image?: string;
  time: string;
  timeAgo: string;
  likes: string[];
  likeCount?: number;
  comments: Comment[];
  commentCount?: number;
  shares: number;
  bookmarks: string[];
  views: number;
  tags: string[];
  author?: {
    id?: string;
    username: string;
    avatarUrl?: string;
  };
  createdAt?: string;
};

export type Story = {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  image: string;
  seen: boolean;
  timeAgo?: string;
};

export type NotificationType = "like" | "comment" | "follow" | "mention" | "repost";

export type Notification = {
  id: string;
  _id?: string;
  type: NotificationType;
  from: string;
  fromId: string;
  fromAvatar: string;
  postId?: string;
  postSnippet?: string;
  text: string;
  time: string;
  read: boolean;
  createdAt?: string;
};

export type Tab = "home" | "explore" | "create" | "notifications" | "profile";

export type PaginatedPosts = {
  items: Post[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type AuthResponse = {
  user: User;
  token: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
  name?: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
