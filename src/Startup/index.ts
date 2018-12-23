import { InsertStyle } from '../StyleHelper';
import { Translator } from '../Translator';
import { style } from './Style';

export class Startup {

	constructor() {

		if (location.hostname !== 'wol.jw.org') {
			alert('This tool only works on wol.jw.org');
			return;
		}
		document.write(`
			<iframe id="iframe" src="${window.location.href}">
			</iframe>
		`);
		InsertStyle(style, window.document.body);
		const theFrame = window.document.querySelector<HTMLIFrameElement>('#iframe')!;

		theFrame.onload = () => {
			new Translator(theFrame.contentDocument!);
			window.history.pushState(null, '', theFrame.contentWindow!.location.href);
		};
	}
}

