'use client';

import { useState } from 'react';
import { Heart, MessageCircle, Share2, Send, Image, Smile, MoreHorizontal, ThumbsUp } from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
}

const posts: Post[] = [
  {
    id: '1',
    author: {
      name: 'Voctrum Employee',
      role: 'Marketing Manager',
      avatar: 'SJ'
    },
    content: 'Excited to announce that our Q1 campaign exceeded expectations by 25%! 🎉 Huge thanks to the entire marketing team for their dedication and creativity. Looking forward to an even better Q2!',
    image: undefined,
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    shares: 3,
    liked: false
  },
  {
    id: '2',
    author: {
      name: 'Marib Hamid',
      role: 'Product Lead',
      avatar: 'MC'
    },
    content: 'Just wrapped up an amazing product demo with a potential client. The new features we shipped last week really impressed them. Great work engineering team! 💪',
    timestamp: '4 hours ago',
    likes: 31,
    comments: 12,
    shares: 5,
    liked: true
  },
  {
    id: '3',
    author: {
      name: 'Irfan Yousuf',
      role: 'HR Director',
      avatar: 'ED'
    },
    content: 'Reminder: Our annual team building event is scheduled for next Friday! 🎊 Please RSVP by Wednesday. It\'s going to be a fun day with activities, food, and prizes. See you all there!',
    timestamp: '6 hours ago',
    likes: 45,
    comments: 18,
    shares: 7,
    liked: true
  },
  {
    id: '4',
    author: {
      name: 'Simnan',
      role: 'Sales Director',
      avatar: 'JW'
    },
    content: 'Congratulations to our sales team for closing the biggest deal of the year! 🏆 This partnership will open up incredible opportunities for growth. Proud of everyone\'s hard work!',
    timestamp: '1 day ago',
    likes: 67,
    comments: 23,
    shares: 12,
    liked: false
  },
  {
    id: '5',
    author: {
      name: 'Uzair Bashir',
      role: 'Operations Manager',
      avatar: 'LA'
    },
    content: 'We\'ve successfully implemented the new inventory management system across all warehouses. Efficiency has improved by 30% already! Thanks to the IT and operations teams for the smooth transition.',
    timestamp: '2 days ago',
    likes: 38,
    comments: 15,
    shares: 6,
    liked: false
  }
];

export default function SocialFeedSection() {
  const [postList, setPostList] = useState(posts);
  const [newPost, setNewPost] = useState('');

  const handleLike = (postId: string) => {
    setPostList(postList.map(post => 
      post.id === postId 
        ? { ...post, liked: !post.liked, likes: post.liked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handlePost = () => {
    if (newPost.trim()) {
      const post: Post = {
        id: Date.now().toString(),
        author: {
          name: 'You',
          role: 'Your Role',
          avatar: 'YO'
        },
        content: newPost,
        timestamp: 'Just now',
        likes: 0,
        comments: 0,
        shares: 0,
        liked: false
      };
      setPostList([post, ...postList]);
      setNewPost('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Create Post Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
            YO
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share an update with your team..."
              className="w-full p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Image className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <Smile className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
              <button
                onClick={handlePost}
                disabled={!newPost.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                Post
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {postList.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Post Header */}
            <div className="p-5 pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {post.author.avatar}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {post.author.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {post.author.role} • {post.timestamp}
                    </p>
                  </div>
                </div>
                <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreHorizontal className="w-5 h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Post Content */}
            <div className="px-5 pb-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {post.content}
              </p>
            </div>

            {/* Post Image (if exists) */}
            {post.image && (
              <div className="px-5 pb-3">
                <img
                  src={post.image}
                  alt="Post content"
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Post Stats */}
            <div className="px-5 py-2 border-t border-b border-slate-100 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
                  <span>{post.likes} likes</span>
                </div>
                <div className="flex items-center gap-3">
                  <span>{post.comments} comments</span>
                  <span>{post.shares} shares</span>
                </div>
              </div>
            </div>

            {/* Post Actions */}
            <div className="p-3 flex items-center justify-around">
              <button
                onClick={() => handleLike(post.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  post.liked
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Heart className={`w-5 h-5 ${post.liked ? 'fill-current' : ''}`} />
                <span className="text-sm font-medium">Like</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Comment</span>
              </button>
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <Share2 className="w-5 h-5" />
                <span className="text-sm font-medium">Share</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
