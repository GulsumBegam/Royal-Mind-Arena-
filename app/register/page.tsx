import RegisterForm from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="flex justify-center gap-4 mb-4">
            <span className="text-3xl text-gold-400">♛</span>
            <span className="text-3xl text-gold-400">♚</span>
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2">Royal Mind Arena</h1>
          <p className="text-royal-400 text-sm mt-1">✦ Join the Arena ✦</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
