"use client";

import { useEffect, useMemo, useState } from "react";

type CityClock = {
    city: string;
    timezone: string;
    countryCode: string;
};

const defaultCityClocks: CityClock[] = [
    { city: "Austin", timezone: "America/Chicago", countryCode: "US" },
    { city: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires", countryCode: "AR" },
    { city: "London", timezone: "Europe/London", countryCode: "GB" },
    { city: "Munich", timezone: "Europe/Berlin", countryCode: "DE" },
    { city: "Dubai", timezone: "Asia/Dubai", countryCode: "AE" },
    { city: "Tokyo", timezone: "Asia/Tokyo", countryCode: "JP" },
    { city: "Sydney", timezone: "Australia/Sydney", countryCode: "AU" },
];

type WorldClockRowProps = {
    cities?: CityClock[];
};

function formatCityTime(date: Date, timezone: string) {
    return new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
    }).format(date);
}

function formatOffset(timezone: string) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        timeZoneName: "shortOffset",
    }).formatToParts(new Date());

    const offset = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT";
    return offset.replace("GMT", "UTC");
}

function getHourInTimezone(date: Date, timezone: string) {
    const hour = new Intl.DateTimeFormat("en-US", {
        hour: "numeric",
        hour12: false,
        timeZone: timezone,
    }).format(date);

    return Number.parseInt(hour, 10);
}

function formatWeekday(date: Date, timezone: string) {
    return new Intl.DateTimeFormat("en-US", {
        weekday: "short",
        timeZone: timezone,
    }).format(date);
}

export default function WorldClockRow({ cities = defaultCityClocks }: WorldClockRowProps) {
    const [now, setNow] = useState<Date>(() => new Date());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setNow(new Date());
        }, 30_000);

        return () => clearInterval(intervalId);
    }, []);

    const times = useMemo(() => {
        return cities.map((cityClock) => ({
            ...cityClock,
            time: formatCityTime(now, cityClock.timezone),
            offset: formatOffset(cityClock.timezone),
            weekday: formatWeekday(now, cityClock.timezone),
            isDaytime: (() => {
                const hour = getHourInTimezone(now, cityClock.timezone);
                return hour >= 7 && hour < 19;
            })(),
        }));
    }, [cities, now]);

    return (
        <div className="overflow-x-auto">
            <div className="flex min-w-max gap-3 pb-0.5">
                {times.map((clock) => (
                    <div
                        key={clock.timezone}
                        className="min-w-36 rounded-xl border border-foreground/15 bg-[color-mix(in_srgb,var(--background)_20%,var(--foreground)_2%)] px-3.5 py-3"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="app-text-muted text-[11px] font-semibold tracking-[0.14em]">
                                {clock.countryCode}
                            </p>
                            <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                    backgroundColor: clock.isDaytime
                                        ? "var(--chart-2)"
                                        : "var(--chart-1)",
                                    boxShadow: `0 0 0.5rem ${clock.isDaytime
                                        ? "color-mix(in srgb, var(--chart-2) 45%, transparent)"
                                        : "color-mix(in srgb, var(--chart-1) 45%, transparent)"
                                        }`,
                                }}
                            />
                        </div>

                        <p className="mt-2 text-sm font-semibold tracking-tight">{clock.city}</p>
                        <p className="mt-1 text-lg font-semibold leading-none tracking-tight">{clock.time}</p>

                        <div className="app-text-muted mt-2 flex items-center justify-between text-[11px]">
                            <span>{clock.weekday}</span>
                            <span>{clock.offset}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}