import Config from './Config';
import LoadingOverlay from './LoadingOverlay';

export class Dictionary {
	private static readonly API = 'https://translate.yandex.net/api/v1.5/tr.json/translate' +
		'?key=trnsl.1.1.20151224T142049Z.759b08af73c0cdb9.fda4eaad62f70a77deabf469f04e161cfda554b4' +
		'&format=text';
	private pending: string[] = [];
	private qeue: string[] = [];

	get isQeueEmpty(): boolean {
		return this.qeue.length === 0;
	}

	constructor(protected document: Document) {

	}

	public GetEn = (word: string) => {
		word = word.toLowerCase();
		const r = localStorage.getItem(`${Config.sourceLang!.pubCode}-${Config.targetLang.pubCode}-${word}`);
		if (r !== null) {
			return r;
		} else {
			this.Qeue(word);
		}
	}

	public Qeue = (word: string) => {
		if (!this.qeue.includes(word)) {
			this.qeue.push(word);
		}
	}

	public TriggerDownload = () => {
		if (this.pending.length === 0 && this.qeue.length > 0) {
			this.pending = this.qeue.slice(0, 100);
			this.qeue = this.qeue.slice(this.pending.length);
			const query = this.pending.map((w) => `&text=${w}`).join('');
			fetch(`${Dictionary.API}&lang=${Config.sourceLang!.langCode}-${Config.targetLang.langCode}${query}`)
				.then((response) => {
					response.json().then(
						(data) => {
							for (let i = 0; i < data.text.length; ++i) {
								let t = unescapeString((data.text[i])).trim().toLowerCase();
								localStorage.setItem(`${Config.sourceLang!.pubCode}-${Config.targetLang.pubCode}-${this.pending[i]}`, t);
								this.document.querySelectorAll<HTMLElement>(`en[w='${this.pending[i].replace(/'/g, `\\'`)}']`).forEach((n) => {
									n.innerText = t;
									n.attributes.removeNamedItem('w');
								});
							}
							this.pending = [];
							setTimeout(this.TriggerDownload, 50);
						},
					);
				});
		} else if (this.isQeueEmpty) { // should also check if the article has finished parsing
			LoadingOverlay.hide();
		}
	}
}

function unescapeString(str: string) {
	return str.replace(/&#([0-9]{1,3});/gi, (match, numStr) => {
		const num = parseInt(numStr, 10); // read num as normal number
		return String.fromCharCode(num);
	});
}
