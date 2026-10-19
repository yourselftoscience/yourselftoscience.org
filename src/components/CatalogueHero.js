export default function CatalogueHero() {
  return (
      <section className="relative bg-white border-b border-slate-200 overflow-hidden">
        {/* Gradient Blobs (matching wizard pages) */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-30">
          <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-200 rounded-full blur-3xl" />
          <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] bg-indigo-200 rounded-full blur-3xl" />
          <div className="absolute bottom-[5%] left-[30%] w-[30%] h-[30%] bg-purple-100 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 pt-12 pb-6 md:pt-16 md:pb-8 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-600 drop-shadow-sm mb-4 md:mb-6 tracking-tight leading-tight pb-2">
            Contribute to Research
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-2 leading-relaxed">
            A comprehensive open-source catalogue for contributing your biological and digital self to scientific research.
            Browse opportunities to share your data, genome, biological samples, and more.
          </p>
        </div>
      </section>
  );
}
