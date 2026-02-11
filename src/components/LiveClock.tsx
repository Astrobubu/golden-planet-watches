import { useEffect, useState } from "react";

export function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours() % 12;
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourDeg = hours * 30 + minutes * 0.5;
  const minuteDeg = minutes * 6 + seconds * 0.1;
  const secondDeg = seconds * 6;

  return (
    <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px]">
      {/* Watch face */}
      <div className="absolute inset-0 rounded-full border-2 border-gold/30 bg-gradient-to-br from-surface-elevated via-background to-surface shadow-gold">
        {/* Hour markers */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-1/2 left-1/2 w-0.5 origin-bottom"
            style={{
              height: i % 3 === 0 ? "14px" : "8px",
              transform: `translate(-50%, -100%) rotate(${i * 30}deg) translateY(-${
                (typeof window !== "undefined" && window.innerWidth >= 768) ? 158 : 118
              }px)`,
            }}
          >
            <div className={`w-full h-full ${i % 3 === 0 ? "bg-gold" : "bg-gold/40"} rounded-full`} />
          </div>
        ))}

        {/* Brand text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-serif text-sm md:text-base text-gold/60 mt-[-30px]">MDT</span>
        </div>

        {/* Hour hand */}
        <div
          className="absolute top-1/2 left-1/2 w-1 bg-gold-light rounded-full origin-bottom transition-transform duration-500"
          style={{
            height: "25%",
            transform: `translate(-50%, -100%) rotate(${hourDeg}deg)`,
          }}
        />

        {/* Minute hand */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 bg-gold rounded-full origin-bottom transition-transform duration-300"
          style={{
            height: "33%",
            transform: `translate(-50%, -100%) rotate(${minuteDeg}deg)`,
          }}
        />

        {/* Second hand */}
        <div
          className="absolute top-1/2 left-1/2 w-[1px] bg-gold-dark rounded-full origin-bottom"
          style={{
            height: "37%",
            transform: `translate(-50%, -100%) rotate(${secondDeg}deg)`,
            transition: "transform 0.15s cubic-bezier(0.4, 2.08, 0.55, 0.44)",
          }}
        />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-gold" />
      </div>
    </div>
  );
}
