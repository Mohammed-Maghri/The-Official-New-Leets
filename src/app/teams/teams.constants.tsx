export const CampusList = [
  { name: "Khouribga", id: 16 },
  { name: "Bengrir", id: 21 },
  { name: "Tetouan", id: 55 },
  { name: "Rabat", id: 75 },
  { name: "Paris", id: 1 },
  { name: "Lyon", id: 9 },
  { name: "Barcelona", id: 46 },
  { name: "Mulhouse", id: 48 },
  { name: "Lausanne", id: 47 },
  { name: "Istanbul", id: 49 },
  { name: "Berlin", id: 51 },
  { name: "Florence", id: 52 },
  { name: "Vienna", id: 53 },
  { name: "Prague", id: 56 },
  { name: "London", id: 57 },
  { name: "Porto", id: 58 },
  { name: "Luxembourg", id: 59 },
  { name: "Perpignan", id: 60 },
  { name: "Tokyo", id: 26 },
  { name: "Moscow", id: 17 },
  { name: "Madrid", id: 22 },
  { name: "Seoul", id: 29 },
  { name: "Rome", id: 30 },
  { name: "Yerevan", id: 32 },
  { name: "Bangkok", id: 33 },
  { name: "Amman", id: 35 },
  { name: "Malaga", id: 37 },
  { name: "Nice", id: 41 },
  { name: "Abu Dhabi", id: 43 },
  { name: "Wolfsburg", id: 44 },
];

export const ProjectFilterOptions = [
  { 
    value: "all", 
    label: "All Projects", 
    icon: "", 
    activeClasses: "bg-[#0070ef]/20 text-white border-l-[#0070ef]",
    hoverClasses: "hover:border-l-[#0070ef]/50"
  },
  { 
    value: "known", 
    label: "Known Projects", 
    icon: "", 
    activeClasses: "bg-[#0070ef]/20 text-white border-l-[#0070ef]",
    hoverClasses: "hover:border-l-[#0070ef]/50"
  },
  { 
    value: "unknown", 
    label: "Unknown Projects", 
    icon: "", 
    activeClasses: "bg-[#0070ef]/20 text-white border-l-[#0070ef]",
    hoverClasses: "hover:border-l-[#0070ef]/50"
  }
] as const;

export const AnimationConfig = {
  cardStagger: 0.05,
  cardDuration: 0.3,
  dropdownInitial: { opacity: 0, y: -10, scale: 0.95 },
  dropdownAnimate: { opacity: 1, y: 0, scale: 1 },
  dropdownExit: { opacity: 0, y: -10, scale: 0.95 },
  buttonInitial: { opacity: 0, scale: 0.8 },
  buttonAnimate: { opacity: 1, scale: 1 },
  buttonExit: { opacity: 0, scale: 0.8 },
} as const;

export const GridConfig = {
  teams: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 auto-rows-max",
  filters: "flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 items-stretch sm:items-center justify-center lg:justify-start",
  header: "flex flex-col xl:flex-row xl:items-center justify-between space-y-4 xl:space-y-0 gap-4",
  campusStats: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 w-full sm:w-auto",
} as const;
