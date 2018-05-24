(function ($) {
	var splitsChars = " ,[]()/\:;!?.“”‘’—ー1234567890";
	var langs = { tg: "tl", in: "id", f: "fr" };
	var langCode = "";
	var targetLang = "en";
	var doneArticle = false;
	var touchData = { x: 0, y: 0, current: 0 };

	function splits(content) {
		var result = [];
		var tmp = "";
		var length = content.length;
		for (var i = 0; i < length; ++i) {
			if (splitsChars.includes(content[i])) {
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

	function unescapeString(str) {
		return str.replace(/&#([0-9]{1,3});/gi, function (match, numStr) {
			var num = parseInt(numStr, 10); // read num as normal number
			return String.fromCharCode(num);
		})
	};
	var Translator = {
		ProcessPage() {
			if ($("#translator-style").length > 0) {
				alert("This page has been translated! If you want to translate it again please reload this page then execute this script.");
				return;
			}
			Translator.GetLangCode();
			if (langCode == undefined) {
				alert("Not supported language.");
				return;
			}
			Translator.InitLoadingIcon();
			$("body").append("<style id='translator-style'>jwd{display:inline-block;text-indent:0}article a:not(.ni):hover {text-decoration: none;border-bottom-width: 1px;border-bottom-style: solid;}en{display:block;color:#00f;margin-bottom:-.6em;font-size:.6em}</style>");
			setTimeout(Translator.ProcArticle, 100);
			Translator.LinkHandle();
		},
		GetLangCode() {
			var p = window.location.pathname;
			var si = p.lastIndexOf("/lp-")
			var ei = p.indexOf("/", si + 4);
			var l = p.substring(si + 4, ei >= 0 ? ei : p.length);
			langCode = langs[l];
		},
		ProcArticle() {
			$("#article [data-pid]").each(Translator.ProcParagraph);
			doneArticle = true;
			if (Dictionary.qeue.length === 0)
				Translator.ShowLoadingIcon(false);
		},
		ProcText(text) {
			var buffer = "";
			var words = splits(text);
			for (var i in words) {
				var w = words[i];
				if (w.length > 2) {
					var r = Dictionary.GetEn(w);
					if (r !== null && r !== undefined)
						buffer += "<jwd><en>" + r + "</en>" + w + "</jwd>";
					else
						buffer += "<jwd><en w='" + w.trim().toLowerCase() + "'></en>" + w + "</jwd>";
				} else {
					buffer += w;
				}
			}
			return buffer;
		},
		ProcParagraph(index) {
			Translator.ProcNode(this);
			Dictionary.TriggerDownload();
		},
		ProcNode(node) {
			var tmp = $("<div>");
			var $node = $(node);
			$(node.childNodes).appendTo(tmp);

			tmp.contents().toArray().forEach(function (child) {
				if (child.nodeName === "#text")
					$node.append(Translator.ProcText(child.textContent));
				else if (child.nodeName === "A" && child.className === "b")
					$node.append(child);
				else {
					Translator.ProcNode(child);
					$node.append(child);
				}
			});
		},
		InitLoadingIcon() {
			$("#content").after('<div id="loader-wrapper"><div id="loader"></div><div class="loader-section section-left"></div><div class="loader-section section-right"></div>')
			if ($("#loader-style").length === 0)
				$("body").append("<style id='loader-style'>#loader-wrapper{position:fixed;top:0;left:0;width:100%;height:100%;z-index:1000}#loader:after,#loader:before{content:'';position:absolute}#loader{display:block;position:relative;left:50%;top:50%;width:150px;height:150px;margin:-75px 0 0 -75px;border-radius:50%;border:3px solid transparent;border-top-color:#3498db;-webkit-animation:spin 2s linear infinite;animation:spin 2s linear infinite;z-index:1001}#loader:before{top:5px;left:5px;right:5px;bottom:5px;border-radius:50%;border:3px solid transparent;border-top-color:#e74c3c;-webkit-animation:spin 3s linear infinite;animation:spin 3s linear infinite}#loader:after{top:15px;left:15px;right:15px;bottom:15px;border-radius:50%;border:3px solid transparent;border-top-color:#f9c922;-webkit-animation:spin 1.5s linear infinite;animation:spin 1.5s linear infinite}@-webkit-keyframes spin{0%{-webkit-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}@keyframes spin{0%{-webkit-transform:rotate(0);-ms-transform:rotate(0);transform:rotate(0)}100%{-webkit-transform:rotate(360deg);-ms-transform:rotate(360deg);transform:rotate(360deg)}}#loader-wrapper .loader-section{position:fixed;top:0;width:51%;height:100%;z-index:1000}#loader-wrapper .loader-section.section-left{left:0}#loader-wrapper .loader-section.section-right{right:0}.loaded #loader-wrapper .loader-section.section-left{-webkit-transform:translateX(-100%);-ms-transform:translateX(-100%);transform:translateX(-100%);-webkit-transition:all .7s .3s cubic-bezier(.645,.045,.355,1);transition:all .7s .3s cubic-bezier(.645,.045,.355,1)}.loaded #loader-wrapper .loader-section.section-right{-webkit-transform:translateX(100%);-ms-transform:translateX(100%);transform:translateX(100%);-webkit-transition:all .7s .3s cubic-bezier(.645,.045,.355,1);transition:all .7s .3s cubic-bezier(.645,.045,.355,1)}.loaded #loader{opacity:0;-webkit-transition:all .3s ease-out;transition:all .3s ease-out}.loaded #loader-wrapper{visibility:hidden;-webkit-transform:translateY(-100%);-ms-transform:translateY(-100%);transform:translateY(-100%);-webkit-transition:all .3s 1s ease-out;transition:all .3s 1s ease-out}</style>");
		},

		ShowLoadingIcon(show) {
			if (show)
				Translator.InitLoadingIcon();
			else
				$("#loader-wrapper").remove();
		},
		LinkHandle() {
			$("a").bind("touchstart", function (e) {
				touchData.x = e.originalEvent.touches[0].screenX;
				touchData.y = e.originalEvent.touches[0].screenY;
			}).bind("touchend", function (e) {
				Translator.ProcLink(e.currentTarget);
			}).bind("mouseenter", function (e) { Translator.ProcLink(e.currentTarget); });
		},
		ProcLink(target) {
			if (target.className === "fb" || target.attributes["data-video"] !== undefined || target.className === "lnk")
				return;
			if ($(".tooltip").length > 0) {
				touchData.current = 0;
				if ($(".tooltipContent jwd").length > 0)
					return;

				Translator.InitLoadingIcon(true);
				$(".tooltipContent p[data-pid]").each(Translator.ProcParagraph);
			} else if (touchData.current === 0 || touchData.current === target) {
				touchData.current = target;
				setTimeout(Translator.ProcLink, 200, target)
			}
		}
	};
	var Dictionary = {
		pending: [],
		qeue: [],
		GetEn(word) {
			word = word.toLowerCase();
			var r = localStorage.getItem(langCode + "-" + targetLang + "-" + word);
			if (r !== null)
				return r;
			else {
				Dictionary.Qeue(word);
			}
		},
		Qeue(word) {
			var qeue = Dictionary.qeue;
			if (!qeue.includes(word))
				qeue.push(word);
		},
		TriggerDownload() {
			var d = Dictionary;
			if (d.pending.length === 0 && d.qeue.length > 0) {
				d.pending = d.qeue.slice(0, 100);
				d.qeue = d.qeue.slice(d.pending.length);
				var query = "";
				for (var i = 0; i < d.pending.length; ++i)
					query += "&text=" + d.pending[i];
				$.get("https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20151224T142049Z.759b08af73c0cdb9.fda4eaad62f70a77deabf469f04e161cfda554b4&lang=" + langCode + "-" + targetLang + "&format=text" + query, {}, function (data) {
					for (var i = 0; i < data.text.length; ++i) {
						var t = unescapeString((data.text[i])).trim().toLowerCase();
						localStorage.setItem(langCode + "-" + targetLang + "-" + d.pending[i], t);
						$("en[w='" + d.pending[i].replace(/'/g, "\\'") + "']").text(t).removeAttr("w");
					}
					d.pending = [];
					setTimeout(d.TriggerDownload, 50);
				}, "json");
			} else if (d.qeue.length === 0 && doneArticle) {
				Translator.ShowLoadingIcon(false);
			}
		}

	};
	if (window.location.hostname === "wol.jw.org" || window.location.hostname === "m.wol.jw.org")
		Translator.ProcessPage();
	else
		alert("Please use this script in supported websites or contact Jamie.");
})(jQuery);