import { Play, FileText, Lock, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Module, Lesson } from "@/data/courses";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface LessonListProps {
  modules: Module[];
  activeLesson: string;
  onSelectLesson: (id: string) => void;
  onWaitlist?: (id: string, title: string) => void;
}

const LessonList = ({ modules, activeLesson, onSelectLesson, onWaitlist }: LessonListProps) => {
  const activeModuleId = modules.find((m) =>
    m.lessons.some((l) => l.id === activeLesson)
  )?.id;

  const regularModules = modules.filter((m) => !m.comingSoon);
  const comingSoonModules = modules.filter((m) => m.comingSoon);

  let globalIndex = 0;

  return (
    <div className="space-y-2">
      {/* Gewone modules als accordion */}
      <Accordion
        type="multiple"
        defaultValue={activeModuleId ? [activeModuleId] : [regularModules[0]?.id]}
        className="space-y-2"
      >
        {regularModules.map((mod) => (
          <AccordionItem key={mod.id} value={mod.id} className="border rounded-lg overflow-hidden">
            <AccordionTrigger className="px-4 py-3 text-sm font-semibold hover:no-underline">
              {mod.title}
            </AccordionTrigger>
            <AccordionContent className="px-2 pb-2 space-y-0.5">
              {mod.lessons.map((lesson) => {
                globalIndex++;
                const idx = globalIndex;
                const isArticle = lesson.type === "article";
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className={cn(
                      "w-full flex items-start gap-3 rounded-lg p-3 text-left transition-all duration-200",
                      activeLesson === lesson.id
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-secondary border border-transparent"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium transition-colors",
                        activeLesson === lesson.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {activeLesson === lesson.id ? (
                        isArticle ? (
                          <FileText className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3 fill-current ml-0.5" />
                        )
                      ) : isArticle ? (
                        <FileText className="h-3 w-3" />
                      ) : (
                        idx
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={cn(
                          "text-sm font-medium truncate",
                          activeLesson === lesson.id
                            ? "text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {lesson.title}
                      </p>
                      {lesson.duration && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {lesson.duration}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Coming-soon modules als klikbare kaart */}
      {comingSoonModules.map((mod) => (
        <button
          key={mod.id}
          onClick={() => onWaitlist?.(mod.id, mod.title)}
          className="w-full rounded-lg border border-dashed border-border bg-secondary/20 p-4 text-left transition-all duration-200 hover:bg-secondary/40 hover:border-primary/30 group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">{mod.title}</p>
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
  );
};

export default LessonList;
