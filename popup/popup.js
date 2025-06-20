function saveOptions(e) {
	e.preventDefault();
	browser.storage.sync.set({
		ygcColumnCount: document.querySelector("#ygcColumnCount").value,
		ygcHideRichContent: document.querySelector("#ygcHideRichContent").checked
	});
	window.location.reload();
}

function restoreOptions() {
	function setCurrentChoice(result) {
		document.querySelector("#ygcColumnCount").value = result.ygcColumnCount || "6";
		document.querySelector("#ygcHideRichContent").checked = result.ygcHideRichContent || false;
	}

	function onError(error) {
		console.log(`Error: ${error}`);
	}

	let getting = browser.storage.sync.get(["ygcColumnCount", "ygcHideRichContent"]);
	getting.then(setCurrentChoice, onError);
}

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
document.querySelector("#githubLink").addEventListener("click", function() {
	setTimeout(() => {
		window.close();
	}, 1);
});
