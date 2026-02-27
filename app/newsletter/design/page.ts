import { createElement } from "react";

export default function NewsletterDesignPage() {
	return createElement(
		"main",
		{ className: "mx-auto w-full max-w-6xl px-4 py-6" },
		createElement("h1", { className: "text-xl font-semibold" }, "Newsletter Design"),
		createElement(
			"p",
			{ className: "mt-2 app-text-muted" },
			"Design workspace placeholder. This page is coming soon."
		)
	);
}
