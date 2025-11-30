/**
 * Skip to Content - Accessibility feature for keyboard navigation
 * Allows users to skip navigation and jump to main content
 */

function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-accent focus:text-slate-dark focus:rounded-button"
    >
      Skip to main content
    </a>
  );
}

export default SkipToContent;
