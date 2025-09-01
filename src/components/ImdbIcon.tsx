interface ImdbIconProps {
  className?: string;
}

export const ImdbIcon = ({ className = "w-4 h-4" }: ImdbIconProps) => {
  return (
    <svg
      viewBox="0 0 48 24"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* IMDB background */}
      <rect
        width="48"
        height="24"
        rx="2"
        fill="#F5C518"
      />
      {/* IMDb text */}
      <text
        x="24"
        y="16"
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#000000"
        fontFamily="Arial, sans-serif"
      >
        IMDb
      </text>
    </svg>
  );
};