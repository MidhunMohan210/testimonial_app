import { motion } from "framer-motion";
import { BadgeCheck, EyeOff, PlugZap, ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import image1 from "../../assets/landingPage/widget/runningWidget.png";
import image2 from "../../assets/landingPage/widget/detailWidget.png";

const trustPoints = [
  {
    id: "verified",
    text: "Works on any website",
    icon: BadgeCheck,
  },
  {
    id: "private",
    text: "Updates automatically when you approve reviews",
    icon: EyeOff,
  },
  {
    id: "embed",
    text: "Fully responsive and customizable",
    icon: PlugZap,
  },
];

export default function LiveTestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-[#EEEEEE] px-6 py-20 sm:px-10 lg:px-16 lg:py-32">
      {/* Decorative ambient background blur */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-slate-100/60 blur-[100px] lg:-top-20 lg:left-0 lg:translate-x-0" />

      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        
        {/* LEFT SIDE: Overlapping Images */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full pt-12 sm:pt-16 lg:pt-0"
        >
          {/* Subtle glow specifically behind the images */}
          <div className="absolute left-1/4 top-1/4 -z-10 h-2/3 w-2/3 rounded-full bg-indigo-500/10 blur-[80px]" />

          {/* Base Image */}
          <div className="relative ml-auto w-[85%] rounded-[2rem] border border-slate-200/60 bg-white/50 p-2 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.1)] backdrop-blur-xl">
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
              <img 
                src={image1} 
                alt="Woice Widget" 
                className="h-auto w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          {/* Overlapping Image */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-0 z-10 w-[60%] sm:-left-4 sm:top-4"
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="rounded-3xl border border-white/60 bg-white/40 p-1.5 shadow-[0_30px_60px_-15px_rgba(15,23,42,0.2)] backdrop-blur-md"
            >
              <div className="overflow-hidden rounded-[1.25rem] border border-slate-100 bg-white">
                <img 
                  src={image2} 
                  alt="Detailed testimonial view" 
                  className="h-auto w-full object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="max-w-xl lg:pl-8"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-sm font-medium text-slate-800 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-600"></span>
            </span>
            Embed widget
          </div>

          {/* UPDATED TEXT */}
          <h2 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]">
            Add testimonials to your website in minutes
          </h2>

          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Copy a simple embed code and display your best testimonials anywhere on your website — no coding required.
          </p>

          <ul className="mt-10 space-y-5">
            {trustPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <motion.li
                  key={point.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  className="group flex items-center gap-4 text-base font-medium text-slate-700"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-200/60 bg-slate-50 text-slate-700 transition-colors duration-300 group-hover:border-indigo-200 group-hover:bg-indigo-50 group-hover:text-indigo-600 shadow-sm">
                    <Icon className="h-5 w-5" />
                  </span>
                  {point.text}
                </motion.li>
              );
            })}
          </ul>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-12"
          >
            <Button className="group h-14 rounded-full bg-slate-900 px-8 text-base font-semibold text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 hover:bg-slate-800 hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)]">
              Get your widget
              <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1.5" />
            </Button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}