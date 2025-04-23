// https://vike.dev/Head

import faviconUrl from "../assets/favicon.ico";

export default function HeadDefault() {
	return (
		<>
			<link rel="icon" href={faviconUrl} />
		</>
	);
}
