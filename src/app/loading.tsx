export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] px-6 py-20 animate-pulse">
      <div className="grid md:grid-cols-12 gap-10">
        <div className="md:col-span-7 space-y-6">
          <div className="h-4 w-32 bg-ink/10" />
          <div className="space-y-3">
            <div className="h-14 bg-ink/10 w-5/6" />
            <div className="h-14 bg-ink/10 w-3/4" />
            <div className="h-14 bg-ink/10 w-2/3" />
          </div>
          <div className="h-24 bg-ink/10 w-full max-w-xl" />
        </div>
        <div className="md:col-span-5">
          <div className="aspect-[4/3] bg-ink/10 w-full" />
        </div>
      </div>
    </div>
  );
}
