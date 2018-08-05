import { InsertStyle } from '../StyleHelper';
import { style } from './Style';

class LoadingOverlay {
	private readonly loader: HTMLDivElement;

	constructor() {
		// this.loader = document.createElement('div');
		// this.loader.hidden = true;
		// this.loader.innerHTML = ;
		// document.body.appendChild(this.loader);
		document.write(`
			<div id="loader-wrapper">
				<div id="loader"></div>
				<div class="loader-section section-left"></div>
				<div class="loader-section section-right"></div>
			</div>`
		);
		this.loader = document.querySelector<HTMLDivElement>('#loader-wrapper')!;

		InsertStyle(style, document.body);
	}

	public show(): void {
		this.loader.hidden = false;
	}

	public hide(): void {
		this.loader.hidden = true;
	}
}

export default new LoadingOverlay();
