"use client";

import React, {
    forwardRef,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from "react";
import * as Accordion from "@radix-ui/react-accordion";
import { motion, useInView } from "framer-motion";

import { cn } from "@/lib/utils";

type AccordionItemProps = {
    children: React.ReactNode;
    className?: string;
} & Accordion.AccordionItemProps;

const AccordionItem = forwardRef<HTMLDivElement, AccordionItemProps>(
    ({ children, className, ...props }, forwardedRef) => (
        <Accordion.Item
            className={cn(
                "mt-px overflow-hidden focus-within:relative focus-within:z-10",
                className,
            )}
            {...props}
            ref={forwardedRef}
        >
            {children}
        </Accordion.Item>
    ),
);

AccordionItem.displayName = "AccordionItem";

type AccordionTriggerProps = {
    children: React.ReactNode;
    className?: string;
};

const AccordionTrigger = forwardRef<HTMLButtonElement, AccordionTriggerProps>(
    ({ children, className, ...props }, forwardedRef) => (
        <Accordion.Header className="flex">
            <Accordion.Trigger
                className={cn(
                    "group flex h-[45px] flex-1 cursor-pointer items-center justify-between px-5 text-[15px] leading-none outline-none",
                    className,
                )}
                {...props}
                ref={forwardedRef}
            >
                {children}
            </Accordion.Trigger>
        </Accordion.Header>
    ),
);

AccordionTrigger.displayName = "AccordionTrigger";

type AccordionContentProps = {
    children: ReactNode;
    className?: string;
} & Accordion.AccordionContentProps;

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
    ({ children, className, ...props }, forwardedRef) => (
        <Accordion.Content
            className={cn(
                "overflow-hidden text-[15px] font-medium data-[state=closed]:animate-slide-up data-[state=open]:animate-slide-down",
                className,
            )}
            {...props}
            ref={forwardedRef}
        >
            <div className="px-5 py-2">{children}</div>
        </Accordion.Content>
    ),
);

AccordionContent.displayName = "AccordionContent";

type CardDataProps = {
    id: number;
    title: string;
    content: string;
    image?: string;
    video?: string;
};

const cardData: CardDataProps[] = [
    {
        id: 1,
        title: "Dashboard Analytics",
        content:
            "Track professor sentiment trends over time. Add your own reviews easily with a URL.",
        image: "/images/f3-SentimentEvolutionDashboard.jpg",
    },
    {
        id: 2,
        title: "Review Insights",
        content:
            "Dive deeper into the reviews that power our analytics.",
        image: "/images/f4-SummaryReviews.jpg",
    },
    {
        id: 3,
        title: "Add Your Professor",
        content:
            "Quickly scrape and analyze your professor's reviews with a simple URL.",
        image: "images/f2-WebScrapping.jpg",
    },
    {
        id: 4,
        title: "AI Chatbot",
        content:
            "Get instant answers about professors, ratings, and teaching styles.",
        image: "images/f1-AIChatBot.jpg",
    },
];



type FeatureProps = {
    collapseDelay?: number;
    ltr?: boolean;
    linePosition?: "left" | "right";
};

