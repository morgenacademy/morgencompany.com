import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { courses } from "@/data/courses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Save, Check, Video, FileText, Settings, RefreshCw, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LIBRARY_ID_KEY = "bunny-library-id";

interface BunnyVideo {
  guid: string;
  title: string;
  length: number;
  status: number;
  dateUploaded: string;
}

const AdminUpload = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [libraryId, setLibraryId] = useState(() => localStorage.getItem(LIBRARY_ID_KEY) || "");
  const [guids, setGuids] = useState<Record<string, string>>({});
  const [savedGuids, setSavedGuids] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  // Bunny video list
  const [bunnyVideos, setBunnyVideos] = useState<BunnyVideo[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const buildUrl = (guid: string) =>
    guid && libraryId ? `https://iframe.mediadelivery.net/embed/${libraryId}/${guid}` : "";

  const extractGuid = (url: string) => {
    const match = url.match(/\/embed\/[^/]+\/([a-f0-9-]+)/i);
    return match ? match[1] : url;
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!data) { navigate("/dashboard"); return; }
      setIsAdmin(true);
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const load = async () => {
      const { data } = await supabase.from("lesson_videos").select("*");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row: { course_id: string; lesson_id: string; video_url: string }) => {
          map[`${row.course_id}/${row.lesson_id}`] = extractGuid(row.video_url);
        });
        setGuids(map);
        setSavedGuids(map);
      }
    };
    load();
  }, [isAdmin]);

  const fetchBunnyVideos = useCallback(async () => {
    if (!libraryId.trim()) {
      toast.error("Vul eerst je Bunny Library ID in");
      return;
    }
    setLoadingVideos(true);
    try {
      // Fetch all pages
      let allVideos: BunnyVideo[] = [];
      let page = 1;
      let totalItems = 0;
      do {
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(
          `https://${projectId}.supabase.co/functions/v1/bunny-videos?libraryId=${encodeURIComponent(libraryId)}&page=${page}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `HTTP ${res.status}`);
        }
        const result = await res.json();
        allVideos = [...allVideos, ...(result.videos || [])];
        totalItems = result.totalItems || 0;
        page++;
      } while (allVideos.length < totalItems && page <= 10);

      setBunnyVideos(allVideos);
      toast.success(`${allVideos.length} video's opgehaald uit Bunny`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      toast.error("Bunny video's ophalen mislukt: " + msg);
    } finally {
      setLoadingVideos(false);
    }
  }, [libraryId]);

  // Auto-fetch when library ID is set
  useEffect(() => {
    if (isAdmin && libraryId.trim() && bunnyVideos.length === 0) {
      fetchBunnyVideos();
    }
  }, [isAdmin, libraryId]);

  const handleLibraryChange = (val: string) => {
    setLibraryId(val);
    localStorage.setItem(LIBRARY_ID_KEY, val);
  };

  // Hulpfunctie: geeft true als de les een article-type is
  const isArticleLesson = (course_id: string, lesson_id: string) => {
    const course = courses.find((c) => c.id === course_id);
    const lesson = course?.modules.flatMap((m) => m.lessons).find((l) => l.id === lesson_id);
    return lesson?.type === "article";
  };

  const handleSaveAll = async () => {
    // Library ID alleen vereist als er video-lessen opgeslagen worden
    const hasVideoLessons = Object.entries(guids)
      .filter(([, v]) => v.trim() !== "")
      .some(([key]) => {
        const [cid, lid] = key.split("/");
        return !isArticleLesson(cid, lid);
      });
    if (hasVideoLessons && !libraryId.trim()) {
      toast.error("Vul eerst je Bunny Library ID in");
      return;
    }
    setSaving("all");

    const rows = Object.entries(guids)
      .filter(([, guid]) => guid.trim() !== "")
      .map(([key, guid]) => {
        const [course_id, lesson_id] = key.split("/");
        // Artikel-lessen: sla de URL direct op; video-lessen: bouw Bunny embed-URL
        const video_url = isArticleLesson(course_id, lesson_id)
          ? guid.trim()
          : buildUrl(guid.trim());
        return { course_id, lesson_id, video_url, updated_at: new Date().toISOString() };
      });

    if (rows.length === 0) { setSaving(null); return; }

    const { error } = await supabase.from("lesson_videos").upsert(rows, { onConflict: "course_id,lesson_id" });

    if (error) {
      toast.error("Opslaan mislukt: " + error.message);
    } else {
      const newSaved = { ...savedGuids };
      rows.forEach((r) => {
        newSaved[`${r.course_id}/${r.lesson_id}`] = extractGuid(r.video_url);
      });
      setSavedGuids(newSaved);
      toast.success(`${rows.length} video's opgeslagen`);
    }
    setSaving(null);
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const filteredVideos = bunnyVideos.filter((v) =>
    v.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isAdmin === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const activeCourses = courses.filter((c) => !c.comingSoon);
  const filledCount = Object.values(guids).filter((g) => g.trim()).length;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate("/dashboard")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="font-display text-xl font-semibold text-foreground">Video URL beheer</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/admin/portal")}>
              Klantportaal
            </Button>
            <Button onClick={handleSaveAll} disabled={saving === "all"} size="sm">
              <Save className="h-4 w-4 mr-2" />
              {saving === "all" ? "Opslaan..." : `Alles opslaan (${filledCount})`}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8 space-y-8">
        {/* Library ID + Fetch */}
        <div className="rounded-xl border border-border bg-secondary/30 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Bunny Stream Library ID</span>
          </div>
          <div className="flex items-center gap-3">
            <Input
              placeholder="Bijv. 123456"
              value={libraryId}
              onChange={(e) => handleLibraryChange(e.target.value)}
              className="max-w-xs text-sm h-9"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={fetchBunnyVideos}
              disabled={loadingVideos || !libraryId.trim()}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loadingVideos ? "animate-spin" : ""}`} />
              {loadingVideos ? "Laden..." : `Video's ophalen${bunnyVideos.length ? ` (${bunnyVideos.length})` : ""}`}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Vul je Library ID in en klik op "Video's ophalen" om je Bunny video's te laden. Daarna kun je per les een video selecteren.
          </p>
        </div>

        {/* Lessons */}
        {activeCourses.map((course) => (
          <div key={course.id}>
            <h2 className="font-display text-lg font-semibold text-foreground mb-4">{course.title}</h2>
            {course.modules.map((mod) => {
              // Skip coming-soon modules — content bestaat nog niet
              if (mod.comingSoon) return null;
              if (mod.lessons.length === 0) return null;

              return (
                <div key={mod.id} className="mb-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">{mod.title}</h3>
                  <div className="space-y-2">
                    {mod.lessons.map((lesson) => {
                      const key = `${course.id}/${lesson.id}`;
                      const value = guids[key] || "";
                      const isSaved = savedGuids[key] === value && value !== "";
                      const isArticle = lesson.type === "article";
                      const selectedVideo = !isArticle ? bunnyVideos.find((v) => v.guid === value) : null;

                      return (
                        <div key={lesson.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3">
                          {isArticle
                            ? <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                            : <Video className="h-4 w-4 text-muted-foreground shrink-0" />
                          }
                          <span className="text-sm text-foreground min-w-[180px] shrink-0 truncate" title={lesson.title}>
                            {lesson.title}
                          </span>

                          {isArticle ? (
                            // Article: simpel URL-veld voor link naar PDF / externe tool
                            <Input
                              placeholder="URL (bijv. https://drive.google.com/...)"
                              value={value}
                              onChange={(e) => setGuids((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="flex-1 text-sm h-9"
                            />
                          ) : bunnyVideos.length > 0 ? (
                            <Select
                              value={value || undefined}
                              onValueChange={(val) =>
                                setGuids((prev) => ({ ...prev, [key]: val === "__clear__" ? "" : val }))
                              }
                            >
                              <SelectTrigger className="flex-1 text-sm h-9">
                                <SelectValue placeholder="Selecteer een video...">
                                  {selectedVideo
                                    ? `${selectedVideo.title} (${formatDuration(selectedVideo.length)})`
                                    : value
                                    ? `GUID: ${value.substring(0, 12)}...`
                                    : "Selecteer een video..."}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <div className="p-2">
                                  <div className="flex items-center gap-2 px-2 pb-2 border-b border-border mb-1">
                                    <Search className="h-3 w-3 text-muted-foreground" />
                                    <input
                                      className="text-sm bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
                                      placeholder="Zoek video..."
                                      value={searchQuery}
                                      onChange={(e) => setSearchQuery(e.target.value)}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                                {value && (
                                  <SelectItem value="__clear__" className="text-muted-foreground text-xs">
                                    ✕ Verwijder selectie
                                  </SelectItem>
                                )}
                                {filteredVideos.map((v) => (
                                  <SelectItem key={v.guid} value={v.guid} className="text-sm">
                                    <div className="flex items-center justify-between w-full gap-2">
                                      <span className="truncate">{v.title}</span>
                                      <span className="text-xs text-muted-foreground shrink-0">
                                        {formatDuration(v.length)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                                {filteredVideos.length === 0 && (
                                  <div className="py-4 text-center text-xs text-muted-foreground">
                                    Geen video's gevonden
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              placeholder="Video GUID (bijv. a1b2c3d4-...)"
                              value={value}
                              onChange={(e) => setGuids((prev) => ({ ...prev, [key]: e.target.value }))}
                              className="flex-1 text-sm h-9 font-mono"
                            />
                          )}

                          {isSaved && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUpload;
