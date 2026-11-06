interface WidgetWrapperProps {
  children: React.ReactNode;
  header: string;
  themeColor: "blue" | "sage" | "clay" | "lavender" | "ochre";
}

export default function WidgetWrapper({ children, header, themeColor }: WidgetWrapperProps) {
  const headerThemes = {
    blue: "text-blue-text",
    sage: "text-sage-text",
    clay: "text-clay-text",
    lavender: "text-lavender-text",
    ochre: "text-ochre-text"
  };
  
  const sectionThemes = {
    blue: "bg-blue-soft",
    sage: "bg-sage-soft",
    clay: "bg-clay-soft",
    lavender: "bg-lavender-soft",
    ochre: "bg-ochre-soft"
  };

  return (
    <div className="flex flex-col">
      <h3 className={`text-xl font-bold pb-2 px-2 ${headerThemes[themeColor]}`}>{header}</h3>
      <section className={`rounded-xl p-5 ${sectionThemes[themeColor]}`}>
        {children}
      </section>
    </div>
  );
}