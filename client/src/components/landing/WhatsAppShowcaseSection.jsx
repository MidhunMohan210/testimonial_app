import whatsappChat from "../../assets/landingPage/whatsappChat.png";

export default function WhatsAppShowcaseSection() {
  return (
    <section className="relative overflow-hidden bg-[#145c4e] px-l sm:pl-6 pb-20 h-screen ">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.08),transparent_30%)]" />

      <div className="relative mx-auto grid  items-center gap-12 lg:grid-cols-[1fr_auto] lg:gap-0">
        
        {/* Left: Text content */}
        <div className="max-w-xl text-white lg:px-8">
          <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-white/80">
            WhatsApp First
          </span>
          <h2 className="mt-6 text-4xl font-semibold leading-tight sm:text-5xl">
            Start real conversations and turn replies into testimonials.
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/78 sm:text-xl">
            Reach customers where they already respond fastest. Ask for a quick rating,
            follow up naturally, and collect clean feedback without sending them to
            another form.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm font-medium text-white/80">
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
              Higher reply rates
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
              Simple review flow
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-4 py-2">
              Built for service businesses
            </span>
          </div>
        </div>

        {/* Right: Image flush to the right */}
        <div className="flex justify-end lg:-mr-8">
          <img
            src={whatsappChat}
            alt="WhatsApp testimonial conversation preview"
            className="w-full max-w-[700px]  object-cover shadow-[0_38px_90px_-34px_rgba(0,0,0,0.45)] lg:-translate-y-10"
          />
        </div>

      </div>
    </section>
  );
}