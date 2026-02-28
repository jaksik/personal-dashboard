export function normalizeText(value: string | null) {
    return (value ?? "").trim().toLowerCase();
}

export function normalizeNullable(value: string | null) {
    const trimmed = (value ?? "").trim();
    return trimmed.length > 0 ? trimmed : null;
}

export function parseDate(value: string | null) {
    if (!value) {
        return null;
    }

    const time = new Date(value).getTime();
    return Number.isNaN(time) ? null : time;
}
