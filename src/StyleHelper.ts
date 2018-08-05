export function InsertStyle(style: string, insertTo: HTMLElement) {
	const styleTag = insertTo.ownerDocument.createElement('style');
	styleTag.innerHTML = style;
	insertTo.appendChild(styleTag);
}