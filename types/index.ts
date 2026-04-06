export interface MomentPost {
  avatar: string;
  nickname: string;
  content: string;
  images: string[];
  location?: string;
  timestamp: string;
  likes: string[];
  comments: {
    user: string;
    text: string;
  }[];
}

export interface Draft extends MomentPost {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}
