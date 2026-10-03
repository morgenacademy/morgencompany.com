import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, FileText, ExternalLink, Lock, Bell, CheckCircle, X } from "lucide-react";
import VideoPlayer from "@/components/VideoPlayer";
import LessonList from "@/components/LessonList";
import RecommendationRow from "@/components/RecommendationRow";
import { courses, getAllLessons } from "@/data/courses";
import { getRecommendationsForCourse } from "@/data/recommendations";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePodcastRecommendations } from "@/hooks/usePodcastRecommendations";

// Coming-soon cursussen die als kaart getoond worden onderaan de sidebar
const comingSoonCourses = courses.filter((c) => c.comingSoon);

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === courseId);
  const allLessons = course ? getAllLessons(course) : [];
  const hasLessons = allLessons.length > 0;
  const [activeLessonId, setActiveLessonId] = useState(allLessons[0]?.id || "");
  const activeLesson = allLessons.find((l) => l.id === activeLessonId) || allLessons[0];
  const [videoUrl, setVideoUrl] = useState("");
  const [enrolled, setEnrolled] = useState<boolean | null>(null);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const podcastRecommendations = usePodcastRecommendations();

  // Wachtlijst modal state
  const [waitlistModal, setWaitlistModal] = useState<{ id: string; title: string } | null>(null);
  const [waitlistName, setWaitlistName] = useState("");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistLoading, setWaitlistLoading] = useState(false);
  const [waitlistDone, setWaitlistDone] = useState(false);

  // Check enrollment
  useEffect(() => {
    if (!courseId) return;
    const checkEnrollment = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Pre-fill email for waitlist
      setWaitlistEmail(user.email || "");

      // Admins always have access
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (adminRole) {
        setEnrolled(true);
        setEnrolledCourseIds(courses.filter((c) => !c.comingSoon).map((c) => c.id));
        return;
      }

      const { data: currentEnrollment } = await supabase
        .from("course_enrollments")
        .select("id")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      const { data: enrollments } = await supabase
        .from("course_enrollments")
        .select("course_id")
        .eq("user_id", user.id);

      setEnrolled(!!currentEnrollment);
      setEnrolledCourseIds(enrollments?.map((enrollment) => enrollment.course_id) || []);
    };
    checkEnrollment();
  }, [courseId]);

  // Fetch Bunny Stream URL from database
  useEffect(() => {
    if (!course || !activeLesson || !enrolled) return;
    const fetchUrl = async () => {
      const { data } = await supabase
        .from("lesson_videos")
        .select("video_url")
        .eq("course_id", course.id)
        .eq("lesson_id", activeLesson.id)
        .maybeSingle();

      setVideoUrl(data?.video_url || activeLesson.videoUrl || "");
    };
    fetchUrl();
  }, [activeLessonId, course?.id, activeLesson?.id, activeLesson?.videoUrl, enrolled]);

  // Wachtlijst aanmelden
  const handleWaitlistSubmit = async () => {
    if (!waitlistModal || !waitlistName.trim() || !waitlistEmail.trim()) return;
    setWaitlistLoading(true);
    const { error } = await supabase.from("waitlist").insert({
      course_id: waitlistModal.id,
      first_name: waitlistName.trim(),
      email: waitlistEmail.trim(),
    });
    setWaitlistLoading(false);
    if (!error) {
      setWaitlistDone(true);
    }
  };

  const closeModal = () => {
    setWaitlistModal(null);
    setWaitlistDone(false);
    setWaitlistName("");
  };

  if (!course) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cursus niet gevonden</p>
      </div>
    );
  }

  // Loading enrollment check
  if (enrolled === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // No access
  if (!enrolled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="max-w-md text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h1 className="font-display text-2xl font-semibold text-foreground">
            Geen toegang
          </h1>
          <p className="text-muted-foreground">
            Je hebt nog geen toegang tot deze training. Start de training om te beginnen.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Terug naar dashboard
            </Button>
            <Button onClick={() => navigate(`/checkout/${courseId}`)}>
              Training starten
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const recommendationItems = [
    ...getRecommendationsForCourse(course.id, enrolledCourseIds),
    ...podcastRecommendations,
  ];

  if (!hasLessons) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border">
          <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Terug</span>
            </Link>
            <div className="h-4 w-px bg-border" />
            <h2 className="font-display text-lg font-semibold text-foreground truncate">
              {course.title}
            </h2>
          </div>
        </header>

        <div className="mx-auto flex min-h-[calc(100vh-73px)] max-w-3xl items-center justify-center px-6 py-12">
          <div className="w-full rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
            <CheckCircle className="mx-auto h-12 w-12 text-primary" />
            <h1 className="mt-4 font-display text-3xl font-semibold text-foreground">
              Je hebt toegang
            </h1>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Deze training staat al in je account en wordt binnenkort gevuld met de eerste lessen.
              Zodra de inhoud live staat, vind je die hier terug.
            </p>
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => navigate("/dashboard")}>
                Terug naar dashboard
              </Button>
            </div>
          </div>
        </div>

        <RecommendationRow
          items={recommendationItems}
          className="mx-auto max-w-6xl px-6 pb-16"
          subtitle="Terwijl deze training wordt gevuld, kun je alvast door naar een andere verdieping of podcast."
        />
      </div>
    );
  }

  const isArticle = activeLesson.type === "article";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-6 py-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Terug</span>
          </Link>
          <div className="h-4 w-px bg-border" />
          <h2 className="font-display text-lg font-semibold text-foreground truncate">
            {course.title}
          </h2>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            key={activeLessonId}
          >
            {isArticle ? (
              <div className="rounded-xl bg-secondary/50 border border-border flex items-center justify-center min-h-[200px] p-10">
                <div className="text-center space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">
                    {activeLesson.title}
                  </h3>
                  <p className="text-muted-foreground text-sm max-w-md">
                    {activeLesson.description}
                  </p>
                  {videoUrl && (
                    <a
                      href={videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="mt-2 gap-2">
                        <ExternalLink className="h-4 w-4" />
                        Openen
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <VideoPlayer src={videoUrl} />
            )}

            <div className="mt-6">
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-foreground">
                {activeLesson.title}
              </h1>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                {activeLesson.description}
              </p>

              {(activeLesson.attachments || activeLesson.links) && (
                <div className="mt-6 space-y-2">
                  {activeLesson.attachments?.map((att) => (
                    <a
                      key={att.name}
                      href={att.url}
                      className="flex items-center gap-3 rounded-lg bg-secondary p-3.5 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      {att.name}
                    </a>
                  ))}
                  {activeLesson.links?.map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg bg-secondary p-3.5 text-sm text-secondary-foreground hover:bg-secondary/80 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-primary" />
                      {link.label}
                    </a>
                  ))}
                </div>
              )}

              <RecommendationRow
                items={recommendationItems}
                className="mt-12"
                subtitle="Kies meteen je volgende verdieping of luister verder via een aanbevolen podcast."
              />
            </div>
          </motion.div>

          {/* Sidebar: lessenlijst + coming-soon cursussen */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="sticky top-8 space-y-4">
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground px-1">
                Lessen ({allLessons.length})
              </h3>
              <LessonList
                modules={course.modules}
                activeLesson={activeLessonId}
                onSelectLesson={setActiveLessonId}
                onWaitlist={(id, title) => {
                  setWaitlistDone(false);
                  setWaitlistName("");
                  setWaitlistModal({ id, title });
                }}
              />

              {/* Coming-soon cursussen */}
              {comingSoonCourses.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground px-1">
                    Andere trainingen
                  </h3>
                  {comingSoonCourses.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setWaitlistDone(false);
                        setWaitlistName("");
                        setWaitlistModal({ id: c.id, title: c.title });
                      }}
                      className="w-full rounded-lg border border-dashed border-border bg-secondary/20 p-4 text-left transition-all duration-200 hover:bg-secondary/40 hover:border-primary/30 group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                          <Lock className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{c.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">Binnenkort beschikbaar</p>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Bell className="h-2.5 w-2.5" />
                          Aanmelden
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wachtlijst modal */}
      {waitlistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-background border border-border shadow-xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-foreground">
                  Zet me op de wachtlijst
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {waitlistModal.title}
                </p>
              </div>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
                <X className="h-5 w-5" />
              </button>
            </div>

            {waitlistDone ? (
              <div className="flex flex-col items-center gap-3 py-4 text-center">
                <CheckCircle className="h-12 w-12 text-primary" />
                <p className="font-semibold text-foreground">Je staat op de lijst!</p>
                <p className="text-sm text-muted-foreground">
                  We sturen je een berichtje zodra de training beschikbaar is.
                </p>
                <Button onClick={closeModal} className="mt-2">Sluiten</Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Voornaam</label>
                    <Input
                      placeholder="Jouw voornaam"
                      value={waitlistName}
                      onChange={(e) => setWaitlistName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleWaitlistSubmit()}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">E-mailadres</label>
                    <Input
                      type="email"
                      placeholder="jouw@email.nl"
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleWaitlistSubmit()}
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="outline" onClick={closeModal} className="flex-1">Annuleren</Button>
                  <Button
                    onClick={handleWaitlistSubmit}
                    disabled={waitlistLoading || !waitlistName.trim() || !waitlistEmail.trim()}
                    className="flex-1"
                  >
                    {waitlistLoading ? "Aanmelden..." : "Aanmelden"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetail;
