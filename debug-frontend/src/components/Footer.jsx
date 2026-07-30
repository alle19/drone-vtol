import { LuInstagram } from 'react-icons/lu';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between">
        <p className="text-sm text-neutral-600">© {new Date().getFullYear()} PunctulDeZbor. All rights reserved.</p>
        <a 
          href="https://www.instagram.com/punctuldezbor" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center w-11 h-11 -m-2.5 text-neutral-600 hover:text-beacon transition"
          aria-label="Instagram"
        >
          <LuInstagram className="w-6 h-6" />
        </a>
      </div>
    </footer>
  );
}