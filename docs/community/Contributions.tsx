import React, { useState, useEffect } from "react";
import { Accordion } from "./Accordion";
import { StatCard } from "./StatCard";
import { THEME_COLORS } from "./Contributors";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";

export interface GitHubItem {
    html_url: string;
    title: string;
    created_at: string;
}

export interface StatCardProps {
    title: string;
    value: number;
    style?: React.CSSProperties;
}

export interface AccordionItem {
    data: GitHubItem[];
    total_count: number;
}

const initializeAccordionItem = (): AccordionItem => ({
    data: [],
    total_count: 0,
});

const Contributions = ({ contributor, onBack, darkMode }) => {
    const { siteConfig } = useDocusaurusContext();
    const { GITHUB_ACCESS_TOKEN } = siteConfig.customFields;
    const [commitsData, setCommitsData] = useState<AccordionItem>(
        initializeAccordionItem(),
    );
    const [prsData, setPrsData] = useState<AccordionItem>(
        initializeAccordionItem(),
    );
    const [issuesData, setIssuesData] = useState<AccordionItem>(
        initializeAccordionItem(),
    );
    const [openAccordion, setOpenAccordion] = useState<string | null>(null);

    const [commitPage, setCommitPage] = useState(1);
    const [prPage, sePrPage] = useState(1);
    const [issuePage, setIssuePage] = useState(1);

    useEffect(() => {
        const fetchContributorStats = async () => {
            try {
                await fetchCommits(commitPage);
                await fetchPRs(prPage);
                await fetchIssues(issuePage);
            } catch (error) {
                console.error("Error fetching contributor stats:", error);
            }
        };

        fetchContributorStats();
    }, [contributor.login]);

    const toggleAccordion = (section: string) => {
        setOpenAccordion((prev) => (prev === section ? null : section));
    };

    const fetchCommits = async (page: number) => {
        try {
            const commitResponse = await fetch(
                `https://api.github.com/repos/ai16z/eliza/commits?author=${contributor.login}&page=${page}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                },
            );
            const commitData = await commitResponse.json();
            const commitItems = commitData.map((commit: any) => ({
                html_url: commit.html_url,
                title: commit.commit.message,
                created_at: commit.commit.author.date,
            }));
            const currentCommitsData = [...commitsData.data, ...commitItems];
            setCommitsData({
                data: currentCommitsData,
                total_count: contributor.contributions,
            });
        } catch (error) {
            console.error("Error fetching commits:", error);
        }
    };

    const fetchPRs = async (page: number) => {
        try {
            const prResponse = await fetch(
                `https://api.github.com/search/issues?q=type:pr+author:${contributor.login}+repo:ai16z/eliza&page=${page}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                },
            );
            const prData = await prResponse.json();
            const prItems = prData.items.map((pr: any) => ({
                html_url: pr.html_url,
                title: pr.title,
                created_at: pr.created_at,
            }));
            const currentPrsData = [...prsData.data, ...prItems];
            setPrsData({
                data: currentPrsData,
                total_count: prData.total_count,
            });
        } catch (error) {
            console.error("Error fetching PRs:", error);
        }
    };

    const fetchIssues = async (page: number) => {
        try {
            const issueResponse = await fetch(
                `https://api.github.com/search/issues?q=type:issue+author:${contributor.login}+repo:ai16z/eliza&page=${page}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `token ${GITHUB_ACCESS_TOKEN}`,
                        Accept: "application/vnd.github.v3+json",
                    },
                },
            );
            const issueData = await issueResponse.json();
            const issueItems = issueData.items.map((issue: any) => ({
                html_url: issue.html_url,
                title: issue.title,
                created_at: issue.created_at,
            }));
            const currentIssuesData = [...issuesData.data, ...issueItems];
            setIssuesData({
                data: currentIssuesData,
                total_count: issueData.total_count,
            });
        } catch (error) {
            console.error("Error fetching issues:", error);
        }
    };

    const accordionItems = [
        {
            title: "Commits",
            data: commitsData,
            section: "commits",
            loadMore: () => {
                const nextPage = commitPage + 1;
                fetchCommits(nextPage);
                setCommitPage(nextPage);
            },
        },
        {
            title: "Pull Requests",
            data: prsData,
            section: "pullRequests",
            loadMore: () => {
                const nextPage = prPage + 1;
                fetchPRs(nextPage);
                sePrPage(nextPage);
            },
        },
        {
            title: "Issues",
            data: issuesData,
            section: "issues",
            loadMore: () => {
                const nextPage = issuePage + 1;
                fetchIssues(nextPage);
                setIssuePage(nextPage);
            },
        },
    ];

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                padding: "1rem",
                gap: "1rem",
                color: darkMode
                    ? THEME_COLORS.dark.primaryText
                    : THEME_COLORS.light.primaryText,
            }}
        >
            <div>
                <span
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={onBack}
                >
                    <span
                        style={{
                            border: "solid currentColor",
                            borderWidth: "0 2px 2px 0",
                            display: "inline-block",
                            height: "8px",
                            pointerEvents: "none",
                            transform: "translateY(-1px) rotate(135deg)",
                            width: "8px",
                            marginRight: "1px",
                        }}
                    ></span>
                    <span>back</span>
                </span>
            </div>
            <div
                key={contributor.id}
                style={{
                    height: "100px",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "box-shadow 0.2s ease-in-out",
                    backgroundColor: darkMode
                        ? THEME_COLORS.dark.mainBackgroundColor
                        : THEME_COLORS.light.mainBackgroundColor,
                    padding: "24px",
                    justifyContent: "center",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                    }}
                >
                    <img
                        src={contributor.avatar_url}
                        alt={`${contributor.login}'s avatar`}
                        style={{
                            width: "64px",
                            height: "64px",
                            borderRadius: "50%",
                        }}
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                        }}
                    >
                        <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                            {contributor.login}
                        </div>
                        <div
                            style={{
                                color: darkMode
                                    ? THEME_COLORS.dark.secondaryText
                                    : THEME_COLORS.light.secondaryText,
                            }}
                        >
                            {contributor.contributions} contributions
                        </div>
                    </div>
                </div>
            </div>
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "1rem",
                    marginTop: "1rem",
                }}
            >
                {accordionItems.map((stat, index) => (
                    <StatCard
                        key={index}
                        title={stat.title}
                        value={stat.data?.total_count}
                        style={{
                            backgroundColor: darkMode
                                ? THEME_COLORS.dark.mainBackgroundColor
                                : THEME_COLORS.light.mainBackgroundColor,
                            color: darkMode
                                ? THEME_COLORS.dark.primaryText
                                : THEME_COLORS.light.primaryText,
                        }}
                    />
                ))}
            </div>
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                }}
            >
                {accordionItems.map((item) => (
                    <Accordion
                        key={item.section}
                        title={item.title}
                        isOpen={openAccordion === item.section}
                        onToggle={() => toggleAccordion(item.section)}
                        data={item.data.data}
                        loadMore={item.loadMore}
                        total_count={item.data.total_count}
                        primaryText={
                            darkMode
                                ? THEME_COLORS.dark.primaryText
                                : THEME_COLORS.light.primaryText
                        }
                        secondaryText={
                            darkMode
                                ? THEME_COLORS.dark.secondaryText
                                : THEME_COLORS.light.secondaryText
                        }
                        mainBackgroundColor={
                            darkMode
                                ? THEME_COLORS.dark.mainBackgroundColor
                                : THEME_COLORS.light.mainBackgroundColor
                        }
                    />
                ))}
            </div>
        </div>
    );
};

export default Contributions;
