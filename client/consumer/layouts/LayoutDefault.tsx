import "./style.css";
import "./tailwind.css";

export default function LayoutDefault({
	children,
}: { children: React.ReactNode }) {
	return (
		<div id="page-container" className="min-h-screen">
			<div id="page-content">{children}</div>
		</div>
	);
}
