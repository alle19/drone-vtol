export default function GalleryCard({ item }) {
  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      {item.media_type === 'video' ? (
        <video src={item.media_url} controls className="w-full h-48 object-cover bg-neutral-100" />
      ) : (
        <img src={item.media_url} alt={item.title} className="w-full h-48 object-cover bg-neutral-100" />
      )}
      <div className="p-4">
        <p className="font-mono text-xs text-neutral-500 uppercase mb-1">{item.category}</p>
        <h3 className="font-medium">{item.title}</h3>
        <p className="text-sm text-neutral-600 mt-1">{item.description}</p>
        {(item.drone_name || item.firm_name) && (
          <p className="text-xs text-neutral-500 mt-2 font-mono">{[item.drone_name, item.firm_name].filter(Boolean).join(' · ')}</p>
        )}
      </div>
    </div>
  );
}