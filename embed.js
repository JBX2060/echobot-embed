if (document.readyState !== "loading") {
	var widgetExists = document.getElementById("echoWidgetLoadingElem");
	if (!widgetExists) {
		initWidget();
	}
} else {
	document.addEventListener("DOMContentLoaded", function () {
		var widgetExists = document.getElementById("echoWidgetLoadingElem");
		if (!widgetExists) {
			initWidget();
		}
	});
}

function setUTMCookie() {
	const url = new URL(window.location.href);
	const utmParams = [
		"utm_source",
		"utm_medium",
		"utm_campaign",
		"utm_term",
		"utm_content",
	];
	let hasUTM = false;
	let utmData = {};

	utmParams.forEach((param) => {
		let value = url.searchParams.get(param);
		if (value) {
			utmData[param] = value;
			hasUTM = true;
		}
	});

	if (hasUTM) {
		document.cookie = `utm_data=${JSON.stringify(utmData)}; max-age=${30 * 24 * 60 * 60}; path=/`;
	} else {
		let cookieData = document.cookie
			.split("; ")
			.find((row) => row.startsWith("utm_data="));

		if (cookieData) {
			utmData = JSON.parse(cookieData.split("=")[1]);
		}
	}

	return utmData;
}

function initWidget() {
	// Need share ID to fetch bot's image
	var scripts = document.getElementsByTagName("script");
	var shareId = "";
	for (let i = 0; i < scripts.length; i++) {
		if (
			scripts[i]?.src?.includes("bubble-embed.js") &&
			scripts[i]?.getAttribute("shareId")
		) {
			shareId = scripts[i].getAttribute("shareId");
		}
	}

	let embedOpen = false;

	let styleBase = `position:fixed;width:396px;height:70vh; bottom:52px; right: 32px;z-index:999999; opacity:0; transition: all 300ms ease-in-out; pointer-events:none; border:1px solid #EBEBEB; border-radius: 16px; background:${
		window.echobotEmbed?.split("&")[4]?.split("=")?.pop() === "true"
			? "#141414"
			: "#fff"
	}; box-shadow: 0px 10px 16px rgba(0, 0, 0, 0.25); `;
	let styleBaseTooltip = `position:fixed;width:396px;height:auto; bottom:90px; right: 30px;z-index:999990; border:none; pointer-events:none;`;
	let styleDivTooltip = `position:fixed;width:396px;height:200px; bottom:90px; right: 30px;z-index:999990;`;
	let styleImgDefault =
		"position:fixed; width:48px;height:48px; object-fit: cover; bottom:40px; right: 40px;z-index:9999999;background:#000;border-radius:50%; transition: transform 300ms ease-in-out, box-shadow 1500ms ease-in-out; cursor:pointer; box-shadow:0px 0px 8px 3px rgba(0,0,0, 0.2); ";

	const vw = Math.max(
		document.documentElement.clientWidth || 0,
		window.innerWidth || 0
	);

	if (vw < 480) {
		styleBase = `position:fixed;width:calc(100% - 24px); height:calc(100% - 24px); bottom:24px; left: 12px;z-index:999999; opacity:0; transition: opacity 300ms ease-in-out; pointer-events:none; border:1px solid #EBEBEB; border-radius: 16px; box-shadow: 0px 16px 48px rgba(0, 0, 0, 0.07); background:${
			window.echobotEmbed?.split("&")[4]?.split("=")?.pop() === "true"
				? "#141414"
				: "#fff"
		}; box-shadow: 0px 10px 16px rgba(0, 0, 0, 0.25);`;
		styleImgDefault = styleImgDefault + "bottom:20px; right:20px;";
		styleBaseTooltip = `position:fixed;width: calc(100% - 90px);height:auto; bottom:10px; right: 80px;z-index:999990; border:none; pointer-events:none;`;
		styleDivTooltip = `position:fixed;width: calc(100% - 90px);height:auto; bottom:10px; right: 80px;height:200px; z-index:999990;`;
	}
	const styleImgHover = styleImgDefault + "transform:scale(1.10);";

	const styleImgPulse =
		styleImgDefault + "box-shadow:0px 0px 16px 3px rgba(0,0,0, 0.8);";

	const styleOpen = styleBase + "opacity:1; pointer-events:auto;";
	const elemLoading = document.createElement("div");
	elemLoading.setAttribute("id", "echoWidgetLoadingElem");

	const styleLoading =
		'background:url("https://www.echobot.ai/loading-ring-black.svg") center center no-repeat;';

	elemLoading.style.cssText = styleBase + styleLoading;

	let isLoaded = false; // variable to track iframe loading status

	// other code here...
	const toggleEmbed = () => {
		embedOpen = !embedOpen;
		elemIframeTooltip.style.cssText = "opacity:0;";
		divIframe.style.cssText = "pointer-events: none;";

		if (embedOpen) {
			if (!isLoaded) {
				// if iframe is not loaded yet
				// Show loading div when iframe is loading
				elemLoading.style.cssText =
					styleBase + styleLoading + " opacity:1; pointer-events:auto;";
				divIframe.hidden = false;
				elemIframe.style.cssText = styleOpen;
			} else {
				// if iframe is already loaded
				elemIframe.style.cssText = styleOpen;
				divIframe.hidden = false;
				elemLoading.style.cssText =
					styleBase + styleLoading + " opacity:0; pointer-events:none;";
			}
		} else {
			elemLoading.style.cssText =
				styleBase +
				styleLoading +
				" display:none; opacity:0; pointer-events:none;";
			elemIframe.style.cssText = styleBase;
			divIframe.hidden = true;
		}
	};

	const imgHover = () => {
		elemImg.style.cssText = styleImgHover;
	};
	const imgDefault = () => {
		elemImg.style.cssText = styleImgDefault;
	};

	const elemImg = document.createElement("img");
	elemImg.hidden = true;
	elemImg.style.cssText = styleImgDefault;

	elemImg.addEventListener("click", () => {
		toggleEmbed();
	});
	elemImg.addEventListener("mouseover", imgHover);
	elemImg.addEventListener("mouseout", imgDefault);

	// Fetch bot's saved custom image
	if (shareId != "") {
		const fetchBotImageUrl = `https://portal.echobot.ai/api/chat/shareChat/fetchModelImage?shareId=${shareId}`;
		fetch(fetchBotImageUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((responseData) => {
				const { data: botAvatar } = responseData;
				if (botAvatar && botAvatar != "") {
					// Set custom bot image
					elemImg.src = botAvatar;
					setTimeout(() => {
						elemImg.hidden = false;
					}, 50);
				} else {
					// Set default bot image
					elemImg.src = "https://www.echobot.ai/images/logo.png";
					elemImg.hidden = false;
				}
			})
			.catch((error) => {
				// Set default bot image
				elemImg.src = "https://www.echobot.ai/images/logo.png";
				elemImg.hidden = false;
				console.log("error - ", error);
			});

		// Used to fetch amount of time before open widget window
		const fetchBotAutoOpen = `https://portal.echobot.ai/api/chat/shareChat/fetchWidgetAutoOpen?shareId=${shareId}`;
		fetch(fetchBotAutoOpen)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Network response was not ok");
				}
				return response.json();
			})
			.then((responseData) => {
				const { data: widgetAutoOpen } = responseData;
				if (
					widgetAutoOpen &&
					widgetAutoOpen != "0" &&
					!isNaN(Number(widgetAutoOpen))
				) {
					// Auto open widget after X seconds if enabled
					// and bot widget is closed
					setTimeout(() => {
						if (embedOpen == false) {
							toggleEmbed();
						}
					}, (Number(widgetAutoOpen) - 0.5) * 1000);
				}
			})
			.catch((error) => {
				console.log("error - ", error);
			});
	}

	const utmData = setUTMCookie();
	
	// Pass any UTM parameters from the cookie onto the iframe source URL
	let widgetUrl = new URL("https://portal.echobot.ai/chat/share?shareId=" + shareId);
	Object.keys(utmData).forEach((key) => {
		widgetUrl.searchParams.set(key, utmData[key]);
	});

	const elemIframe = document.createElement("iframe");
	elemIframe.src = widgetUrl.toString();

	elemIframe.allow = "clipboard-write; microphone";
	elemIframe.style.cssText = styleBase;

	const divIframe = document.createElement("div");
	const elemIframeTooltip = document.createElement("iframe");
	elemIframeTooltip.src =
		"https://portal.echobot.ai/chat/share?shareId=" + shareId;

	elemIframeTooltip.style.cssText = styleBaseTooltip;
	divIframe.style.cssText = styleDivTooltip;
	divIframe.appendChild(elemIframeTooltip);

	divIframe.addEventListener("click", () => {
		toggleEmbed();
	});

	const pulseIn = () => {
		elemImg.style.cssText = styleImgPulse;
		setTimeout(() => pulseOut(), 1500);
	};

	const pulseOut = () => {
		elemImg.style.cssText = styleImgDefault;
		setTimeout(() => pulseIn(), 1500);
	};

	elemIframe.onload = function () {
		isLoaded = true; // update loading status
		elemLoading.style.cssText =
			styleBase + styleLoading + " opacity:0; pointer-events:none;";
	};

	divIframe.hidden = true; // Initially hide the iframe

	document.body.appendChild(elemImg);
	document.body.appendChild(elemIframe);
	document.body.appendChild(elemLoading);
	document.body.appendChild(divIframe);

	pulseIn();
}
