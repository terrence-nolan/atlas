interface WidgetWrapperProps {
  children: React.ReactNode;
  themeColor: "blue" | "sage" | "clay" | "lavender" | "ochre";
}

export default function WidgetWrapper({ children, themeColor }: WidgetWrapperProps) {
  
  const sectionThemes = {
    blue: "bg-linear-to-bl from-blue-medium to-blue-dark dark:from-blue-dark dark:to-blue-medium",
    sage: "bg-linear-to-bl from-sage-medium to-sage-dark dark:from-sage-dark dark:to-sage-medium",
    clay: "bg-linear-to-bl from-clay-medium to-clay-dark dark:from-clay-dark dark:to-clay-medium",
    lavender: "bg-linear-to-bl from-lavender-medium to-lavender-dark dark:from-lavender-dark dark:to-lavender-medium",
    ochre: "bg-linear-to-bl from-ochre-medium to-ochre-dark dark:from-ochre-dark dark:to-ochre-medium",
  };

  return (
    <section className={`flex rounded-2xl p-1 grow ${sectionThemes[themeColor]}`}>
      <section className={`flex rounded-xl p-4 grow bg-surface-elevated`}>
        {children}
      </section>
    </section>
  );
}
