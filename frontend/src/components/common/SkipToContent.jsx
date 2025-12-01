/**
 * Skip to Content - Accessibility feature for keyboard navigation
 * Allows users to skip navigation and jump directly to main areas
 *
 * WCAG 2.4.1: Provides a mechanism to bypass blocks of content
 */

function SkipLink({ href, children }) {
  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-accent focus:text-slate-dark focus:rounded-xl focus:font-medium focus:shadow-elevated focus:outline-none"
    >
      {children}
    </a>
  );
}

function SkipToContent() {
  return (
    <div className="skip-links">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <SkipLink href="#search">Skip to search</SkipLink>
    </div>
  );
}

export default SkipToContent;
