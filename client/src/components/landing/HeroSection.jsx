import HeroActions from "./HeroActions";
import TrustedBySection from "./TrustedBySection";
import { motion } from "framer-motion";

const heroContainerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.16,
    },
  },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function HeroSection() {
  return (
    <motion.section
      className="relative overflow-hidden bg-transparent px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pb-28 lg:pt-24"
      variants={heroContainerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: false, amount: 0.45 }}
    >
      <div className="relative z-10 mx-auto mt-16 flex max-w-6xl flex-col items-center text-center sm:mt-24">
        <motion.div className="mt-8 max-w-4xl space-y-5 sm:mt-10 sm:space-y-7" variants={heroContainerVariants}>
          <motion.h1 className="font-sans text-[1.95rem] font-semibold leading-[1.08] tracking-[-0.03em] text-gray-900 sm:text-[3.5rem] sm:leading-[1.05] sm:tracking-[-0.035em] lg:text-[4.5rem]" variants={heroItemVariants}>
            <span className="block">Collect feedback.</span>
            <span className="block">Hide the negative.</span>
            <span className="block">Showcase your best</span>
            <span className="block">
              <motion.span
                className="relative inline-block px-2 py-1"
                initial={{ rotate: -2.5, scale: 0.94 }}
                whileInView={{ rotate: -1.5, scale: 1 }}
                viewport={{ once: false, amount: 0.45 }}
                transition={{ delay: 0.28, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="absolute inset-0 -z-10 rounded-lg bg-[#fec89a]/70 rotate-[-1.5deg]" />
                testimonials
              </motion.span>
              .
            </span>
          </motion.h1>

          <motion.p className="mx-auto max-w-xl text-sm font-normal leading-6 text-slate-500 sm:text-lg sm:leading-7" variants={heroItemVariants}>
            Send one simple link to your customers, collect feedback, and
            automatically turn positive responses into testimonials.
          </motion.p>
        </motion.div>

        <motion.div className="mt-12" variants={heroItemVariants}>
          <HeroActions />
        </motion.div>

        <motion.div variants={heroItemVariants}>
          <TrustedBySection />
        </motion.div>
      </div>
    </motion.section>
  );
}
