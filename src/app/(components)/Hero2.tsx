import OrbitingCircles from "@/components/ui/orbiting-circles";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";

const StarIcon = () => (
  <svg
    width="100"
    height="100"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L14.09 8.26L20 9.27L15.5 13.14L16.82 19.02L12 16.24L7.18 19.02L8.5 13.14L4 9.27L9.91 8.26L12 2Z"
      fill="currentColor"
    />
  </svg>
);

export function HeroWithOrbitingCircles() {
    const fadeInRef = useRef<HTMLHeadingElement>(null);
    const fadeInInView = useInView(fadeInRef, {
        once: true,
    });
    const user = useUser();
    const fadeUpVariants = {
        initial: {
            opacity: 0,
            y: 24,
        },
        animate: {
            opacity: 1,
            y: 0,
        },
    };

    return (
        <div className="relative flex h-[600px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl pb-20">
            <span className="pointer-events-none whitespace-pre-wrap bg-gradient-to-b from-black to-gray-300 bg-clip-text text-center text-8xl font-semibold leading-none text-transparent dark:from-white dark:to-black">
                <motion.h1
                    ref={fadeInRef}
                    className="text-balance bg-gradient-to-br from-black from-30% to-black/60 bg-clip-text py-6 text-4xl font-medium leading-none tracking-tighter text-transparent dark:from-white dark:to-white/40 sm:text-6xl md:text-6xl lg:text-8xl"
                    animate={fadeInInView ? "animate" : "initial"}
                    variants={fadeUpVariants}
                    initial={false}
                    transition={{
                        duration: 0.6,
                        delay: 0.1,
                        ease: [0.21, 0.47, 0.32, 0.98],
                        type: "spring",
                    }}
                >
                    <span>Welcome to </span>
                    <span className="pointer-events-none z-10 whitespace-pre-wrap bg-gradient-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-center font-bold leading-none tracking-tighter text-transparent">
                        RateSmart
                    </span>

                    {/*<br /> <span className="text-7xl">AI-powered flashcard generator</span> <br />*/}
                </motion.h1>
            </span>

            {/* Inner Circles */}
            <OrbitingCircles
                className="size-[30px] border-none bg-transparent"
                duration={20}
                delay={20}
                radius={80}
            >
                <StarIcon />
            </OrbitingCircles>
            <OrbitingCircles
                className="size-[30px] border-none bg-transparent"
                duration={20}
                delay={10}
                radius={80}
            >
                <StarIcon />
            </OrbitingCircles>

            {/* Outer Circles (reverse) */}
            <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={190}
                duration={20}
                reverse
            >
                <StarIcon />
            </OrbitingCircles>
            <OrbitingCircles
                className="size-[50px] border-none bg-transparent"
                radius={190}
                duration={20}
                delay={20}
                reverse
            >
                <StarIcon />
            </OrbitingCircles>

            {/* Button */}
            <div className="mt-10">
                <motion.div
                    animate={fadeInInView ? "animate" : "initial"}
                    variants={fadeUpVariants}
                    initial={false}
                    transition={{
                        duration: 0.6,
                        delay: 0.3,
                        ease: [0.21, 0.47, 0.32, 0.98],
                        type: "spring",
                    }}
                >
                    <a
                        href={user.isSignedIn ? "/dashboard" : "/sign-up"}
                        className={cn(
                            "group relative border-none inline-flex h-9 w-full items-center justify-center gap-2 overflow-hidden whitespace-pre rounded-md px-4 py-2 text-base font-semibold tracking-tighter focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 md:flex",
                            "transform-gpu ring-offset-current transition-all duration-300 ease-out hover:ring-2 hover:ring-primary hover:ring-offset-2"
                        )}
                    >
                        <span className="w-full text-center font-bold bg-gradient-to-b from-[#ffd319] via-[#ff2975] to-[#8c1eff] bg-clip-text text-transparent">
                            Get Started
                        </span>
                        <ChevronRight className="size-4 translate-x-0 transition-all duration-300 ease-out group-hover:translate-x-1" />
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
