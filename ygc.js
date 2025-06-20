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

const style = document.createElement('style');
style.textContent = `
	  ytd-rich-section-renderer {
		display: none !important; /* Hide the rich section renderer */
	  }
	`;

	function hideRichSectionsWithText() {
		document.querySelectorAll('ytd-rich-section-renderer').forEach(section => {
			const div = section.querySelector(':scope > div');
			const shelf = div && div.querySelector(':scope > ytd-rich-shelf-renderer[hidden="true"]');
			if (shelf) {
				section.style.display = 'none';
			}
		});
	}

	// Initial hide
	hideRichSectionsWithText();

	// Observe for dynamically added sections
	const sectionObserver = new MutationObserver(hideRichSectionsWithText);
	sectionObserver.observe(document.body, { childList: true, subtree: true });

waitForElement('ytd-rich-grid-renderer')
	.then(async () => {
		const getting = await browser.storage.sync.get('ygcColumnCount');

		if (!getting.ygcColumnCount) {
			browser.storage.sync.set({
				ygcColumnCount: 6,
			});
		}

		applyColumnCount(getting.ygcColumnCount || '6');

		const getting2 = await browser.storage.sync.get('ygcHideRichContent');
		if (getting2.ygcHideRichContent) {
			document.head.appendChild(style);
		}
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
		document.head.appendChild(style);
	} else {
		document.head.removeChild(style);
	}
});
