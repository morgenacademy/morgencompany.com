interface VideoPlayerProps {
  src: string;
  poster?: string;
}

/**
 * Bunny Stream iframe embed player.
 * `src` should be the Bunny Stream video GUID, e.g. "a1b2c3d4-...".
 * Or a full iframe URL like "https://iframe.mediadelivery.net/embed/LIBRARY_ID/VIDEO_ID".
 */
const VideoPlayer = ({ src }: VideoPlayerProps) => {
  // Support both a full URL or just a video GUID
  const embedUrl = src.startsWith("http")
    ? src
    : `https://iframe.mediadelivery.net/embed/${src}`;

  if (!src) {
    return (
      <div className="aspect-video w-full rounded-xl bg-secondary flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Geen video beschikbaar</p>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-card">
      <iframe
        src={embedUrl}
        className="h-full w-full border-0"
        loading="lazy"
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;
