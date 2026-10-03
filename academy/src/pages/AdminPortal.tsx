import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import * as tus from "tus-js-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { courses } from "@/data/courses";
import { toast } from "sonner";
import {
  ArrowLeft, Plus, Copy, Check, ToggleLeft, ToggleRight,
  Star, Loader2, Upload, Trash2, ExternalLink, Pencil, Download, Gift, FileUp, Link as LinkIcon,
  Users, UserPlus, Mail, Building2, ClipboardList, Search, KeyRound,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";

interface Company {
  id: string;
  slug: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

interface TrainingResource {
  label: string;
  value: string;
  type?: "file";
  storagePath?: string;
  filename?: string;
  contentType?: string;
  size?: number;
}

interface Training {
  id: string;
  company_id: string;
  title: string;
  description: string | null;
  training_date: string | null;
  training_dates: string[] | null;
  slide_storage_path: string | null;
  slide_filename: string | null;
  resources: TrainingResource[] | null;
  is_active: boolean;
}

interface FeedbackRow {
  id: string;
  training_id: string;
  company_id: string | null;
  respondent_name: string | null;
  respondent_function: string | null;
  rating_overall: number;
  rating_relevance: number | null;
  takeaways: string[] | null;
  rating_applicability: number | null;
  rating_tempo: string | null;
  feedback_liked: string | null;
  feedback_improve: string | null;
  feedback_other: string | null;
  created_at: string;
}

interface WorkshopParticipant {
  id: string;
  name: string;
  email: string;
  company: string;
  workshop_title: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ParticipantForm {
  name: string;
  email: string;
  company: string;
  workshop_title: string;
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const PORTAL_STORAGE_BUCKET = "portal-slides";
const EMPTY_PARTICIPANT_FORM: ParticipantForm = {
  name: "",
  email: "",
  company: "",
  workshop_title: "",
};

const sanitizeFileName = (name: string) => {
  const cleaned = name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

  return cleaned || "bestand";
};

const escapeCsvValue = (value: string | number | null | undefined) => {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  const escaped = stringValue.replace(/"/g, '""');
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
};

const AdminPortal = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyDialogOpen, setCompanyDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [savingCompany, setSavingCompany] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  // Plaintext passwords only kept in-memory for companies set/reset this session (never persisted)
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, string>>({});
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [pwTarget, setPwTarget] = useState<Company | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // Trainings state
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [trainingDialogOpen, setTrainingDialogOpen] = useState(false);
  const [newTrainingTitle, setNewTrainingTitle] = useState("");
  const [newTrainingDesc, setNewTrainingDesc] = useState("");
  const [newTrainingDates, setNewTrainingDates] = useState<string[]>([""]);
  const [newTrainingCompany, setNewTrainingCompany] = useState("");
  const [newTrainingResources, setNewTrainingResources] = useState<TrainingResource[]>([]);
  const [savingTraining, setSavingTraining] = useState(false);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resourceFileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const [resourceUploadTarget, setResourceUploadTarget] = useState<string | null>(null);

  // Edit training state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTraining, setEditTraining] = useState<Training | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDates, setEditDates] = useState<string[]>([]);
  const [editResources, setEditResources] = useState<TrainingResource[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);

  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackRow[]>([]);
  const [feedbackCompanyId, setFeedbackCompanyId] = useState<string>("");
  const [feedbackTrainingId, setFeedbackTrainingId] = useState<string>("");
  const [allTrainings, setAllTrainings] = useState<Training[]>([]);
  const [loadingFeedback, setLoadingFeedback] = useState(false);

  // Academy access state
  const [grantEmail, setGrantEmail] = useState("");
  const [grantCourseId, setGrantCourseId] = useState(courses[0]?.id ?? "");
  const [grantingAccess, setGrantingAccess] = useState(false);

  // Participant state
  const [participants, setParticipants] = useState<WorkshopParticipant[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantSearch, setParticipantSearch] = useState("");
  const [participantDialogOpen, setParticipantDialogOpen] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState<WorkshopParticipant | null>(null);
  const [participantForm, setParticipantForm] = useState<ParticipantForm>(EMPTY_PARTICIPANT_FORM);
  const [savingParticipant, setSavingParticipant] = useState(false);

  // Admin check
  useEffect(() => {
    const check = async () => {
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
    check();
  }, [navigate]);

  // Load companies
  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("portal_companies").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setCompanies((data as Company[]) ?? []));
  }, [isAdmin]);

  // Load trainings when company filter changes
  useEffect(() => {
    if (!isAdmin || !selectedCompanyId) { setTrainings([]); return; }
    supabase.from("portal_trainings")
      .select("*")
      .eq("company_id", selectedCompanyId)
      .order("training_date", { ascending: false })
      .then(({ data }) => setTrainings((data as Training[]) ?? []));
  }, [isAdmin, selectedCompanyId]);

  // Load all trainings once (used for feedback filters + labels)
  useEffect(() => {
    if (!isAdmin) return;
    supabase.from("portal_trainings")
      .select("*")
      .order("training_date", { ascending: false })
      .then(({ data }) => setAllTrainings((data as Training[]) ?? []));
  }, [isAdmin]);

  // Load all feedback once; filtering happens client-side
  useEffect(() => {
    if (!isAdmin) return;
    setLoadingFeedback(true);
    supabase.from("portal_feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setFeedback((data as FeedbackRow[]) ?? []);
        setLoadingFeedback(false);
      });
  }, [isAdmin]);

  // ---- Feedback derived data ----
  const companyNameById = useMemo(() => {
    const m = new Map<string, string>();
    companies.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [companies]);

  const trainingById = useMemo(() => {
    const m = new Map<string, Training>();
    allTrainings.forEach((t) => m.set(t.id, t));
    return m;
  }, [allTrainings]);

  const feedbackCompanyTrainings = useMemo(
    () => (feedbackCompanyId ? allTrainings.filter((t) => t.company_id === feedbackCompanyId) : allTrainings),
    [allTrainings, feedbackCompanyId],
  );

  const filteredFeedback = useMemo(
    () => feedback.filter((f) => {
      if (feedbackCompanyId && f.company_id !== feedbackCompanyId) return false;
      if (feedbackTrainingId && f.training_id !== feedbackTrainingId) return false;
      return true;
    }),
    [feedback, feedbackCompanyId, feedbackTrainingId],
  );

  // Load workshop participants
  useEffect(() => {
    if (!isAdmin) return;

    let isActive = true;
    setLoadingParticipants(true);

    supabase.from("workshop_participants")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!isActive) return;
        if (error) {
          toast.error(`Deelnemers laden mislukt: ${error.message}`, { duration: Infinity });
          setParticipants([]);
        } else {
          setParticipants((data as WorkshopParticipant[]) ?? []);
        }
        setLoadingParticipants(false);
      });

    return () => {
      isActive = false;
    };
  }, [isAdmin]);

  if (isAdmin === null) return null;

  // ---- Companies ----

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newSlug || !newPassword) return;
    setSavingCompany(true);
    try {
      const { data: company, error } = await supabase
        .from("portal_companies")
        .insert({ slug: newSlug, name: newName, password_hash: "placeholder" })
        .select()
        .single();
      if (error) throw error;

      await supabase.rpc("portal_set_password", {
        _company_id: company.id,
        _password: newPassword,
      });

      setCompanies((prev) => [company as Company, ...prev]);
      setRevealedPasswords((prev) => ({ ...prev, [company.id]: newPassword }));
      setCompanyDialogOpen(false);
      setNewName(""); setNewSlug(""); setNewPassword("");
      toast.success(`Bedrijf ${newName} aangemaakt`, { duration: Infinity });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      toast.error(`Aanmaken mislukt: ${msg}`, { duration: Infinity });
    } finally {
      setSavingCompany(false);
    }
  };

  const handleToggleCompany = async (company: Company) => {
    await supabase.from("portal_companies")
      .update({ is_active: !company.is_active })
      .eq("id", company.id);
    setCompanies((prev) => prev.map((c) => c.id === company.id ? { ...c, is_active: !c.is_active } : c));
  };

  const handleDeleteCompany = async (company: Company) => {
    const confirmed = window.confirm(
      `Weet je zeker dat je "${company.name}" wilt verwijderen? Alle trainingen en feedback van deze omgeving worden ook verwijderd.`
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("portal_companies")
      .delete()
      .eq("id", company.id);

    if (error) {
      toast.error(`Verwijderen mislukt: ${error.message}`, { duration: Infinity });
      return;
    }

    setCompanies((prev) => prev.filter((item) => item.id !== company.id));
    if (selectedCompanyId === company.id) {
      setSelectedCompanyId("");
      setTrainings([]);
    }
    if (feedbackCompanyId === company.id) {
      setFeedbackCompanyId("");
      setFeedbackTrainingId("");
      setFeedback([]);
    }
    toast.success(`${company.name} verwijderd`, { duration: Infinity });
  };

  const handleCopyUrl = (company: Company) => {
    const url = `${window.location.origin}/portal/${company.slug}`;
    const pw = revealedPasswords[company.id];
    if (pw) {
      navigator.clipboard.writeText(`Portaal: ${url}\nWachtwoord: ${pw}`);
      toast.success("URL + wachtwoord gekopieerd");
    } else {
      navigator.clipboard.writeText(url);
    }
    setCopiedSlug(company.slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwTarget || !pwValue.trim()) return;
    const target = pwTarget;
    setSavingPw(true);
    try {
      const { error } = await supabase.rpc("portal_set_password", {
        _company_id: target.id,
        _password: pwValue,
      });
      if (error) throw error;
      setRevealedPasswords((prev) => ({ ...prev, [target.id]: pwValue }));
      setPwDialogOpen(false);
      setPwValue("");
      setPwTarget(null);
      toast.success(`Wachtwoord van ${target.name} gewijzigd — je kunt nu URL + wachtwoord kopiëren.`, { duration: Infinity });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      toast.error(`Wijzigen mislukt: ${msg}`, { duration: Infinity });
    } finally {
      setSavingPw(false);
    }
  };

  // ---- Trainings ----

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrainingTitle || !newTrainingCompany) return;
    setSavingTraining(true);
    try {
      const filteredDates = newTrainingDates.filter(Boolean);
      const { data: training, error } = await supabase
        .from("portal_trainings")
        .insert({
          company_id: newTrainingCompany,
          title: newTrainingTitle,
          description: newTrainingDesc || null,
          training_date: filteredDates[0] || null,
          training_dates: filteredDates.length > 0 ? filteredDates : null,
          resources: newTrainingResources.filter(r => r.label && r.value).length > 0
            ? newTrainingResources.filter(r => r.label && r.value)
            : null,
        })
        .select()
        .single();
      if (error) throw error;
      if (selectedCompanyId === newTrainingCompany) {
        setTrainings((prev) => [training as Training, ...prev]);
      }
      setTrainingDialogOpen(false);
      setNewTrainingTitle(""); setNewTrainingDesc(""); setNewTrainingDates([""]); setNewTrainingCompany(""); setNewTrainingResources([]);
      toast.success("Training aangemaakt", { duration: Infinity });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      toast.error(`Aanmaken mislukt: ${msg}`, { duration: Infinity });
    } finally {
      setSavingTraining(false);
    }
  };

  const uploadPortalFile = async ({
    trainingId,
    file,
    path,
    onSuccess,
    successMessage,
  }: {
    trainingId: string;
    file: File;
    path: string;
    onSuccess: () => Promise<void>;
    successMessage: string;
  }) => {
    setUploadingFor(trainingId);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Niet ingelogd", { duration: Infinity });
      setUploadingFor(null);
      setUploadTarget(null);
      setResourceUploadTarget(null);
      return;
    }

    const projectUrl = import.meta.env.VITE_SUPABASE_URL;

    return new Promise<void>((resolve) => {
      const upload = new tus.Upload(file, {
        endpoint: `${projectUrl}/storage/v1/upload/resumable`,
        retryDelays: [0, 1000, 3000, 5000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: PORTAL_STORAGE_BUCKET,
          objectName: path,
          contentType: file.type || "application/octet-stream",
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks
        onError: (error: Error) => {
          toast.error(`Upload mislukt: ${error.message}`, { duration: Infinity });
          setUploadingFor(null);
          setUploadTarget(null);
          setResourceUploadTarget(null);
          resolve();
        },
        onSuccess: async () => {
          try {
            await onSuccess();
            toast.success(successMessage, { duration: Infinity });
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Onbekende fout";
            toast.error(`Upload gelukt maar opslaan mislukt: ${msg}`, { duration: Infinity });
          } finally {
            setUploadingFor(null);
            setUploadTarget(null);
            setResourceUploadTarget(null);
            resolve();
          }
        },
      });

      // Check for previous uploads to resume
      upload.findPreviousUploads().then((prev) => {
        if (prev.length > 0) upload.resumeFromPreviousUpload(prev[0]);
        upload.start();
      });
    });
  };

  const handleUploadSlide = async (trainingId: string, file: File) => {
    const ext = file.name.split(".").pop() ?? "file";
    const path = `${trainingId}/slides.${ext}`;
    const existingPath = trainings.find((training) => training.id === trainingId)?.slide_storage_path;

    // Remove existing file first (TUS doesn't support upsert)
    await supabase.storage.from(PORTAL_STORAGE_BUCKET).remove([existingPath ?? path]);

    return uploadPortalFile({
      trainingId,
      file,
      path,
      successMessage: `Bestand geüpload: ${file.name}`,
      onSuccess: async () => {
        const { error: updateError } = await supabase
          .from("portal_trainings")
          .update({ slide_storage_path: path, slide_filename: file.name })
          .eq("id", trainingId);
        if (updateError) throw updateError;

        setTrainings((prev) =>
          prev.map((training) =>
            training.id === trainingId
              ? { ...training, slide_storage_path: path, slide_filename: file.name }
              : training
          )
        );
      },
    });
  };

  const handleUploadResource = async (training: Training, file: File) => {
    const safeName = sanitizeFileName(file.name);
    const path = `${training.id}/resources/${Date.now()}-${safeName}`;
    const nextResource: TrainingResource = {
      label: file.name,
      value: file.name,
      type: "file",
      storagePath: path,
      filename: file.name,
      contentType: file.type || "application/octet-stream",
      size: file.size,
    };
    const nextResources = [...(training.resources ?? []), nextResource];

    return uploadPortalFile({
      trainingId: training.id,
      file,
      path,
      successMessage: `Naslagwerk geüpload: ${file.name}`,
      onSuccess: async () => {
        const { error: updateError } = await supabase
          .from("portal_trainings")
          .update({ resources: nextResources })
          .eq("id", training.id);
        if (updateError) throw updateError;

        setTrainings((prev) =>
          prev.map((item) =>
            item.id === training.id ? { ...item, resources: nextResources } : item
          )
        );
      },
    });
  };

  const handleAddResourceUrl = async (training: Training) => {
    const label = window.prompt("Naam van het naslagwerk", "Bunny video");
    if (!label?.trim()) return;

    const value = window.prompt(
      "Plak de URL, bijvoorbeeld een Bunny embed-url",
      "https://iframe.mediadelivery.net/embed/"
    );
    if (!value?.trim()) return;

    const nextResources = [
      ...(training.resources ?? []),
      { label: label.trim(), value: value.trim() },
    ];

    const { error } = await supabase
      .from("portal_trainings")
      .update({ resources: nextResources })
      .eq("id", training.id);

    if (error) {
      toast.error(`URL toevoegen mislukt: ${error.message}`, { duration: Infinity });
      return;
    }

    setTrainings((prev) =>
      prev.map((item) =>
        item.id === training.id ? { ...item, resources: nextResources } : item
      )
    );
    toast.success("URL toegevoegd aan naslagwerk", { duration: Infinity });
  };

  const handleDeleteTraining = async (trainingId: string) => {
    await supabase.from("portal_trainings").update({ is_active: false }).eq("id", trainingId);
    setTrainings((prev) => prev.filter((t) => t.id !== trainingId));
    toast.success("Training verwijderd", { duration: Infinity });
  };

  const openEditDialog = (training: Training) => {
    setEditTraining(training);
    setEditTitle(training.title);
    setEditDesc(training.description ?? "");
    const dates = training.training_dates?.length
      ? training.training_dates
      : training.training_date ? [training.training_date] : [];
    setEditDates(dates);
    setEditResources(training.resources ?? []);
    setEditDialogOpen(true);
  };

  const handleEditTraining = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTraining || !editTitle) return;
    setSavingEdit(true);
    const filteredDates = editDates.filter(Boolean);
    try {
      const { error } = await supabase
        .from("portal_trainings")
        .update({
          title: editTitle,
          description: editDesc || null,
          training_date: filteredDates[0] || null,
          training_dates: filteredDates.length > 0 ? filteredDates : null,
          resources: editResources.filter(r => r.label && r.value).length > 0
            ? editResources.filter(r => r.label && r.value)
            : null,
        })
        .eq("id", editTraining.id);
      if (error) throw error;
      const filteredResources = editResources.filter(r => r.label && r.value);
      setTrainings((prev) =>
        prev.map((t) =>
          t.id === editTraining.id
            ? { ...t, title: editTitle, description: editDesc || null, training_date: filteredDates[0] || null, training_dates: filteredDates.length > 0 ? filteredDates : null, resources: filteredResources.length > 0 ? filteredResources : null }
            : t
        )
      );
      setEditDialogOpen(false);
      toast.success("Training bijgewerkt", { duration: Infinity });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      toast.error(`Bijwerken mislukt: ${msg}`, { duration: Infinity });
    } finally {
      setSavingEdit(false);
    }
  };

  // ---- Feedback actions ----

  const handleDeleteFeedback = async (id: string) => {
    const { error } = await supabase.from("portal_feedback").delete().eq("id", id);
    if (error) {
      toast.error("Verwijderen mislukt", { duration: Infinity });
    } else {
      setFeedback((prev) => prev.filter((f) => f.id !== id));
      toast.success("Feedback verwijderd");
    }
  };

  const handleExportFeedback = () => {
    if (!filteredFeedback.length) return;
    const tempoLabel = (t: string | null) =>
      t === "slow" ? "Te langzaam" : t === "balanced" ? "Goed" : t === "fast" ? "Te snel" : "";
    const escape = (v: string | null | undefined) => {
      if (!v) return "";
      const s = v.replace(/"/g, '""');
      return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s}"` : s;
    };

    const headers = ["Bedrijf", "Training", "Naam", "Functie", "Overall", "Relevantie", "Toepasbaarheid", "Tempo", "Takeaways", "Meest waardevol", "Verbeteren", "E-mail", "Datum"];
    const rows = filteredFeedback.map((r) => [
      escape(r.company_id ? companyNameById.get(r.company_id) ?? "" : ""),
      escape(trainingById.get(r.training_id)?.title ?? ""),
      escape(r.respondent_name),
      escape(r.respondent_function),
      r.rating_overall,
      r.rating_relevance ?? "",
      r.rating_applicability ?? "",
      tempoLabel(r.rating_tempo),
      escape(r.takeaways?.join("; ")),
      escape(r.feedback_liked),
      escape(r.feedback_improve),
      escape(r.feedback_other),
      new Date(r.created_at).toLocaleDateString("nl-NL"),
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const training = feedbackTrainingId ? trainingById.get(feedbackTrainingId) : null;
    a.download = `feedback-${training?.title ?? "alle"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Academy access actions ----

  const handleGrantCourseAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim() || !grantCourseId) return;

    setGrantingAccess(true);
    try {
      const email = grantEmail.trim().toLowerCase();
      const { data, error } = await supabase.functions.invoke("admin-invite-course", {
        body: {
          email,
          course_id: grantCourseId,
          redirect_to: `${window.location.origin}/reset-password`,
        },
      });

      // functions.invoke returns an error for non-2xx; the body may still
      // carry a specific message we want to surface.
      if (error) {
        let msg = error.message;
        try {
          const body = await (error as { context?: Response }).context?.json?.();
          if (body?.error) msg = body.error;
        } catch {
          // keep the generic message
        }
        throw new Error(msg);
      }

      const courseTitle = courses.find((course) => course.id === grantCourseId)?.title ?? grantCourseId;

      if (data?.invited) {
        toast.success(
          `Uitnodiging verstuurd naar ${email}. Na het instellen van een wachtwoord staat ${courseTitle} klaar.`,
          { duration: Infinity }
        );
      } else if (data?.created) {
        toast.success(`${email} heeft nu toegang tot ${courseTitle}.`, { duration: Infinity });
      } else {
        toast.success(`${email} had al toegang tot ${courseTitle}.`, { duration: Infinity });
      }

      setGrantEmail("");
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? "Onbekende fout";
      toast.error(`Toegang geven mislukt: ${msg}`, { duration: Infinity });
    } finally {
      setGrantingAccess(false);
    }
  };

  // ---- Participant actions ----

  const openNewParticipantDialog = () => {
    setEditingParticipant(null);
    setParticipantForm({ ...EMPTY_PARTICIPANT_FORM });
    setParticipantDialogOpen(true);
  };

  const openEditParticipantDialog = (participant: WorkshopParticipant) => {
    setEditingParticipant(participant);
    setParticipantForm({
      name: participant.name,
      email: participant.email,
      company: participant.company,
      workshop_title: participant.workshop_title,
    });
    setParticipantDialogOpen(true);
  };

  const handleSaveParticipant = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      name: participantForm.name.trim(),
      email: participantForm.email.trim().toLowerCase(),
      company: participantForm.company.trim(),
      workshop_title: participantForm.workshop_title.trim(),
    };

    if (!payload.name || !payload.email || !payload.company || !payload.workshop_title) return;

    setSavingParticipant(true);
    try {
      if (editingParticipant) {
        const { data, error } = await supabase
          .from("workshop_participants")
          .update(payload)
          .eq("id", editingParticipant.id)
          .select()
          .single();
        if (error) throw error;

        setParticipants((prev) =>
          prev.map((participant) =>
            participant.id === editingParticipant.id ? data as WorkshopParticipant : participant
          )
        );
        toast.success("Deelnemer bijgewerkt", { duration: Infinity });
      } else {
        const { data, error } = await supabase
          .from("workshop_participants")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;

        setParticipants((prev) => [data as WorkshopParticipant, ...prev]);
        toast.success("Deelnemer toegevoegd", { duration: Infinity });
      }

      setParticipantDialogOpen(false);
      setEditingParticipant(null);
      setParticipantForm({ ...EMPTY_PARTICIPANT_FORM });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Onbekende fout";
      toast.error(`Opslaan mislukt: ${msg}`, { duration: Infinity });
    } finally {
      setSavingParticipant(false);
    }
  };

  const handleDeleteParticipant = async (participant: WorkshopParticipant) => {
    const { error } = await supabase
      .from("workshop_participants")
      .delete()
      .eq("id", participant.id);

    if (error) {
      toast.error(`Verwijderen mislukt: ${error.message}`, { duration: Infinity });
      return;
    }

    setParticipants((prev) => prev.filter((item) => item.id !== participant.id));
    toast.success("Deelnemer verwijderd", { duration: Infinity });
  };

  const handleExportParticipants = () => {
    if (!participants.length) return;

    const headers = ["Naam", "E-mailadres", "Bedrijf", "Workshop", "Toegevoegd op"];
    const rows = participants.map((participant) => [
      escapeCsvValue(participant.name),
      escapeCsvValue(participant.email),
      escapeCsvValue(participant.company),
      escapeCsvValue(participant.workshop_title),
      escapeCsvValue(new Date(participant.created_at).toLocaleDateString("nl-NL")),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "academy-deelnemers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ---- Render helpers ----

  const avgRating = (rows: FeedbackRow[]) => {
    if (!rows.length) return null;
    const sum = rows.reduce((acc, r) => acc + r.rating_overall, 0);
    return (sum / rows.length).toFixed(1);
  };

  const Stars = ({ value }: { value: number | null }) => {
    if (!value) return <span className="text-muted-foreground">—</span>;
    return (
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 ${i < value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
          />
        ))}
        <span className="ml-1 text-xs text-muted-foreground">{value}</span>
      </span>
    );
  };

  const participantSearchTerm = participantSearch.trim().toLowerCase();
  const filteredParticipants = participantSearchTerm
    ? participants.filter((participant) =>
        [
          participant.name,
          participant.email,
          participant.company,
          participant.workshop_title,
        ].some((value) => value.toLowerCase().includes(participantSearchTerm))
      )
    : participants;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="mx-auto flex max-w-5xl items-center gap-4 px-6 py-5">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/upload")} className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Terug
          </Button>
          <h1 className="font-display text-xl font-semibold text-foreground">
            Klantportaal beheer
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <Tabs defaultValue="companies">
          <TabsList className="mb-6">
            <TabsTrigger value="companies">Bedrijven</TabsTrigger>
            <TabsTrigger value="trainings">Trainingen</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="academy">Academy</TabsTrigger>
          </TabsList>

          {/* ---- COMPANIES TAB ---- */}
          <TabsContent value="companies">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Bedrijven</h2>
              <Button size="sm" onClick={() => setCompanyDialogOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Nieuw bedrijf
              </Button>
            </div>

            {companies.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen bedrijven aangemaakt.</p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center gap-4 px-5 py-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{company.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        /portal/{company.slug}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`rounded-full px-2 py-0.5 text-xs ${company.is_active ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {company.is_active ? "Actief" : "Inactief"}
                      </span>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleCopyUrl(company)}
                        title={revealedPasswords[company.id] ? "Kopieer URL + wachtwoord" : "Kopieer portaal-URL"}
                      >
                        {copiedSlug === company.slug ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => { setPwTarget(company); setPwValue(""); setPwDialogOpen(true); }}
                        title="Wachtwoord wijzigen"
                      >
                        <KeyRound className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleToggleCompany(company)}
                        title={company.is_active ? "Deactiveren" : "Activeren"}
                      >
                        {company.is_active
                          ? <ToggleRight className="h-5 w-5 text-primary" />
                          : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                      </Button>
                      <Button
                        variant="ghost" size="icon" asChild
                        title="Open portaal"
                      >
                        <a href={`/portal/${company.slug}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleDeleteCompany(company)}
                        title="Verwijder omgeving"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ---- ACADEMY TAB ---- */}
          <TabsContent value="academy">
            <div className="space-y-8">
              <section className="max-w-2xl rounded-xl border border-border bg-card p-6">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Gift className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-lg font-semibold text-foreground">
                      Gratis toegang geven
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Geef iemand direct toegang tot een cursus zonder betaling. Heeft de persoon nog geen account, dan sturen we automatisch een uitnodiging om een wachtwoord in te stellen.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleGrantCourseAccess} className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="grant-email" className="text-sm font-medium text-foreground">
                      E-mailadres
                    </label>
                    <Input
                      id="grant-email"
                      type="email"
                      placeholder="naam@bedrijf.nl"
                      value={grantEmail}
                      onChange={(e) => setGrantEmail(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="grant-course" className="text-sm font-medium text-foreground">
                      Cursus
                    </label>
                    <Select value={grantCourseId} onValueChange={setGrantCourseId}>
                      <SelectTrigger id="grant-course">
                        <SelectValue placeholder="Kies een cursus..." />
                      </SelectTrigger>
                      <SelectContent>
                        {courses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-lg bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
                    <span>Na toekennen ziet de gebruiker de cursus direct in het dashboard.</span>
                    <Button type="submit" disabled={grantingAccess || !grantEmail.trim() || !grantCourseId} className="gap-2">
                      {grantingAccess ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gift className="h-4 w-4" />}
                      Gratis aanmelden
                    </Button>
                  </div>
                </form>
              </section>

              <section className="space-y-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
                      <Users className="h-5 w-5 text-primary" />
                      Deelnemers
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {participants.length} {participants.length === 1 ? "deelnemer" : "deelnemers"}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportParticipants}
                      disabled={!participants.length}
                      className="gap-1.5"
                    >
                      <Download className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button size="sm" onClick={openNewParticipantDialog} className="gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      Deelnemer
                    </Button>
                  </div>
                </div>

                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={participantSearch}
                    onChange={(e) => setParticipantSearch(e.target.value)}
                    placeholder="Zoek op naam, e-mail, bedrijf of workshop"
                    className="pl-9"
                  />
                </div>

                {loadingParticipants ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Laden...
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <div className="rounded-xl border border-border bg-card px-5 py-8 text-sm text-muted-foreground">
                    {participantSearchTerm ? "Geen deelnemers gevonden." : "Nog geen deelnemers toegevoegd."}
                  </div>
                ) : (
                  <div className="divide-y divide-border rounded-xl border border-border bg-card">
                    {filteredParticipants.map((participant) => (
                      <div
                        key={participant.id}
                        className="grid gap-4 px-5 py-4 md:grid-cols-[1.35fr_1fr_1.2fr_auto] md:items-center"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{participant.name}</p>
                          <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{participant.email}</span>
                          </p>
                        </div>
                        <p className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
                          <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{participant.company}</span>
                        </p>
                        <p className="flex min-w-0 items-center gap-1.5 text-sm text-foreground">
                          <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="truncate">{participant.workshop_title}</span>
                        </p>
                        <div className="flex items-center gap-1 md:justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditParticipantDialog(participant)}
                            title="Bewerk deelnemer"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteParticipant(participant)}
                            title="Verwijder deelnemer"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </TabsContent>

          {/* ---- TRAININGS TAB ---- */}
          <TabsContent value="trainings">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">Trainingen</h2>
              <Button size="sm" onClick={() => setTrainingDialogOpen(true)} className="gap-1.5">
                <Plus className="h-4 w-4" /> Nieuwe training
              </Button>
            </div>

            <div className="mb-4">
              <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Kies een bedrijf..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!selectedCompanyId ? (
              <p className="text-sm text-muted-foreground">Selecteer een bedrijf om trainingen te zien.</p>
            ) : trainings.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nog geen trainingen voor dit bedrijf.</p>
            ) : (
              <div className="divide-y divide-border rounded-xl border border-border bg-card">
                {trainings.map((training) => (
                  <div key={training.id} className="px-5 py-4 space-y-2">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{training.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {(training.training_dates?.length ? training.training_dates : training.training_date ? [training.training_date] : [])
                            .map((d) => new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric" }))
                            .join(", ") || "Geen datum"
                          }
                          {training.slide_filename && (
                            <span className="ml-2 text-success">· Hoofdbestand: {training.slide_filename}</span>
                          )}
                          {training.resources?.length ? (
                            <span className="ml-2 text-primary">· {training.resources.length} naslagwerkitem{training.resources.length !== 1 ? "s" : ""}</span>
                          ) : null}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          variant="outline" size="sm"
                          disabled={uploadingFor === training.id}
                          onClick={() => {
                            setUploadTarget(training.id);
                            fileInputRef.current?.click();
                          }}
                          className="gap-1.5 text-xs"
                        >
                          {uploadingFor === training.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Upload className="h-3.5 w-3.5" />}
                          {training.slide_storage_path ? "Hoofdbestand vervangen" : "Hoofdbestand uploaden"}
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          disabled={uploadingFor === training.id}
                          onClick={() => {
                            setResourceUploadTarget(training.id);
                            resourceFileInputRef.current?.click();
                          }}
                          className="gap-1.5 text-xs"
                        >
                          {uploadingFor === training.id
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <FileUp className="h-3.5 w-3.5" />}
                          Naslagwerk uploaden
                        </Button>
                        <Button
                          variant="outline" size="sm"
                          onClick={() => handleAddResourceUrl(training)}
                          className="gap-1.5 text-xs"
                        >
                          <LinkIcon className="h-3.5 w-3.5" />
                          URL toevoegen
                        </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => openEditDialog(training)}
                        title="Bewerk training"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleDeleteTraining(training.id)}
                        title="Verwijder training"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && uploadTarget) handleUploadSlide(uploadTarget, file);
                e.target.value = "";
              }}
            />
            <input
              ref={resourceFileInputRef}
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                const training = trainings.find((item) => item.id === resourceUploadTarget);
                if (file && training) handleUploadResource(training, file);
                e.target.value = "";
              }}
            />
          </TabsContent>

          {/* ---- FEEDBACK TAB ---- */}
          <TabsContent value="feedback">
            <h2 className="mb-4 font-display text-lg font-semibold text-foreground">Feedback</h2>

            <div className="mb-4 flex gap-3">
              <Select value={feedbackCompanyId || "all"} onValueChange={(v) => { setFeedbackCompanyId(v === "all" ? "" : v); setFeedbackTrainingId(""); }}>
                <SelectTrigger className="w-56">
                  <SelectValue placeholder="Bedrijf..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle bedrijven</SelectItem>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {feedbackCompanyId && (
                <Select value={feedbackTrainingId || "all"} onValueChange={(v) => setFeedbackTrainingId(v === "all" ? "" : v)}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Training..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Alle trainingen</SelectItem>
                    {feedbackCompanyTrainings.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {loadingFeedback ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Laden...
              </div>
            ) : filteredFeedback.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {feedbackCompanyId || feedbackTrainingId ? "Nog geen feedback voor deze selectie." : "Nog geen feedback ontvangen."}
              </p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between rounded-xl border border-border bg-card px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                    <span className="text-lg font-semibold text-foreground">{avgRating(filteredFeedback)}</span>
                    <span className="text-sm text-muted-foreground">gemiddeld ({filteredFeedback.length} {filteredFeedback.length === 1 ? "reactie" : "reacties"})</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportFeedback} className="gap-1.5 text-xs">
                    <Download className="h-3.5 w-3.5" />
                    CSV
                  </Button>
                </div>

                <div className="space-y-4">
                  {filteredFeedback.map((row) => (
                    <div key={row.id} className="rounded-xl border border-border bg-card p-5">
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {trainingById.get(row.training_id)?.title ?? "Onbekende training"}
                        </span>
                        {row.company_id && companyNameById.get(row.company_id) && (
                          <span className="text-xs text-muted-foreground">{companyNameById.get(row.company_id)}</span>
                        )}
                      </div>
                      <div className="mb-3 flex items-center justify-between">
                        <div>
                              <p className="font-medium text-foreground">
                                {row.respondent_name ?? "Anoniem"}
                              </p>
                              {row.respondent_function && (
                                <p className="text-xs text-muted-foreground">{row.respondent_function}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-xs text-muted-foreground">
                                {new Date(row.created_at).toLocaleDateString("nl-NL")}
                              </p>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDeleteFeedback(row.id)}
                                title="Verwijder feedback"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="mb-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                            <div><p className="text-xs text-muted-foreground">Overall</p><Stars value={row.rating_overall} /></div>
                            <div><p className="text-xs text-muted-foreground">Relevantie</p><Stars value={row.rating_relevance} /></div>
                            <div><p className="text-xs text-muted-foreground">Toepasbaarheid</p><Stars value={row.rating_applicability} /></div>
                            <div>
                              <p className="text-xs text-muted-foreground">Tempo</p>
                              <p className="text-xs text-foreground mt-0.5">
                                {row.rating_tempo === "slow" ? "Te langzaam" : row.rating_tempo === "balanced" ? "Goed" : row.rating_tempo === "fast" ? "Te snel" : "—"}
                              </p>
                            </div>
                          </div>
                          {row.takeaways && row.takeaways.length > 0 && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground">Na deze sessie...</p>
                              <ul className="mt-0.5 text-sm text-foreground list-disc list-inside">
                                {row.takeaways.map((t, i) => <li key={i}>{t}</li>)}
                              </ul>
                            </div>
                          )}
                          {row.feedback_liked && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground">Meest waardevol</p>
                              <p className="mt-0.5 text-sm text-foreground">{row.feedback_liked}</p>
                            </div>
                          )}
                          {row.feedback_improve && (
                            <div className="mb-2">
                              <p className="text-xs text-muted-foreground">Verbeteren</p>
                              <p className="mt-0.5 text-sm text-foreground">{row.feedback_improve}</p>
                            </div>
                          )}
                          {row.feedback_other && (
                            <div>
                              <p className="text-xs text-muted-foreground">E-mail (op de hoogte blijven)</p>
                              <p className="mt-0.5 text-sm text-foreground">{row.feedback_other}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Create Company Dialog */}
      <Dialog open={companyDialogOpen} onOpenChange={setCompanyDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Nieuw bedrijf</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateCompany} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Bedrijfsnaam</label>
              <Input
                placeholder="Pink Roccade"
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewSlug(slugify(e.target.value));
                }}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">URL-slug</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground whitespace-nowrap">/portal/</span>
                <Input
                  placeholder="pink-roccade"
                  value={newSlug}
                  onChange={(e) => setNewSlug(slugify(e.target.value))}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Wachtwoord</label>
              <Input
                type="text"
                placeholder="Kies een wachtwoord voor dit bedrijf"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Deel dit met de deelnemers van de training.</p>
            </div>
            <Button type="submit" className="w-full" disabled={savingCompany}>
              {savingCompany ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aanmaken"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset password Dialog */}
      <Dialog
        open={pwDialogOpen}
        onOpenChange={(open) => {
          setPwDialogOpen(open);
          if (!open) { setPwTarget(null); setPwValue(""); }
        }}
      >
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              Wachtwoord wijzigen{pwTarget ? ` — ${pwTarget.name}` : ""}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Nieuw wachtwoord</label>
              <Input
                type="text"
                placeholder="Kies een nieuw wachtwoord"
                value={pwValue}
                onChange={(e) => setPwValue(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                Het oude wachtwoord vervalt direct. Deel het nieuwe met de deelnemers.
              </p>
            </div>
            <Button type="submit" className="w-full" disabled={savingPw}>
              {savingPw ? <Loader2 className="h-4 w-4 animate-spin" /> : "Wachtwoord opslaan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Participant Dialog */}
      <Dialog
        open={participantDialogOpen}
        onOpenChange={(open) => {
          setParticipantDialogOpen(open);
          if (!open) {
            setEditingParticipant(null);
            setParticipantForm({ ...EMPTY_PARTICIPANT_FORM });
          }
        }}
      >
        <DialogContent className="sm:max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {editingParticipant ? "Deelnemer bewerken" : "Nieuwe deelnemer"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveParticipant} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label htmlFor="participant-name" className="text-sm font-medium text-foreground">
                Naam
              </label>
              <Input
                id="participant-name"
                value={participantForm.name}
                onChange={(e) => setParticipantForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Voornaam Achternaam"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="participant-email" className="text-sm font-medium text-foreground">
                E-mailadres
              </label>
              <Input
                id="participant-email"
                type="email"
                value={participantForm.email}
                onChange={(e) => setParticipantForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="naam@bedrijf.nl"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="participant-company" className="text-sm font-medium text-foreground">
                Bedrijf
              </label>
              <Input
                id="participant-company"
                value={participantForm.company}
                onChange={(e) => setParticipantForm((prev) => ({ ...prev, company: e.target.value }))}
                placeholder="Bedrijfsnaam"
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="participant-workshop" className="text-sm font-medium text-foreground">
                Workshop
              </label>
              <Input
                id="participant-workshop"
                list="academy-workshops"
                value={participantForm.workshop_title}
                onChange={(e) => setParticipantForm((prev) => ({ ...prev, workshop_title: e.target.value }))}
                placeholder="Naam van de workshop"
                required
              />
              <datalist id="academy-workshops">
                {courses.map((course) => (
                  <option key={course.id} value={course.title} />
                ))}
              </datalist>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                savingParticipant
                || !participantForm.name.trim()
                || !participantForm.email.trim()
                || !participantForm.company.trim()
                || !participantForm.workshop_title.trim()
              }
            >
              {savingParticipant ? <Loader2 className="h-4 w-4 animate-spin" /> : "Opslaan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Training Dialog */}
      <Dialog open={trainingDialogOpen} onOpenChange={setTrainingDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Nieuwe training</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTraining} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Bedrijf</label>
              <Select value={newTrainingCompany} onValueChange={setNewTrainingCompany} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kies een bedrijf..." />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Titel</label>
              <Input
                placeholder="AI Basistraining"
                value={newTrainingTitle}
                onChange={(e) => setNewTrainingTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Omschrijving <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              <Textarea
                placeholder="Korte omschrijving van de training..."
                value={newTrainingDesc}
                onChange={(e) => setNewTrainingDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Data <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              {newTrainingDates.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="date"
                    value={d}
                    onChange={(e) => {
                      const updated = [...newTrainingDates];
                      updated[i] = e.target.value;
                      setNewTrainingDates(updated);
                    }}
                  />
                  {newTrainingDates.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => setNewTrainingDates(newTrainingDates.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setNewTrainingDates([...newTrainingDates, ""])} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Datum toevoegen
              </Button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Resources <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Gebruik voor video een Bunny Stream embed-url. Bestandsuploads zoals .mov kunnen door browsers alsnog als download openen.
              </p>
              {newTrainingResources.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Label, bijv. Extra clip"
                    value={r.label}
                    onChange={(e) => {
                      const updated = [...newTrainingResources];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setNewTrainingResources(updated);
                    }}
                    className="w-1/3"
                  />
                  <Textarea
                    placeholder="Waarde of Bunny embed-url..."
                    value={r.value}
                    onChange={(e) => {
                      const updated = [...newTrainingResources];
                      updated[i] = { ...updated[i], value: e.target.value };
                      setNewTrainingResources(updated);
                    }}
                    rows={1}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setNewTrainingResources(newTrainingResources.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setNewTrainingResources([...newTrainingResources, { label: "", value: "" }])} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Resource toevoegen
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={savingTraining}>
              {savingTraining ? <Loader2 className="h-4 w-4 animate-spin" /> : "Aanmaken"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
      {/* Edit Training Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Training bewerken</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTraining} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Titel</label>
              <Input
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Omschrijving <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              <Textarea
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Data <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              {editDates.length === 0 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setEditDates([""])} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Datum toevoegen
                </Button>
              )}
              {editDates.map((d, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="date"
                    value={d}
                    onChange={(e) => {
                      const updated = [...editDates];
                      updated[i] = e.target.value;
                      setEditDates(updated);
                    }}
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setEditDates(editDates.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              {editDates.length > 0 && (
                <Button type="button" variant="outline" size="sm" onClick={() => setEditDates([...editDates, ""])} className="gap-1.5 text-xs">
                  <Plus className="h-3.5 w-3.5" /> Datum toevoegen
                </Button>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Resources <span className="text-muted-foreground font-normal">(optioneel)</span></label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Gebruik voor video een Bunny Stream embed-url. Bestandsuploads zoals .mov kunnen door browsers alsnog als download openen.
              </p>
              {editResources.map((r, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Label, bijv. Extra clip"
                    value={r.label}
                    onChange={(e) => {
                      const updated = [...editResources];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setEditResources(updated);
                    }}
                    className="w-1/3"
                  />
                  <Textarea
                    placeholder="Waarde of Bunny embed-url..."
                    value={r.value}
                    onChange={(e) => {
                      const updated = [...editResources];
                      updated[i] = { ...updated[i], value: e.target.value };
                      setEditResources(updated);
                    }}
                    rows={1}
                    className="flex-1"
                  />
                  <Button type="button" variant="ghost" size="icon" onClick={() => setEditResources(editResources.filter((_, j) => j !== i))}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => setEditResources([...editResources, { label: "", value: "" }])} className="gap-1.5 text-xs">
                <Plus className="h-3.5 w-3.5" /> Resource toevoegen
              </Button>
            </div>
            <Button type="submit" className="w-full" disabled={savingEdit}>
              {savingEdit ? <Loader2 className="h-4 w-4 animate-spin" /> : "Opslaan"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPortal;
