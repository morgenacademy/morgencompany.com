import { courses } from "@/data/courses";

export type RecommendationKind = "course" | "podcast";

export interface RecommendationItem {
  id: string;
  kind: RecommendationKind;
  title: string;
  subtitle: string;
  image: string;
  href: string;
  embedUrl?: string;
  cta: string;
  relatedCourseIds: string[];
  comingSoon?: boolean;
  price?: string;
  locked?: boolean;
}

const courseRecommendations: RecommendationItem[] = courses.map((course) => ({
  id: course.id,
  kind: "course",
  title: course.title,
  subtitle: course.subtitle,
  image: course.thumbnail,
  href: course.comingSoon ? "/" : `/checkout/${course.id}`,
  cta: course.comingSoon ? "Binnenkort" : "Bekijk training",
  relatedCourseIds: [course.id],
  comingSoon: course.comingSoon,
  price: course.price,
}));

const recommendations = [...courseRecommendations];

const recommendationOrderByCourseId: Record<string, string[]> = {
  "basistraining-ai": [
    "vibecoden",
    "agentic-ai",
    "claude-openai-training",
    "ai-voor-projectmanagers",
  ],
  vibecoden: [
    "agentic-ai",
    "claude-openai-training",
    "ai-voor-projectmanagers",
    "basistraining-ai",
  ],
  "agentic-ai": [
    "claude-openai-training",
    "vibecoden",
    "ai-voor-projectmanagers",
    "basistraining-ai",
  ],
  "claude-openai-training": [
    "haal-meer-uit-claude-code",
    "agentic-ai",
    "vibecoden",
    "ai-voor-projectmanagers",
    "basistraining-ai",
  ],
  "haal-meer-uit-claude-code": [
    "claude-openai-training",
    "agentic-ai",
    "vibecoden",
    "ai-voor-projectmanagers",
    "basistraining-ai",
  ],
  "ai-voor-projectmanagers": [
    "agentic-ai",
    "claude-openai-training",
    "vibecoden",
    "basistraining-ai",
  ],
};

export function getRecommendationsForCourse(
  courseId: string,
  enrolledCourseIds: string[] = [],
  limit = 12
): RecommendationItem[] {
  const enrolledSet = new Set(enrolledCourseIds);
  const orderedIds = recommendationOrderByCourseId[courseId] ?? [];
  const ordered = orderedIds
    .map((id) => recommendations.find((item) => item.id === id))
    .filter((item): item is RecommendationItem => Boolean(item));

  const fallback = recommendations.filter(
    (item) => item.id !== courseId && !orderedIds.includes(item.id)
  );

  return [...ordered, ...fallback]
    .filter((item) => item.id !== courseId)
    .map((item) => {
      if (item.kind !== "course") return item;

      const locked = !enrolledSet.has(item.id);
      return {
        ...item,
        locked,
        href: locked ? `/checkout/${item.id}` : `/cursus/${item.id}`,
        cta: locked ? "Bekijk" : "Ga verder",
      };
    })
    .slice(0, limit);
}

export function getRecommendationsForCourses(
  courseIds: string[],
  enrolledCourseIds: string[] = [],
  limit = 12
): RecommendationItem[] {
  const seen = new Set<string>();
  const sourceCourseIds = courseIds.length > 0 ? courseIds : courses.map((course) => course.id);

  return sourceCourseIds
    .flatMap((courseId) => getRecommendationsForCourse(courseId, enrolledCourseIds, limit))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .slice(0, limit);
}
