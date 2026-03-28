'use client';

interface WelcomeMessageProps {
  userName: string;
}

export default function WelcomeMessage({ userName }: WelcomeMessageProps) {
  return (
    <div className="fixed z-50 flex w-auto items-center justify-center bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm animate-fade-in px-10  0---300">
      <div className="text-center space-y-4 animate-slide-up-fade-in">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Welcome back, {userName}!
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400">
          Here's an overview of your business activities
        </p>
      </div>
    </div>
  );
}
