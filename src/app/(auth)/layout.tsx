export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative z-10">
      <div className="mb-8 text-center">
        <h1 className="font-mono text-4xl font-bold tracking-tight text-white">
          SYNTH<span className="text-[#00f0ff]">DRIVE</span>
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          AI-Powered AV Perception Test Suite
        </p>
      </div>
      <div className="glass-card p-8 w-full max-w-sm">
        {children}
      </div>
    </div>
  );
}
