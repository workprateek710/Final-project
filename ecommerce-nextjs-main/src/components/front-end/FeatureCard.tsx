interface PropsType {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

const FeatureCard = ({ icon, title, desc }: PropsType) => {
  return (
    <div className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-slate-100 hover:border-accent/20 hover:shadow-md transition group">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-accent/8 text-accent flex items-center justify-center text-2xl group-hover:bg-accent group-hover:text-white transition">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-slate-500 text-sm mt-0.5">{desc}</p>
      </div>
    </div>
  );
};

export default FeatureCard;
