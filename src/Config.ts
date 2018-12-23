import { LangObj } from './objects/LangObj';

class Config {
	private static readonly Langs: { [pubCode: string]: LangObj } = {
		f: {
			langCode: 'fr',
			pubCode: 'f',
		},
		in: {
			langCode: 'id',
			pubCode: 'in',
		},
		tg: {
			langCode: 'tl',
			pubCode: 'tg',
		},
	};

	public sourceLang: LangObj;
	public targetLang: LangObj = (window as any).targetLang || {
		langCode: 'en',
		pubCode: 'e',
	};

	constructor() {
		const langCodes = /\/lp-(\w+)(?:.*\/lp-(\w+))?/.exec(window.location.pathname)!;
		const currentPubCode = langCodes[2] || langCodes[1];
		this.sourceLang = Config.Langs[currentPubCode];
	}
}

export default new Config();
