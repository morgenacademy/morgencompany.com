import { motion } from "framer-motion";
import CourseCard from "@/components/CourseCard";
import { courses } from "@/data/courses";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h2 className="font-display text-xl font-semibold text-foreground tracking-tight">
            Academy
          </h2>
          <span className="text-xs text-muted-foreground uppercase tracking-widest">
            Trainingen
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-primary mb-3">
            Ontwikkel jezelf
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
            <CourseCard key={course.id} course={course} index={index} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Index;
