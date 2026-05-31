import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center gap-4 mb-4">
            <span className="text-3xl text-gold-400">♛</span>
            <span className="text-3xl text-gold-400">♚</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Royal Mind Arena</h1>
          <p className="text-royal-300 text-sm">Created by Gulsumrahuman</p>
          <p className="text-royal-400 text-sm mt-1">✦ Experience Chess Like Never Before ✦</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
