export const SECTION_LABELS: Record<string, string> = {
    feature: "Hello",
    uncategorized: "Uncategorized",
};

export const CATEGORY_RENDER_ORDER = [
    "feature",
    "economy",
    "brief",
    "research",
    "uncategorized",
];

export function getSectionLabel(category: string) {
    const key = category.trim().toLowerCase();
    return SECTION_LABELS[key] ?? category;
}

export function getCategoryRenderIndex(category: string) {
    const key = category.trim().toLowerCase();
    const index = CATEGORY_RENDER_ORDER.indexOf(key);
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}
