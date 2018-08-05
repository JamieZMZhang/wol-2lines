import { Dictionary } from '../Dictionary';
import LoadingOverlay from '../LoadingOverlay';
import { TouchDataObj } from '../objects/TouchDataObj';
import { InsertStyle } from '../StyleHelper';
import { style } from './Style';

export class Translator {
	public static readonly splitsChars = ' ,[]()/\:;!?.“”‘’—ー1234567890';

	private touchData: TouchDataObj = { x: 0, y: 0, current: null };
	public hasParsed: boolean = false;
	private Dictionary: Dictionary;

	constructor(protected document: Document) {
		this.Dictionary = new Dictionary(document);
		InsertStyle(style, document.body);
		LoadingOverlay.show();
		setTimeout(this.ProcArticle, 100, document);
		this.LinkHandle();
	}

	private ProcArticle = () => {
		this.document.querySelectorAll<HTMLParagraphElement>('#article [data-pid]').forEach(this.ProcParagraph);
		this.hasParsed = true;
		if (this.Dictionary.isQeueEmpty) {
			LoadingOverlay.hide();
		}
	}

	private ProcParagraph: (paragraphNode: HTMLParagraphElement) => void = (paragraphNode) => {
		this.ProcNode(paragraphNode);
		this.Dictionary.TriggerDownload();
	}

	private ProcNode: (node: HTMLElement) => HTMLElement = (node) => {
		node.style.backgroundColor = 'red';
		const tmp = this.document.createElement('div');

		Array.from(node.childNodes).forEach((n, i, arr) => {
			tmp.appendChild(n);
		});

		Array.from(tmp.childNodes).forEach((child) => {
			if (child.nodeName === '#text') {
				node.insertAdjacentHTML('beforeend', this.ProcText(child.textContent || ''));
			} else if (child.nodeName === 'A' && (child as any).className === 'b') {
				node.appendChild(child as any as HTMLElement);
			} else {
				node.appendChild(this.ProcNode(child as any as HTMLElement));
			}
		});
		node.style.backgroundColor = null;
		return node;
	}

	private ProcText: (text: string) => string = (text) => {
		let buffer = '';
		splits(text, Translator.splitsChars).forEach((w) => {
			if (w.length > 2) {
				const r = this.Dictionary.GetEn(w);
				if (r !== null && r !== undefined) {
					buffer += `<jwd><en>${r}</en>${w}</jwd>`;
				} else {
					buffer += `<jwd><en w="${w.trim().toLowerCase()}"></en>${w}</jwd>`;
				}
			} else {
				buffer += w;
			}
		});
		return buffer;
	}

	private LinkHandle = () => {
		this.document.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
			a.addEventListener('touchstart', (e) => {
				this.touchData.x = e.touches[0].screenX;
				this.touchData.y = e.touches[0].screenY;
			});
			a.addEventListener('touchend', (e: TouchEvent) => this.ProcLink(e.currentTarget as HTMLAnchorElement));
			a.addEventListener('mouseenter', (e: MouseEvent) => this.ProcLink(e.currentTarget as HTMLAnchorElement));
		});
	}

	private ProcLink = (target: HTMLAnchorElement) => {
		if (target.className === 'fb' || target.className === 'lnk' || target.attributes.getNamedItem('data-video')) {
			return;
		}
		if (this.document.querySelector('.tooltip')) {
			this.touchData.current = null;
			if (this.document.querySelector('.tooltipContent jwd')) {
				return;
			}
			LoadingOverlay.show();
			this.document.querySelectorAll<HTMLParagraphElement>('.tooltipContent p[data-pid]').forEach(this.ProcParagraph);
		} else if (this.touchData.current === null || this.touchData.current === target) {
			this.touchData.current = target;
			setTimeout(this.ProcLink, 1000, target);
		}
	}
}


function splits(content: string, separators: string): string[] {
	var result = [];
	var tmp = "";
	var length = content.length;
	for (var i = 0; i < length; ++i) {
		if (separators.includes(content[i])) {
			if (tmp !== "") {
				result.push(tmp);
				tmp = "";
			}
			result.push(content[i]);
		} else {
			tmp += content[i];
		}
	}
	if (tmp.length > 0)
		result.push(tmp);
	return result;
}