const Feature = ({
    collapseDelay = 5000,
    ltr = false,
    linePosition = "left",
}: FeatureProps) => {
    const [currentIndex, setCurrentIndex] = useState<number>(-1);

    const carouselRef = useRef<HTMLUListElement>(null);
    const ref = useRef(null);
    const isInView = useInView(ref, {
        once: true,
        amount: 0.5,
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            if (isInView) {
                setCurrentIndex(0);
            } else {
                setCurrentIndex(-1);
            }
        }, 100);

        return () => clearTimeout(timer);
    }, [isInView]);

    const scrollToIndex = (index: number) => {
        if (carouselRef.current) {
            const card = carouselRef.current.querySelectorAll(".card")[index];
            if (card) {
                const cardRect = card.getBoundingClientRect();
                const carouselRect = carouselRef.current.getBoundingClientRect();
                const offset =
                    cardRect.left -
                    carouselRect.left -
                    (carouselRect.width - cardRect.width) / 2;

                carouselRef.current.scrollTo({
                    left: carouselRef.current.scrollLeft + offset,
                    behavior: "smooth",
                });
            }
        }
    };

    // interval for changing images
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) =>
                prevIndex !== undefined ? (prevIndex + 1) % cardData.length : 0,
            );
        }, collapseDelay);

        return () => clearInterval(timer);
    }, [currentIndex]);

    useEffect(() => {
        const handleAutoScroll = () => {
            const nextIndex =
                (currentIndex !== undefined ? currentIndex + 1 : 0) % cardData.length;
            scrollToIndex(nextIndex);
        };

        const autoScrollTimer = setInterval(handleAutoScroll, collapseDelay);

        return () => clearInterval(autoScrollTimer);
    }, [currentIndex]);

    useEffect(() => {
        const carousel = carouselRef.current;
        if (carousel) {
            const handleScroll = () => {
                const scrollLeft = carousel.scrollLeft;
                const cardWidth = carousel.querySelector(".card")?.clientWidth || 0;
                const newIndex = Math.min(
                    Math.floor(scrollLeft / cardWidth),
                    cardData.length - 1,
                );
                setCurrentIndex(newIndex);
            };

            carousel.addEventListener("scroll", handleScroll);
            return () => carousel.removeEventListener("scroll", handleScroll);
        }
    }, []);

    return (
        <section ref={ref} id="features">
            <div className="py-14">
                <div className="container flex w-full flex-col items-center justify-center p-4">
                    <div className="mx-auto max-w-5xl text-center">
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                            Features
                        </h2>
                    </div>
                    <div className="mx-auto my-12 grid h-full max-w-5xl grid-cols-5 gap-x-10">
                        <div
                            className={`col-span-2 hidden md:flex ${ltr ? "md:order-2 md:justify-end" : "justify-start"
                                }`}
                        >
                            <Accordion.Root
                                className="w-[300px]"
                                type="single"
                                defaultValue={`item-${currentIndex}`}
                                value={`item-${currentIndex}`}
                                onValueChange={(value) =>
                                    setCurrentIndex(Number(value.split("-")[1]))
                                }
                            >
                                {cardData.map((item, index) => (
                                    <AccordionItem
                                        key={item.id}
                                        className="relative mb-8 last:mb-0"
                                        value={`item-${index}`}
                                    >
                                        <div
                                            className={`absolute bottom-0 top-0 h-full w-0.5 overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30 ${linePosition === "right"
                                                ? "left-auto right-0"
                                                : "left-0 right-auto"
                                                }`}
                                        >
                                            <div
                                                className={`absolute left-0 top-0 w-full ${currentIndex === index ? "h-full" : "h-0"
                                                    } origin-top bg-neutral-500 transition-all ease-linear dark:bg-white`}
                                                style={{
                                                    transitionDuration:
                                                        currentIndex === index
                                                            ? `${collapseDelay}ms`
                                                            : "0s",
                                                }}
                                            ></div>
                                        </div>
                                        <AccordionTrigger className="text-xl font-bold">
                                            {item.title}
                                        </AccordionTrigger>
                                        <AccordionContent>{item.content}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion.Root>
                        </div>
                        <div
                            className={`col-span-5 h-[350px] min-h-[200px] w-auto md:col-span-3 ${ltr && "md:order-1"
                                }`}
                        >
                            {cardData[currentIndex]?.image ? (
                                <motion.img
                                    key={currentIndex}
                                    src={cardData[currentIndex].image}
                                    alt="feature"
                                    className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 object-cover p-1"
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.25, ease: "easeOut" }}
                                />
                            ) : cardData[currentIndex]?.video ? (
                                <video
                                    preload="auto"
                                    src={cardData[currentIndex].video}
                                    className="aspect-auto h-full w-full rounded-lg object-cover"
                                    autoPlay
                                    loop
                                    muted
                                />
                            ) : (
                                <div className="aspect-auto h-full w-full rounded-xl border border-neutral-300/50 bg-gray-200 p-1"></div>
                            )}
                        </div>

                        <ul
                            ref={carouselRef}
                            className="col-span-5 flex h-full snap-x flex-nowrap overflow-x-auto py-10 [-ms-overflow-style:none] [-webkit-mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [mask-image:linear-gradient(90deg,transparent,black_20%,white_80%,transparent)] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden snap-mandatory"
                            style={{
                                padding: "50px calc(50%)",
                            }}
                        >
                            {cardData.map((item, index) => (
                                <a
                                    key={item.id}
                                    className="card relative mr-8 grid h-full max-w-60 shrink-0 items-start justify-center py-4 last:mr-0"
                                    onClick={() => setCurrentIndex(index)}
                                    style={{
                                        scrollSnapAlign: "center",
                                    }}
                                >
                                    <div className="absolute bottom-0 left-0 right-auto top-0 h-0.5 w-full overflow-hidden rounded-lg bg-neutral-300/50 dark:bg-neutral-300/30">
                                        <div
                                            className={`absolute left-0 top-0 h-full ${currentIndex === index ? "w-full" : "w-0"
                                                } origin-top bg-neutral-500 transition-all ease-linear dark:bg-white`}
                                            style={{
                                                transitionDuration:
                                                    currentIndex === index ? `${collapseDelay}ms` : "0s",
                                            }}
                                        ></div>
                                    </div>
                                    <h2 className="text-xl font-bold">{item.title}</h2>
                                    <p className="mx-0 max-w-sm text-balance text-sm">
                                        {item.content}
                                    </p>
                                </a>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
};

export function FeatureSection() {
    return <Feature collapseDelay={5000} linePosition="left" />;
}
