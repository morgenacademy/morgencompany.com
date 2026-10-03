import aiBasisImage from "@/assets/course-ai-basis.jpg";
import agenticAiImage from "@/assets/training-pinkroccade-harmen.jpeg";
import academyHeroImage from "@/assets/academy-hero-02.jpg";
import claudeOpenAiImage from "@/assets/training-avans-claude-code.jpg";
import claudeCodeGevorderdImage from "@/assets/course-claude-openai.jpeg";
import aiProjectmanagersImage from "@/assets/training-vml-karin.jpeg";

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  type?: "video" | "article";
  attachments?: { name: string; url: string }[];
  links?: { label: string; url: string }[];
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  comingSoon?: boolean;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  thumbnail: string;
  totalLessons: number;
  totalDuration: string;
  progress?: number;
  comingSoon?: boolean;
  price?: string;
  modules: Module[];
}

/** Helper: flatten all lessons from all modules */
export function getAllLessons(course: Course): Lesson[] {
  return course.modules.flatMap((m) => m.lessons);
}

// Vul hier je Bunny Stream embed-URL in, bijv.:
// "https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_GUID?autoplay=false&preload=true"
const placeholderVideo = "";

export const courses: Course[] = [
  {
    id: "basistraining-ai",
    title: "Basistraining AI",
    subtitle:
      "De laagdrempelige start om slimmer te werken met AI: begrijp het AI-landschap, leer effectief prompten en bouw je eerste assistent, zonder technische voorkennis.",
    thumbnail: academyHeroImage,
    totalLessons: 30,
    totalDuration: "3u 30min",
    progress: 0,
    price: "49.00",
    modules: [
      {
        id: "introductie",
        title: "Introductie",
        lessons: [
          {
            id: "welkom-en-het-team",
            title: "Welkom & het team",
            duration: "5:00",
            videoUrl: placeholderVideo,
            description: "Maak kennis met het team achter de training.",
          },
          {
            id: "onze-digitale-collegas",
            title: "Onze digitale collega's",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "Ontdek onze digitale collega's en wat ze kunnen.",
          },
          {
            id: "dit-ga-je-leren",
            title: "Dit ga je leren",
            duration: "4:00",
            videoUrl: placeholderVideo,
            description: "Een overzicht van wat je gaat leren in deze training.",
          },
          {
            id: "about-you",
            title: "About you",
            duration: "3:00",
            videoUrl: placeholderVideo,
            description: "Even voorstellen: wie ben jij?",
          },
        ],
      },
      {
        id: "lets-dive-in",
        title: "Let's dive in",
        lessons: [
          {
            id: "ai-in-relatie-tot-andere-ontwikkelingen",
            title: "AI in relatie tot (andere) ontwikkelingen",
            duration: "8:00",
            videoUrl: placeholderVideo,
            description:
              "Hoe verhoudt AI zich tot andere technologische ontwikkelingen?",
          },
          {
            id: "hoe-lang-bestaat-ai-al",
            title: "Hoe lang bestaat AI al?",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "Een korte geschiedenis van kunstmatige intelligentie.",
          },
          {
            id: "wat-is-ai",
            title: "Wat is AI?",
            duration: "7:00",
            videoUrl: placeholderVideo,
            description: "Wat is AI precies en hoe werkt het?",
          },
          {
            id: "hoe-slim-is-ai",
            title: "Hoe slim is AI?",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "De mogelijkheden en beperkingen van AI.",
          },
          {
            id: "hoe-betrouwbaar-is-ai",
            title: "Hoe betrouwbaar is AI?",
            duration: "7:00",
            videoUrl: placeholderVideo,
            description: "Kun je vertrouwen op AI-output?",
          },
          {
            id: "hoe-veilig-is-ai",
            title: "Hoe veilig is AI?",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "Veiligheid en privacy bij het gebruik van AI.",
          },
        ],
      },
      {
        id: "lets-go-prompting",
        title: "Let's go prompting",
        lessons: [
          {
            id: "prompten",
            title: "Prompten",
            duration: "10:00",
            videoUrl: placeholderVideo,
            description: "Leer effectieve prompts schrijven.",
          },
          {
            id: "gebruik-van-tools",
            title: "Gebruik van tools",
            duration: "8:00",
            videoUrl: placeholderVideo,
            description: "Welke AI-tools zijn er en hoe gebruik je ze?",
          },
          {
            id: "opdracht-waar-gaat-ai-jou-helpen",
            title: "Opdracht: waar gaat AI jou helpen?",
            duration: "5:00",
            videoUrl: placeholderVideo,
            description: "Praktijkopdracht: ontdek waar AI jou kan helpen.",
          },
          {
            id: "de-ai-adoptieladder",
            title: "De AI-adoptieladder",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "De stappen van AI-adoptie in organisaties.",
          },
        ],
      },
      {
        id: "build-your-own-ai-assistent",
        title: "Build your own AI Assistent",
        lessons: [
          {
            id: "de-drie-demos-ai-in-actie",
            title: "De drie demo's: AI in actie",
            duration: "5:00",
            videoUrl: placeholderVideo,
            description: "Bekijk drie demo's van AI in de praktijk.",
          },
          {
            id: "demo-driek",
            title: "Demo: Driek",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "Demo van AI-assistent Driek.",
          },
          {
            id: "demo-jeroen",
            title: "Demo: Jeroen",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "Demo van AI-assistent Jeroen.",
          },
          {
            id: "demo-bernard",
            title: "Demo: Bernard",
            duration: "6:00",
            videoUrl: placeholderVideo,
            description: "Demo van AI-assistent Bernard.",
          },
          {
            id: "een-ai-assistent",
            title: "Een AI assistent",
            duration: "7:00",
            videoUrl: placeholderVideo,
            description: "Wat is een AI-assistent en wat kan het voor je doen?",
          },
          {
            id: "build-your-own",
            title: "Build your own",
            duration: "5:00",
            videoUrl: placeholderVideo,
            description: "Ga zelf aan de slag met het bouwen van je assistent.",
          },
          {
            id: "inloggen-op-de-tools",
            title: "Inloggen op de tool(s)",
            duration: "4:00",
            videoUrl: placeholderVideo,
            description: "Stap-voor-stap: inloggen op de benodigde tools.",
          },
          {
            id: "je-assistent-bouwen-stap-voor-stap",
            title: "Je assistent bouwen – stap voor stap",
            duration: "12:00",
            videoUrl: placeholderVideo,
            description: "Bouw je eigen AI-assistent van A tot Z.",
          },
          {
            id: "je-assistent-testen-en-iteratief-verbeteren",
            title: "Je assistent testen en iteratief verbeteren",
            duration: "8:00",
            videoUrl: placeholderVideo,
            description: "Test en verbeter je assistent stap voor stap.",
          },
          {
            id: "tip-snel-verbeteren-van-je-assistent",
            title: "Tip: snel verbeteren van je assistent",
            duration: "4:00",
            videoUrl: placeholderVideo,
            description: "Snelle tips om je assistent te verbeteren.",
          },
          {
            id: "eindresultaat-jouw-werkende-assistent",
            title: "Eindresultaat: jouw werkende assistent",
            duration: "5:00",
            videoUrl: placeholderVideo,
            description: "Je hebt nu een werkende AI-assistent!",
          },
        ],
      },
      {
        id: "afronding",
        title: "Afronding: jouw eerste AI assistent is live",
        lessons: [
          {
            id: "gefeliciteerd-einde-cursus",
            title: "Gefeliciteerd, je bent aan het einde van de cursus",
            duration: "3:00",
            videoUrl: placeholderVideo,
            description: "Afronding en samenvatting van de cursus.",
          },
        ],
      },
      {
        id: "bonus",
        title: "Bonus",
        lessons: [
          {
            id: "bonus-tip-sneller-bouwen",
            title:
              "Bonus: tip voor het sneller en beter bouwen van je assistent",
            duration: "5:00",
            type: "video",
            videoUrl: placeholderVideo,
            description: "Extra tip voor het bouwen van je assistent.",
          },
        ],
      },
      {
        id: "downloads",
        title: "Downloads",
        lessons: [
          {
            id: "alle-slides-van-de-workshop",
            title: "Alle slides van de workshop",
            duration: "",
            type: "article",
            videoUrl: "",
            description: "Download alle slides van de workshop.",
          },
          {
            id: "promptversterker",
            title: "Promptversterker",
            duration: "",
            type: "article",
            videoUrl: "",
            description: "Download de promptversterker.",
          },
          {
            id: "promptsheet",
            title: "Promptsheet",
            duration: "",
            type: "article",
            videoUrl: "",
            description: "Download het promptsheet.",
          },
          {
            id: "checklist-veilig-ai-gebruiken",
            title: "Checklist veilig AI gebruiken",
            duration: "",
            type: "article",
            videoUrl: "",
            description: "Download de checklist voor veilig AI-gebruik.",
          },
        ],
      },
    ],
  },
  {
    id: "vibecoden",
    title: "Bouwen met AI (vibecoding)",
    subtitle:
      "Maak zelf een tool, website of app die je direct kunt laten zien en testen, zonder programmeerervaring.",
    thumbnail: aiBasisImage,
    totalLessons: 10,
    totalDuration: "Direct toegang",
    comingSoon: true,
    price: "49.00",
    modules: [],
  },
  {
    id: "agentic-ai",
    title: "Automatiseren met AI",
    subtitle:
      "Minder handwerk tussen systemen: leer wanneer automatisering en agentic AI slim zijn en hoe je daar veilig mee start.",
    thumbnail: agenticAiImage,
    totalLessons: 12,
    totalDuration: "Direct toegang",
    comingSoon: true,
    price: "49.00",
    modules: [],
  },
  {
    id: "claude-openai-training",
    title: "Claude Code / Codex: de basis",
    subtitle:
      "Geef AI toegang tot je eigen map: het leest je bestanden, denkt mee en voert werk uit. De AI werkt ín je werk.",
    thumbnail: claudeOpenAiImage,
    totalLessons: 14,
    totalDuration: "Direct toegang",
    comingSoon: true,
    price: "49.00",
    modules: [],
  },
  {
    id: "haal-meer-uit-claude-code",
    title: "Haal meer uit Claude Code + Samenwerken met AI",
    subtitle:
      "Voor teams die al met Claude Code werken: samen professioneel blijven terwijl het tempo omhoog gaat. Grotere changes, reviews en merge-conflicten in de hand.",
    thumbnail: claudeCodeGevorderdImage,
    totalLessons: 12,
    totalDuration: "Direct toegang",
    comingSoon: true,
    price: "49.00",
    modules: [],
  },
  {
    id: "ai-voor-projectmanagers",
    title: "Projectmanagement met AI",
    subtitle:
      "Projecten voorbereiden, aansturen en laten slagen met AI: planning, stakeholdercommunicatie, risico's en betere besluitvorming.",
    thumbnail: aiProjectmanagersImage,
    totalLessons: 10,
    totalDuration: "Direct toegang",
    comingSoon: true,
    price: "49.00",
    modules: [],
  },
];
