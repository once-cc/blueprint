import work01 from "@/assets/work-01.jpg";
import work02 from "@/assets/work-02.jpg";
import work03 from "@/assets/work-03.jpg";
import work04 from "@/assets/work-04.jpg";
import work05 from "@/assets/work-05.jpg";
import work06 from "@/assets/work-06.jpg";

export interface CarouselProject {
  id: string;
  title: string;
  category: string;
  year: string;
  images: string[];
  role: string;
  outcome: string;
}

export const carouselProjects: CarouselProject[] = [
  {
    id: "01",
    title: "Proclus",
    category: "E-Commerce Platform",
    year: "2024",
    images: [work01, work02, work03],
    role: "Brand Strategy & Product Design",
    outcome: "312% increase in conversion rate",
  },
  {
    id: "02",
    title: "DataForge",
    category: "SaaS Platform",
    year: "2024",
    images: [work02, work04, work01],
    role: "UX Research & Interface Design",
    outcome: "Reduced onboarding time by 67%",
  },
  {
    id: "03",
    title: "LR Minn",
    category: "Brand Identity",
    year: "2023",
    images: [work03, work05, work06],
    role: "Visual Identity & Art Direction",
    outcome: "Complete brand transformation",
  },
  {
    id: "04",
    title: "Findsec",
    category: "Fintech Application",
    year: "2024",
    images: [work04, work01, work02],
    role: "Product Design & Design System",
    outcome: "4.8★ App Store rating",
  },
  {
    id: "05",
    title: "Fujiat",
    category: "Architecture Portfolio",
    year: "2023",
    images: [work05, work06, work03],
    role: "Web Design & Development",
    outcome: "Featured in Awwwards",
  },
  {
    id: "06",
    title: "LuxArt",
    category: "Fashion & Luxury",
    year: "2024",
    images: [work06, work04, work05],
    role: "E-Commerce & Brand Experience",
    outcome: "2.4M first-month revenue",
  },
];

// Split projects for top, middle, and bottom rows (different ordering for visual variety)
export const topRowProjects = [...carouselProjects];
export const bottomRowProjects = [...carouselProjects].reverse();
export const thirdRowProjects = [
  carouselProjects[2], // LR Minn
  carouselProjects[5], // LuxArt
  carouselProjects[0], // Proclus
  carouselProjects[4], // Fujiat
  carouselProjects[1], // DataForge
  carouselProjects[3], // Findsec
];
