export default function EditorLoading() {
  return (
    <div className="h-screen w-screen bg-[#1a1a2e] flex flex-col overflow-hidden">
      {/* Toolbar skeleton */}
      <div className="h-14 bg-[#0f0f23] border-b border-white/10 flex items-center px-4 gap-4 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-white/5 animate-pulse" />
        <div className="w-40 h-6 rounded bg-white/5 animate-pulse" />
        <div className="flex-1" />
        <div className="flex gap-2">
          <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-20 h-8 rounded-lg bg-white/5 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left sidebar skeleton */}
        <div className="w-[280px] bg-[#12122b] border-r border-white/10 p-4 space-y-3 hidden lg:block">
          <div className="flex gap-2 mb-4">
            <div className="flex-1 h-9 rounded-lg bg-white/5 animate-pulse" />
            <div className="flex-1 h-9 rounded-lg bg-white/5 animate-pulse" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[16/9] rounded-lg bg-white/5 animate-pulse"
            />
          ))}
        </div>

        {/* Center canvas skeleton */}
        <div className="flex-1 flex items-center justify-center bg-[#2a2a3e] p-8">
          <div className="w-full max-w-4xl aspect-[16/9] rounded-xl bg-white/5 animate-pulse" />
        </div>

        {/* Right properties skeleton */}
        <div className="w-[300px] bg-white border-l border-gray-200 p-4 space-y-4 hidden lg:block">
          <div className="h-6 w-32 rounded bg-gray-100 animate-pulse" />
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i}>
                <div className="h-4 w-20 rounded bg-gray-100 animate-pulse mb-2" />
                <div className="h-10 rounded-lg bg-gray-50 animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
