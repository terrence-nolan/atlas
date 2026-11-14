interface WidgetWrapperProps {
  children: React.ReactNode;
  themeColor: "blue" | "sage" | "clay" | "lavender" | "ochre";
}

export default function WidgetWrapper({ children, themeColor }: WidgetWrapperProps) {
  
  const sectionThemes = {
    blue: "bg-linear-to-bl from-blue-dark to-blue-medium",
    sage: "bg-linear-to-bl from-sage-dark to-sage-medium",
    clay: "bg-linear-to-bl from-clay-dark to-clay-medium",
    lavender: "bg-linear-to-bl from-lavender-dark to-lavender-medium",
    ochre: "bg-linear-to-bl from-ochre-dark to-ochre-medium"
  };

  return (
    <section className={`flex rounded-2xl p-1 grow ${sectionThemes[themeColor]}`}>
      <section className={`flex rounded-xl p-4 grow bg-surface-elevated`}>
        {children}
      </section>
    </section>
  );
}
