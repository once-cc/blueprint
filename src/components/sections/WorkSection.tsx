import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { EditorialGridLines } from "@/components/ui/EditorialGridLines";
import work01 from "@/assets/work-01.jpg";
import work02 from "@/assets/work-02.jpg";
import work03 from "@/assets/work-03.jpg";
import work04 from "@/assets/work-04.jpg";
import work05 from "@/assets/work-05.jpg";
import work06 from "@/assets/work-06.jpg";

interface CaseStudy {
  id: string;
  title: string;
  category: string;
  year: string;
  image: string;
}

const caseStudies: CaseStudy[] = [
  {
    id: "01",
    title: "Proclus",
    category: "E-Commerce",
    year: "2024",
    image: work01,
  },
  {
    id: "02",
    title: "DataForge",
    category: "SaaS Platform",
    year: "2024",
    image: work02,
  },
  {
    id: "03",
    title: "LR Minn",
    category: "Brand Identity",
    year: "2023",
    image: work03,
  },
  {
    id: "04",
    title: "Findsec",
    category: "Fintech App",
    year: "2024",
    image: work04,
  },
  {
    id: "05",
    title: "Fujiat",
    category: "Architecture",
    year: "2023",
    image: work05,
  },
  {
    id: "06",
    title: "LuxArt",
    category: "Fashion",
    year: "2024",
    image: work06,
  },
];

export function WorkSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Entrance animation - gentle fade in
  const opacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.15], [60, 0]);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative bg-background pt-12 md:pt-16 lg:pt-20 pb-32 md:pb-40 lg:pb-48 px-8 md:px-16 lg:px-24"
    >
      <div className="grain-overlay opacity-[0.02]" />
      
      {/* Editorial Grid Lines */}
      <EditorialGridLines 
        showHorizontalTop 
        horizontalTopPosition="18%" 
      />

      <motion.div className="max-w-7xl mx-auto">
        <motion.div
          className="mb-16 md:mb-24"
          style={{ opacity, y }}
        >
          <SectionTitle className="block mb-4">[02] Selected Work</SectionTitle>
          <h2 className="heading-display text-foreground max-w-3xl">
            Projects that
            <br />
            <span className="text-ghost-foreground">speak for themselves.</span>
          </h2>
        </motion.div>

        {/* 3-column staggered grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {caseStudies.map((study, index) => (
            <WorkCard
              key={study.id}
              study={study}
              index={index}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

interface WorkCardProps {
  study: CaseStudy;
  index: number;
}

function WorkCard({ study, index }: WorkCardProps) {
  return (
    <motion.article
      className={`work-card group cursor-pointer ${
        index % 3 === 1 ? "lg:mt-16" : index % 3 === 2 ? "lg:mt-32" : ""
      }`}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary rounded-sm">
        <img
          src={study.image}
          alt={study.title}
          className="w-full h-full object-cover"
        />
        <div className="work-card-overlay" />
        
        <div className="absolute top-4 left-4 text-foreground/60 font-display text-xs uppercase tracking-widest">
          {study.title}
        </div>
      </div>

      <div className="py-4 flex items-start justify-between">
        <div>
          <h3 className="font-display font-semibold text-foreground text-lg group-hover:text-accent transition-colors">
            {study.title}
          </h3>
          <p className="text-sm text-muted-foreground">{study.category}</p>
        </div>
        <span className="text-sm text-muted-foreground">{study.year}</span>
      </div>
    </motion.article>
  );
}
