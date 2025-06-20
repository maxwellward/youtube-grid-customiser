// Wait for page to fully load before updating the grid layout
function waitForElement(selector, timeout = 5000) {
	return new Promise((resolve, reject) => {
		const el = document.querySelector(selector);
		if (el) return resolve(el);

		const observer = new MutationObserver(() => {
			const el = document.querySelector(selector);
			if (el) {
				observer.disconnect();
				resolve(el);
			}
		});

		observer.observe(document.body, { childList: true, subtree: true });

		setTimeout(() => {
			observer.disconnect();
			reject('Element not found in time');
		}, timeout);
	});
}

// Remove rich sections that are already hidden and causing issues with the grid layout
function hideInvisibleRichSections() {
	document.querySelectorAll('ytd-rich-section-renderer').forEach((section) => {
		const div = section.querySelector(':scope > div');
		const shelf = div && div.querySelector(':scope > ytd-rich-shelf-renderer[hidden="true"]');
		if (shelf) {
			section.style.display = 'none';
		}
	});
}

const richSectionHider = document.createElement('style');
richSectionHider.textContent = `
	  ytd-rich-section-renderer {
		display: none !important; /* Hide the rich section renderer */
	  }
	`;

waitForElement('ytd-rich-grid-renderer')
	.then(async () => {
		const settings = await browser.storage.sync.get({
			ygcColumnCount: 6,
			ygcHideRichContent: false
		});
		
		if (settings.ygcHideRichContent || settings.ygcHideRichContent === undefined) {
			document.head.appendChild(richSectionHider);
		}

		applyColumnCount(settings.ygcColumnCount || '6');
	})
	.catch(console.warn);


function applyColumnCount(columnCount) {
	const el = document.getElementById('contents');
	if (el) {
		el.style.setProperty('--ytd-rich-grid-items-per-row', columnCount || '6');
	}
}

browser.storage.onChanged.addListener((changes, area) => {
	if (changes.ygcColumnCount) {
		applyColumnCount(changes.ygcColumnCount.newValue);
	}

	if (changes.ygcHideRichContent.newValue === true) {
		document.head.appendChild(richSectionHider);
	} else {
		document.head.removeChild(richSectionHider);
	}
});


// Initial hide
hideInvisibleRichSections();

// Observe for dynamically added sections
const sectionObserver = new MutationObserver(hideInvisibleRichSections);
sectionObserver.observe(document.body, { childList: true, subtree: true });
