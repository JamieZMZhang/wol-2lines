import { LangObj } from './objects/LangObj';

class Config {
	private static readonly Langs: { [pubCode: string]: LangObj } = {
		f: {
			langCode: 'fr',
			pubCode: 'f',
		},
		in: {
			langCode: 'in',
			pubCode: 'id',
		},
		tg: {
			langCode: 'tl',
			pubCode: 'tg',
		},
	};

	public sourceLang: LangObj | undefined;
	public targetLang: LangObj = {
		langCode: 'en',
		pubCode: 'e',
	};

	constructor() {
		const currentPubCode = /lp-(\w+)/.exec(window.location.pathname)![1];
		this.sourceLang = Config.Langs[currentPubCode];
	}
}

export default new Config();
