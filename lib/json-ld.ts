import { getSiteUrl } from "@/lib/site";
import { MIN_REVIEWS_FOR_RATING } from "@/lib/ratings";

export function buildCourseJsonLd(course: {
  code: string;
  title: string;
  description: string;
  reviewCount: number;
  avgUseful: number;
}) {
  const base = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    courseCode: course.code,
    description: course.description,
    url: `${base}/course/${encodeURIComponent(course.code)}`,
    provider: {
      "@type": "CollegeOrUniversity",
      name: "Western University",
    },
    ...(course.reviewCount >= MIN_REVIEWS_FOR_RATING
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Math.round(course.avgUseful),
            bestRating: 100,
            worstRating: 0,
            ratingCount: course.reviewCount,
          },
        }
      : {}),
  };
}
