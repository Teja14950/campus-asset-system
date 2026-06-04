import Card from "./Card";

function StatCard({
  title,
  value,
  icon,
  change,
}) {
  return (
    <Card>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-slate-500 text-sm">
            {title}
          </p>

          <h2 className="text-3xl font-bold mt-2">
            {value}
          </h2>

          {change && (
            <p className="text-green-600 text-sm mt-2">
              {change}
            </p>
          )}
        </div>

        <div className="text-blue-600">
          {icon}
        </div>
      </div>
    </Card>
  );
}

export default StatCard;