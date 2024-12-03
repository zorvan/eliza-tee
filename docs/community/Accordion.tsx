import React, { useState } from "react";
import { GitHubItem } from "./Contributions";

interface AccordionProps {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    data: GitHubItem[];
    loadMore?: () => void;
    total_count: number;
    primaryText?: string;
    secondaryText?: string;
    mainBackgroundColor?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
    title,
    isOpen,
    onToggle,
    data,
    loadMore,
    total_count,
    primaryText,
    secondaryText,
    mainBackgroundColor,
}) => {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [hoverLoadMore, setHoverLoadMore] = useState<boolean>(false);
    const [maxHeight, setMaxHeight] = useState<string>(
        isOpen ? "1000px" : "0px",
    );

    React.useEffect(() => {
        setMaxHeight(isOpen ? "5000px" : "0px");
    }, [isOpen]);

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                borderRadius: "0.5rem",
                padding: "1rem",
                color: primaryText ?? "black",
                background: mainBackgroundColor ?? "",
            }}
        >
            <div
                onClick={onToggle}
                style={{
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "1rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                }}
            >
                <div>{title}</div>
                <div
                    style={{
                        transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                        transition: "transform 0.3s ease",
                    }}
                >
                    {"▶"}
                </div>
            </div>
            <div
                style={{
                    maxHeight,
                    overflow: "hidden",
                    transition: isOpen ? "max-height 3s ease" : "",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                        margin: "2rem 0 1rem 1rem",
                    }}
                >
                    {data.map((entry, index) => (
                        <div
                            key={index}
                            style={{
                                opacity: hoveredIndex === index ? 0.8 : 1.0,
                            }}
                        >
                            <div
                                style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    marginBottom: "0.5rem",
                                    cursor: "pointer",
                                    transition: "color 0.2s ease",
                                }}
                                onMouseEnter={() => setHoveredIndex(index)}
                                onMouseLeave={() => setHoveredIndex(null)}
                                onClick={() =>
                                    window.open(
                                        entry.html_url,
                                        "_blank",
                                        "noopener,noreferrer",
                                    )
                                }
                            >
                                <div>{entry.title}</div>
                                <div
                                    style={{
                                        fontSize: "0.8rem",
                                        color: secondaryText ?? "gray",
                                    }}
                                >
                                    {entry.created_at.split("T")[0]}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {isOpen && loadMore && data.length < total_count && (
                <div
                    style={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                    }}
                >
                    <span
                        style={{
                            color: hoverLoadMore
                                ? (secondaryText ?? "#3b82f6")
                                : (primaryText ?? "black"),
                            cursor: "pointer",
                        }}
                        onMouseEnter={() => setHoverLoadMore(true)}
                        onMouseLeave={() => setHoverLoadMore(false)}
                        onClick={loadMore}
                    >
                        Load more...
                    </span>
                </div>
            )}
        </div>
    );
};
