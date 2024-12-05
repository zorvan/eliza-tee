import React, { useEffect, useState, useRef } from "react";
import ContributorCard from "./Contributor";
import Contributions from "./Contributions";
import { useColorMode } from "@docusaurus/theme-common";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import contributorsSpec from "../contributors.json";

export interface Contributor {
    id: number;
    login: string;
    avatar_url: string;
    html_url: string;
    contributions: number;
}

export interface ContributorProps {
    contributor: Contributor;
    onSelect: () => void;
    darkMode: boolean;
    activitySummary?: string;
    score?: number;
}

export const THEME_COLORS = {
    light: {
        mainBackgroundColor: "#ffffff",
        secondaryBackground: "rgba(0, 0, 0, 0.05)",
        primaryText: "#000000",
        secondaryText: "#ffa600",
    },
    dark: {
        mainBackgroundColor: "#1b1b1d",
        secondaryBackground: "#242526",
        primaryText: "#ffffff",
        secondaryText: "#add8e6",
    },
};

export interface ActivityDetails {
    score: number;
    activitySummary: string;
}

export const GITHUB_PAGE_LIMIT = 30; // The maximum number to fetch per page from the GitHub API.

const Contributors: React.FC = () => {
    const { siteConfig } = useDocusaurusContext();
    const { GITHUB_ACCESS_TOKEN } = siteConfig.customFields;
    const { colorMode } = useColorMode();
    const [selectedContributor, setSelectedContributor] =
        useState<Contributor | null>(null);
    const [contributors, setContributors] = useState<Contributor[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [darkMode, setDarkMode] = useState<boolean>(colorMode === "dark");
    const [hasMore, setHasMore] = useState<boolean>(true);
    const [activitySummaries, setActivitySummaries] = useState<
        Map<string, ActivityDetails>
    >(new Map());

    const observerRef = useRef<HTMLDivElement | null>(null);
    const pageRef = useRef<number>(1);
    const loadingRef = useRef<boolean>(true);

    useEffect(() => {
        setDarkMode(colorMode === "dark");
    }, [colorMode]);

    const fetchContributors = async (page: number) => {
        loadingRef.current = true;
        try {
            const response = await fetch(
                `https://api.github.com/repos/ai16z/eliza/contributors?per_page=${GITHUB_PAGE_LIMIT}&page=${page}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                },
            );
            if (!response.ok) {
                throw new Error(
                    `Error fetching contributors: ${response.statusText}`,
                );
            }
            const data: Contributor[] = await response.json();
            if (data.length === 0) {
                setHasMore(false);
                return;
            }
            const currentContributors = [...contributors, ...data];

            setContributors(currentContributors);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            loadingRef.current = false;
        }
    };

    useEffect(() => {
        const currentActivitySummaries = new Map(activitySummaries);
        contributorsSpec.forEach((spec) => {
            currentActivitySummaries.set(spec.contributor, {
                score: spec.score,
                activitySummary: spec.summary,
            });
        });
        setActivitySummaries(currentActivitySummaries);
        fetchContributors(pageRef.current);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    !loadingRef.current &&
                    hasMore
                ) {
                    loadingRef.current = true;
                    pageRef.current++;
                    fetchContributors(pageRef.current);
                }
            },
            { threshold: 1.0 },
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [contributors, hasMore]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!contributors.length) {
        return <div>Loading...</div>;
    }

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: `repeat(${selectedContributor ? "1" : "auto-fit"}, minmax(400px, 1fr))`,
                gap: "1rem",
                backgroundColor: darkMode
                    ? THEME_COLORS.dark.secondaryBackground
                    : THEME_COLORS.light.secondaryBackground,
                padding: "10px",
                width: "100%",
            }}
        >
            {selectedContributor ? (
                <Contributions
                    contributor={selectedContributor}
                    onBack={() => setSelectedContributor(null)}
                    darkMode={darkMode}
                    activitySummary={
                        activitySummaries.get(selectedContributor.login)
                            ?.activitySummary
                    }
                    score={
                        activitySummaries.get(selectedContributor.login)?.score
                    }
                />
            ) : (
                <>
                    {contributors.map((contributor) => (
                        <ContributorCard
                            key={contributor.id}
                            contributor={contributor}
                            onSelect={() => {
                                setSelectedContributor(contributor);
                            }}
                            darkMode={darkMode}
                            activitySummary={
                                activitySummaries.get(contributor.login)
                                    ?.activitySummary
                            }
                            score={
                                activitySummaries.get(contributor.login)?.score
                            }
                        />
                    ))}
                    <div
                        ref={observerRef}
                        style={{
                            height: "1px",
                            backgroundColor: "transparent",
                        }}
                    />
                    {hasMore && <div>Loading more...</div>}
                </>
            )}
        </div>
    );
};

export default Contributors;
