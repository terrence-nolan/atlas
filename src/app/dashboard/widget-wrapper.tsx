interface WidgetWrapperProps {
  children: React.ReactNode;
  themeColor: "blue" | "sage" | "clay" | "lavender" | "ochre";
}

export default function WidgetWrapper({ children, themeColor }: WidgetWrapperProps) {
  
  const sectionThemes = {
    blue: "bg-blue-soft",
    sage: "bg-sage-soft",
    clay: "bg-clay-soft",
    lavender: "bg-lavender-soft",
    ochre: "bg-ochre-soft"
  };

  return (
    <section className={`rounded-xl p-4 grow ${sectionThemes[themeColor]}`}>
      {children}
    </section>
  );
}