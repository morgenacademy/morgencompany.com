import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, ArrowRight, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/CourseCard";
import RecommendationRow from "@/components/RecommendationRow";
import WaitlistDialog from "@/components/WaitlistDialog";
import { courses } from "@/data/courses";
import { getRecommendationsForCourses } from "@/data/recommendations";
import { getDaypartGreeting } from "@/lib/daypartGreeting";
import { usePodcastRecommendations } from "@/hooks/usePodcastRecommendations";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const Dashboard = () => {
  const navigate = useNavigate();
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [waitlistCourse, setWaitlistCourse] = useState<{ id: string; title: string } | null>(null);
  const [daypartGreeting, setDaypartGreeting] = useState(() => getDaypartGreeting());
  const podcastRecommendations = usePodcastRecommendations();

  useEffect(() => {
    const fetchEnrollments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if admin (admins see all courses as enrolled)
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setIsAdmin(true);
        setEnrolledCourseIds(courses.filter((c) => !c.comingSoon).map((c) => c.id));
        return;
      }

      const { data } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .eq("user_id", user.id);

      setEnrolledCourseIds(data?.map((e) => e.course_id) || []);
    };
    fetchEnrollments();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setDaypartGreeting(getDaypartGreeting());
    }, 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const recommendationItems = [
    ...getRecommendationsForCourses(enrolledCourseIds, enrolledCourseIds),
    ...podcastRecommendations,
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        rightSlot={
          <>
            {isAdmin && (
              <Link to="/admin/portal">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Portaal</span>
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Uitloggen</span>
            </Button>
          </>
        }
      />

      {/* Spacer for fixed nav */}
      <div className="h-[72px]" />

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">
            {daypartGreeting}
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-foreground leading-tight max-w-xl">
            Jouw trainingen
          </h1>
          <p className="mt-4 text-muted-foreground max-w-lg leading-relaxed">
            Bekijk je cursussen en start direct met leren. Elk op je eigen tempo, waar en wanneer je wilt.
          </p>
        </motion.div>
      </section>

      {/* Course Grid */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id}
              course={course}
              index={index}
              enrolled={enrolledCourseIds.includes(course.id)}
              onWaitlist={course.comingSoon ? () => setWaitlistCourse({ id: course.id, title: course.title }) : undefined}
            />
          ))}
        </div>
      </section>

      {recommendationItems.length > 0 && (
        <RecommendationRow
          items={recommendationItems}
          className="mx-auto max-w-6xl px-6 pb-20"
        />
      )}

      {/* Subtle Morgen Company hint */}
      <section className="mx-auto max-w-6xl px-6 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center"
        >
          <p className="text-sm text-muted-foreground/70">
            Wist je dat we ook incompany trainingen, consultancy en technische oplossingen bieden?{" "}
            <a
              href="https://www.morgencompany.com"
              className="inline-flex items-center gap-1 text-primary/70 hover:text-primary transition-colors"
            >
              Bekijk Morgen Company
              <ArrowRight className="h-3 w-3" />
            </a>
          </p>
        </motion.div>
      </section>

      <WaitlistDialog
        open={!!waitlistCourse}
        onOpenChange={(open) => !open && setWaitlistCourse(null)}
        courseId={waitlistCourse?.id || ""}
        courseTitle={waitlistCourse?.title || ""}
      />

      <SiteFooter />
    </div>
  );
};

export default Dashboard;
