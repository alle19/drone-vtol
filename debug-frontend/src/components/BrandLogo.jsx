export default function BrandLogo({ className = '', variant = 'primary' }) {
  const src = variant === 'inverse' ? '/logo-white.svg' : '/logo-red.svg';

  return <img src={src} alt="PunctulDeZbor" className={`h-8 w-auto ${className}`.trim()} />;
}
