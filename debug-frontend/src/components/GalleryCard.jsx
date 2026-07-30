export default function GalleryCard({ item }) {
  const mediaSrc = item.media_url || '/logo-red.svg';

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      {item.media_type === 'video' ? (
        <video src={mediaSrc} controls className="h-48 w-full object-cover bg-neutral-100" />
      ) : (
        <img src={mediaSrc} alt={item.title} className="h-48 w-full object-cover bg-neutral-100" />
      )}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono text-xs uppercase tracking-wide text-neutral-500">{item.category || 'Gallery'}</p>
          {item.media_type && <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] uppercase text-neutral-600">{item.media_type}</span>}
        </div>
        <h3 className="mt-2 font-medium text-neutral-900">{item.title}</h3>
        <p className="mt-1 text-sm text-neutral-600">{item.description || 'VTOL media from the network.'}</p>
        {item.drone_name && (
          <p className="mt-3 text-xs font-mono text-neutral-500">{item.drone_name}</p>
        )}
      </div>
    </div>
  );
}