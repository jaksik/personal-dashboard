type NewsletterProfileMenuProps = {
  signOutAction: () => Promise<void>;
};

export default function NewsletterProfileMenu({ signOutAction }: NewsletterProfileMenuProps) {
  return (
    <details className="relative">
      <summary
        className="inline-flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full text-lg leading-none text-foreground/80 transition-colors hover:text-foreground"
        aria-label="Open profile menu"
        title="Open profile menu"
      >
        <span aria-hidden="true">👤</span>
      </summary>

      <div className="absolute right-0 z-40 mt-2 min-w-32 rounded-md border border-foreground/15 bg-background p-1 shadow-md">
        <form action={signOutAction}>
          <button
            type="submit"
            className="w-full rounded-sm px-3 py-2 text-left text-sm text-foreground/90 transition-colors hover:bg-foreground/8"
          >
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}