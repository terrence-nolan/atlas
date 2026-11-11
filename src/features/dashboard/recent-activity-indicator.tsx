interface RecentActivityIndicatorProps {
  themeColor: "blue" | "sage" | "clay" | "lavender" | "ochre";
}

export default function RecentActivityIndicator({ themeColor }: RecentActivityIndicatorProps) {
  const indicatorThemes = {
    blue: "bg-blue",
    sage: "bg-sage",
    clay: "bg-clay",
    lavender: "bg-lavender",
    ochre: "bg-ochre"
  };

  return (
    <div className="relative h-4 w-4">
      {/* Larger, lighter circle */}
      <div className={`absolute inset-0 rounded-full opacity-25 ${indicatorThemes[themeColor]}`} />

      {/* Smaller, darker circle */}
      <div className={`absolute inset-0 m-auto h-2 w-2 rounded-full ${indicatorThemes[themeColor]}`} />
    </div>
  );
}
